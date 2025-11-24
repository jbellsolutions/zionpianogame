using System.Collections.Generic;
using UnityEngine;
using EduCraft.Core;

namespace EduCraft.World
{
    /// <summary>
    /// Manages world generation, chunk loading/unloading, and block operations
    /// </summary>
    public class WorldManager : MonoBehaviour
    {
        public static WorldManager Instance { get; private set; }

        [Header("World Settings")]
        public Material worldMaterial;
        public Transform player;
        public GameObject chunkPrefab;

        [Header("Block Database")]
        private Dictionary<BlockType, Block> blockDatabase = new Dictionary<BlockType, Block>();

        // Chunk management
        private Dictionary<Vector3Int, Chunk> activeChunks = new Dictionary<Vector3Int, Chunk>();
        private Vector3Int currentPlayerChunkCoord;
        private Vector3Int previousPlayerChunkCoord;

        void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }

            InitializeBlockDatabase();
        }

        void Start()
        {
            if (player == null)
            {
                player = GameObject.FindGameObjectWithTag("Player")?.transform;
            }

            if (chunkPrefab == null)
            {
                // Create default chunk prefab
                chunkPrefab = new GameObject("ChunkPrefab");
                chunkPrefab.AddComponent<MeshFilter>();
                chunkPrefab.AddComponent<MeshRenderer>().material = worldMaterial;
                chunkPrefab.AddComponent<MeshCollider>();
                chunkPrefab.AddComponent<Chunk>();
                chunkPrefab.SetActive(false);
            }

            // Generate initial chunks around spawn point
            currentPlayerChunkCoord = VoxelData.GetChunkCoordFromVector3(player.position);
            GenerateChunksAroundPlayer();
        }

        void Update()
        {
            // Check if player moved to a new chunk
            currentPlayerChunkCoord = VoxelData.GetChunkCoordFromVector3(player.position);

            if (!currentPlayerChunkCoord.Equals(previousPlayerChunkCoord))
            {
                UpdateChunks();
                previousPlayerChunkCoord = currentPlayerChunkCoord;
            }
        }

        /// <summary>
        /// Initialize the block database with all block types
        /// </summary>
        void InitializeBlockDatabase()
        {
            // Add all block types to the database
            foreach (BlockType blockType in System.Enum.GetValues(typeof(BlockType)))
            {
                blockDatabase[blockType] = new Block(blockType);
            }
        }

        /// <summary>
        /// Get block data for a specific block type
        /// </summary>
        public Block GetBlockData(BlockType blockType)
        {
            if (blockDatabase.ContainsKey(blockType))
            {
                return blockDatabase[blockType];
            }

            Debug.LogError($"Block type {blockType} not found in database!");
            return blockDatabase[BlockType.Air];
        }

        /// <summary>
        /// Generate chunks around the player's current position
        /// </summary>
        void GenerateChunksAroundPlayer()
        {
            for (int x = -VoxelData.ViewDistanceInChunks; x <= VoxelData.ViewDistanceInChunks; x++)
            {
                for (int z = -VoxelData.ViewDistanceInChunks; z <= VoxelData.ViewDistanceInChunks; z++)
                {
                    Vector3Int chunkCoord = new Vector3Int(
                        currentPlayerChunkCoord.x + x,
                        0,
                        currentPlayerChunkCoord.z + z
                    );

                    if (!activeChunks.ContainsKey(chunkCoord))
                    {
                        CreateChunk(chunkCoord);
                    }
                }
            }
        }

        /// <summary>
        /// Update chunks when player moves to a new chunk
        /// </summary>
        void UpdateChunks()
        {
            List<Vector3Int> chunksToRemove = new List<Vector3Int>();

            // Check which chunks should be unloaded
            foreach (var chunkCoord in activeChunks.Keys)
            {
                if (Vector3.Distance(
                    new Vector3(chunkCoord.x, 0, chunkCoord.z),
                    new Vector3(currentPlayerChunkCoord.x, 0, currentPlayerChunkCoord.z)
                ) > VoxelData.ViewDistanceInChunks)
                {
                    chunksToRemove.Add(chunkCoord);
                }
            }

            // Unload far chunks
            foreach (var chunkCoord in chunksToRemove)
            {
                if (activeChunks.ContainsKey(chunkCoord))
                {
                    Destroy(activeChunks[chunkCoord].gameObject);
                    activeChunks.Remove(chunkCoord);
                }
            }

            // Load new chunks
            GenerateChunksAroundPlayer();
        }

        /// <summary>
        /// Create a new chunk at the specified coordinate
        /// </summary>
        void CreateChunk(Vector3Int chunkCoord)
        {
            GameObject chunkObject = Instantiate(chunkPrefab, transform);
            chunkObject.name = $"Chunk_{chunkCoord.x}_{chunkCoord.z}";
            chunkObject.SetActive(true);

            Chunk chunk = chunkObject.GetComponent<Chunk>();
            chunk.chunkCoord = chunkCoord;
            chunk.worldManager = this;

            activeChunks[chunkCoord] = chunk;
        }

        /// <summary>
        /// Get block at world position
        /// </summary>
        public BlockType GetBlockAtPosition(Vector3 worldPos)
        {
            Vector3Int chunkCoord = VoxelData.GetChunkCoordFromVector3(worldPos);

            if (activeChunks.ContainsKey(chunkCoord))
            {
                Chunk chunk = activeChunks[chunkCoord];
                int x = Mathf.FloorToInt(worldPos.x) - chunkCoord.x * VoxelData.ChunkWidth;
                int y = Mathf.FloorToInt(worldPos.y);
                int z = Mathf.FloorToInt(worldPos.z) - chunkCoord.z * VoxelData.ChunkWidth;

                return chunk.GetBlock(x, y, z);
            }

            return BlockType.Air;
        }

        /// <summary>
        /// Set block at world position
        /// </summary>
        public void SetBlockAtPosition(Vector3 worldPos, BlockType blockType)
        {
            Vector3Int chunkCoord = VoxelData.GetChunkCoordFromVector3(worldPos);

            if (activeChunks.ContainsKey(chunkCoord))
            {
                Chunk chunk = activeChunks[chunkCoord];
                int x = Mathf.FloorToInt(worldPos.x) - chunkCoord.x * VoxelData.ChunkWidth;
                int y = Mathf.FloorToInt(worldPos.y);
                int z = Mathf.FloorToInt(worldPos.z) - chunkCoord.z * VoxelData.ChunkWidth;

                chunk.SetBlock(x, y, z, blockType);
                chunk.UpdateMesh();

                // Update neighboring chunks if block is on chunk edge
                UpdateNeighboringChunks(x, y, z, chunkCoord);
            }
        }

        /// <summary>
        /// Update neighboring chunks when a block on chunk edge is modified
        /// </summary>
        void UpdateNeighboringChunks(int x, int y, int z, Vector3Int chunkCoord)
        {
            // Check if block is on chunk edge and update adjacent chunk
            if (x == 0)
                UpdateChunkMesh(new Vector3Int(chunkCoord.x - 1, 0, chunkCoord.z));
            else if (x == VoxelData.ChunkWidth - 1)
                UpdateChunkMesh(new Vector3Int(chunkCoord.x + 1, 0, chunkCoord.z));

            if (z == 0)
                UpdateChunkMesh(new Vector3Int(chunkCoord.x, 0, chunkCoord.z - 1));
            else if (z == VoxelData.ChunkWidth - 1)
                UpdateChunkMesh(new Vector3Int(chunkCoord.x, 0, chunkCoord.z + 1));
        }

        /// <summary>
        /// Update mesh of chunk at coordinate
        /// </summary>
        void UpdateChunkMesh(Vector3Int chunkCoord)
        {
            if (activeChunks.ContainsKey(chunkCoord))
            {
                activeChunks[chunkCoord].UpdateMesh();
            }
        }
    }
}
