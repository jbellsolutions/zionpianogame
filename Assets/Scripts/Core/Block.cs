using UnityEngine;

namespace EduCraft.Core
{
    /// <summary>
    /// Base block class containing all properties of a block type
    /// </summary>
    [System.Serializable]
    public class Block
    {
        public BlockType blockType;
        public string blockName;
        public bool isSolid;
        public bool isTransparent;
        public bool isLiquid;
        public bool isInteractable;

        [Header("Rendering")]
        public int topTextureID;
        public int bottomTextureID;
        public int sideTextureID;

        [Header("Game Properties")]
        public float hardness = 1f; // Time to break
        public bool isFlammable;
        public int lightEmission = 0; // 0-15

        [Header("Drops")]
        public BlockType dropsBlockType;
        public int dropCount = 1;

        public Block(BlockType type)
        {
            this.blockType = type;
            InitializeDefaults();
        }

        private void InitializeDefaults()
        {
            // Set default properties based on block type
            switch (blockType)
            {
                case BlockType.Air:
                    isSolid = false;
                    isTransparent = true;
                    blockName = "Air";
                    break;

                case BlockType.Grass:
                    isSolid = true;
                    blockName = "Grass";
                    topTextureID = 0;
                    bottomTextureID = 2;
                    sideTextureID = 1;
                    dropsBlockType = BlockType.Dirt;
                    break;

                case BlockType.Dirt:
                    isSolid = true;
                    blockName = "Dirt";
                    topTextureID = 2;
                    bottomTextureID = 2;
                    sideTextureID = 2;
                    dropsBlockType = BlockType.Dirt;
                    break;

                case BlockType.Stone:
                    isSolid = true;
                    blockName = "Stone";
                    hardness = 1.5f;
                    topTextureID = 3;
                    bottomTextureID = 3;
                    sideTextureID = 3;
                    dropsBlockType = BlockType.Cobblestone;
                    break;

                case BlockType.KnowledgeBlockEasy:
                case BlockType.KnowledgeBlockMedium:
                case BlockType.KnowledgeBlockHard:
                    isSolid = true;
                    isInteractable = true;
                    lightEmission = 8;
                    blockName = "Knowledge Block";
                    dropsBlockType = blockType; // Drops itself
                    break;

                default:
                    isSolid = true;
                    dropsBlockType = blockType;
                    break;
            }
        }

        /// <summary>
        /// Get texture ID for a specific face of the block
        /// </summary>
        public int GetTextureID(int faceIndex)
        {
            // faceIndex: 0=top, 1=bottom, 2-5=sides
            if (faceIndex == 0) return topTextureID;
            if (faceIndex == 1) return bottomTextureID;
            return sideTextureID;
        }
    }
}
