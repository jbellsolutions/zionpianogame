using System.Collections.Generic;
using UnityEngine;
using EduCraft.Core;

namespace EduCraft.World
{
    /// <summary>
    /// Represents a single chunk (16x256x16 blocks) in the world
    /// </summary>
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer), typeof(MeshCollider))]
    public class Chunk : MonoBehaviour
    {
        public Vector3Int chunkCoord;
        public WorldManager worldManager;

        private BlockType[,,] blockMap = new BlockType[VoxelData.ChunkWidth, VoxelData.ChunkHeight, VoxelData.ChunkWidth];
        private MeshFilter meshFilter;
        private MeshRenderer meshRenderer;
        private MeshCollider meshCollider;

        private List<Vector3> vertices = new List<Vector3>();
        private List<int> triangles = new List<int>();
        private List<Vector2> uvs = new List<Vector2>();
        private int vertexIndex = 0;

        public bool isGenerated = false;

        void Start()
        {
            meshFilter = GetComponent<MeshFilter>();
            meshRenderer = GetComponent<MeshRenderer>();
            meshCollider = GetComponent<MeshCollider>();

            transform.position = new Vector3(
                chunkCoord.x * VoxelData.ChunkWidth,
                0,
                chunkCoord.z * VoxelData.ChunkWidth
            );

            GenerateChunk();
            CreateMesh();
        }

        /// <summary>
        /// Generate the chunk's block data using procedural generation
        /// </summary>
        void GenerateChunk()
        {
            for (int x = 0; x < VoxelData.ChunkWidth; x++)
            {
                for (int z = 0; z < VoxelData.ChunkWidth; z++)
                {
                    // Calculate world position for noise sampling
                    float worldX = x + chunkCoord.x * VoxelData.ChunkWidth;
                    float worldZ = z + chunkCoord.z * VoxelData.ChunkWidth;

                    // Generate terrain height using Perlin noise
                    int terrainHeight = GetTerrainHeight(worldX, worldZ);

                    for (int y = 0; y < VoxelData.ChunkHeight; y++)
                    {
                        BlockType blockType = BlockType.Air;

                        if (y == 0)
                        {
                            blockType = BlockType.Bedrock; // Unbreakable bottom layer
                        }
                        else if (y <= terrainHeight)
                        {
                            if (y == terrainHeight)
                            {
                                blockType = BlockType.Grass; // Top layer
                            }
                            else if (y > terrainHeight - 4)
                            {
                                blockType = BlockType.Dirt; // 3 layers of dirt
                            }
                            else
                            {
                                blockType = BlockType.Stone; // Stone below

                                // Add ore generation
                                blockType = GenerateOres(worldX, y, worldZ, blockType);
                            }
                        }
                        else if (y <= 64 && terrainHeight < 64)
                        {
                            blockType = BlockType.Water; // Water level at y=64
                        }

                        blockMap[x, y, z] = blockType;
                    }

                    // Randomly spawn Knowledge Blocks on the surface
                    if (Random.value < 0.01f) // 1% chance
                    {
                        int blockY = terrainHeight + 1;
                        if (blockY < VoxelData.ChunkHeight)
                        {
                            BlockType knowledgeType = (BlockType)Random.Range(50, 53); // Easy, Medium, or Hard
                            blockMap[x, blockY, z] = knowledgeType;
                        }
                    }
                }
            }

            isGenerated = true;
        }

        /// <summary>
        /// Get terrain height at world position using Perlin noise
        /// </summary>
        int GetTerrainHeight(float x, float z)
        {
            // Layer multiple noise octaves for more interesting terrain
            float baseHeight = Mathf.PerlinNoise(x * 0.01f, z * 0.01f) * 30f; // Large features
            float detail = Mathf.PerlinNoise(x * 0.05f, z * 0.05f) * 10f; // Small details

            int height = Mathf.FloorToInt(baseHeight + detail) + 70; // Base at y=70
            return Mathf.Clamp(height, 1, VoxelData.ChunkHeight - 1);
        }

        /// <summary>
        /// Generate ore veins using 3D Perlin noise
        /// </summary>
        BlockType GenerateOres(float x, float y, float z, BlockType currentBlock)
        {
            // Coal ore (common, high altitude)
            if (y > 40 && Mathf.PerlinNoise(x * 0.1f, z * 0.1f) > 0.7f)
                return BlockType.CoalOre;

            // Iron ore (medium depth)
            if (y > 20 && y < 60 && Mathf.PerlinNoise(x * 0.08f, z * 0.08f) > 0.75f)
                return BlockType.IronOre;

            // Gold ore (deep)
            if (y > 5 && y < 35 && Mathf.PerlinNoise(x * 0.06f, z * 0.06f) > 0.8f)
                return BlockType.GoldOre;

            // Diamond ore (very deep and rare)
            if (y > 5 && y < 20 && Mathf.PerlinNoise(x * 0.04f, z * 0.04f) > 0.85f)
                return BlockType.DiamondOre;

            return currentBlock;
        }

        /// <summary>
        /// Create the mesh for this chunk using greedy meshing optimization
        /// </summary>
        void CreateMesh()
        {
            vertices.Clear();
            triangles.Clear();
            uvs.Clear();
            vertexIndex = 0;

            // Iterate through all blocks in the chunk
            for (int x = 0; x < VoxelData.ChunkWidth; x++)
            {
                for (int y = 0; y < VoxelData.ChunkHeight; y++)
                {
                    for (int z = 0; z < VoxelData.ChunkWidth; z++)
                    {
                        BlockType blockType = blockMap[x, y, z];

                        if (blockType != BlockType.Air)
                        {
                            AddBlockMesh(x, y, z, blockType);
                        }
                    }
                }
            }

            // Create the mesh
            Mesh mesh = new Mesh();
            mesh.vertices = vertices.ToArray();
            mesh.triangles = triangles.ToArray();
            mesh.uv = uvs.ToArray();
            mesh.RecalculateNormals();

            meshFilter.mesh = mesh;
            meshCollider.sharedMesh = mesh;
        }

        /// <summary>
        /// Add mesh data for a single block
        /// </summary>
        void AddBlockMesh(int x, int y, int z, BlockType blockType)
        {
            Block block = worldManager.GetBlockData(blockType);
            Vector3 blockPos = new Vector3(x, y, z);

            // Check each face of the block
            for (int faceIndex = 0; faceIndex < 6; faceIndex++)
            {
                Vector3Int neighbor = new Vector3Int(x, y, z) + VoxelData.FaceChecks[faceIndex];

                // Only render face if neighbor is transparent
                if (!IsBlockSolid(neighbor))
                {
                    // Add vertices
                    for (int i = 0; i < 4; i++)
                    {
                        int vertIndex = VoxelData.VoxelTris[faceIndex, i];
                        vertices.Add(blockPos + VoxelData.VoxelVerts[vertIndex]);
                    }

                    // Add UVs
                    int textureID = block.GetTextureID(faceIndex);
                    Vector2[] faceUVs = VoxelData.GetUVsForTexture(textureID);
                    uvs.AddRange(faceUVs);

                    // Add triangles
                    triangles.Add(vertexIndex);
                    triangles.Add(vertexIndex + 1);
                    triangles.Add(vertexIndex + 2);
                    triangles.Add(vertexIndex);
                    triangles.Add(vertexIndex + 2);
                    triangles.Add(vertexIndex + 3);

                    vertexIndex += 4;
                }
            }
        }

        /// <summary>
        /// Check if a block at the given position is solid
        /// </summary>
        bool IsBlockSolid(Vector3Int pos)
        {
            // Check bounds
            if (pos.x < 0 || pos.x >= VoxelData.ChunkWidth ||
                pos.y < 0 || pos.y >= VoxelData.ChunkHeight ||
                pos.z < 0 || pos.z >= VoxelData.ChunkWidth)
            {
                return false; // Treat out of bounds as air for now
            }

            BlockType blockType = blockMap[pos.x, pos.y, pos.z];
            if (blockType == BlockType.Air) return false;

            Block block = worldManager.GetBlockData(blockType);
            return block.isSolid && !block.isTransparent;
        }

        /// <summary>
        /// Get block at position within this chunk
        /// </summary>
        public BlockType GetBlock(int x, int y, int z)
        {
            if (x < 0 || x >= VoxelData.ChunkWidth ||
                y < 0 || y >= VoxelData.ChunkHeight ||
                z < 0 || z >= VoxelData.ChunkWidth)
            {
                return BlockType.Air;
            }

            return blockMap[x, y, z];
        }

        /// <summary>
        /// Set block at position within this chunk
        /// </summary>
        public void SetBlock(int x, int y, int z, BlockType blockType)
        {
            if (x < 0 || x >= VoxelData.ChunkWidth ||
                y < 0 || y >= VoxelData.ChunkHeight ||
                z < 0 || z >= VoxelData.ChunkWidth)
            {
                return;
            }

            blockMap[x, y, z] = blockType;
        }

        /// <summary>
        /// Update the chunk's mesh (call after modifying blocks)
        /// </summary>
        public void UpdateMesh()
        {
            CreateMesh();
        }
    }
}
