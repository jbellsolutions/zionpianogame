using UnityEngine;

namespace EduCraft.Core
{
    /// <summary>
    /// Static class containing voxel mesh data and helper functions
    /// </summary>
    public static class VoxelData
    {
        // World settings
        public const int ChunkWidth = 16;
        public const int ChunkHeight = 256;
        public const int WorldSizeInChunks = 100; // Total world size in chunks
        public const int ViewDistanceInChunks = 8; // How many chunks to render around player

        // Texture atlas settings
        public const int TextureAtlasSizeInBlocks = 16; // 16x16 blocks in texture atlas
        public static float NormalizedBlockTextureSize => 1f / TextureAtlasSizeInBlocks;

        // Vertices of a cube (8 corners)
        public static readonly Vector3[] VoxelVerts = new Vector3[8]
        {
            new Vector3(0f, 0f, 0f), // 0
            new Vector3(1f, 0f, 0f), // 1
            new Vector3(1f, 1f, 0f), // 2
            new Vector3(0f, 1f, 0f), // 3
            new Vector3(0f, 0f, 1f), // 4
            new Vector3(1f, 0f, 1f), // 5
            new Vector3(1f, 1f, 1f), // 6
            new Vector3(0f, 1f, 1f)  // 7
        };

        // Face check vectors (which direction each face points)
        public static readonly Vector3Int[] FaceChecks = new Vector3Int[6]
        {
            new Vector3Int(0, 1, 0),   // Top
            new Vector3Int(0, -1, 0),  // Bottom
            new Vector3Int(0, 0, -1),  // Back
            new Vector3Int(0, 0, 1),   // Front
            new Vector3Int(-1, 0, 0),  // Left
            new Vector3Int(1, 0, 0)    // Right
        };

        // Triangle indices for each face (2 triangles per face = 6 vertices)
        public static readonly int[,] VoxelTris = new int[6, 4]
        {
            {3, 7, 6, 2}, // Top
            {1, 5, 4, 0}, // Bottom
            {3, 2, 1, 0}, // Back
            {7, 4, 5, 6}, // Front
            {3, 0, 4, 7}, // Left
            {2, 6, 5, 1}  // Right
        };

        // UV coordinates for texture mapping
        public static readonly Vector2[] VoxelUvs = new Vector2[4]
        {
            new Vector2(0f, 0f),
            new Vector2(0f, 1f),
            new Vector2(1f, 1f),
            new Vector2(1f, 0f)
        };

        /// <summary>
        /// Convert world position to chunk coordinate
        /// </summary>
        public static Vector3Int GetChunkCoordFromVector3(Vector3 pos)
        {
            int x = Mathf.FloorToInt(pos.x / ChunkWidth);
            int y = 0; // We don't use vertical chunks
            int z = Mathf.FloorToInt(pos.z / ChunkWidth);
            return new Vector3Int(x, y, z);
        }

        /// <summary>
        /// Get UV coordinates for a texture in the atlas
        /// </summary>
        public static Vector2[] GetUVsForTexture(int textureID)
        {
            float y = textureID / TextureAtlasSizeInBlocks;
            float x = textureID - (y * TextureAtlasSizeInBlocks);

            x *= NormalizedBlockTextureSize;
            y *= NormalizedBlockTextureSize;

            y = 1f - y - NormalizedBlockTextureSize; // Flip Y

            Vector2[] uvs = new Vector2[4];
            uvs[0] = new Vector2(x, y);
            uvs[1] = new Vector2(x, y + NormalizedBlockTextureSize);
            uvs[2] = new Vector2(x + NormalizedBlockTextureSize, y + NormalizedBlockTextureSize);
            uvs[3] = new Vector2(x + NormalizedBlockTextureSize, y);

            return uvs;
        }
    }
}
