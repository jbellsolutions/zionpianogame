using UnityEngine;

namespace EduCraft.Core
{
    /// <summary>
    /// Enum defining all block types in the game
    /// </summary>
    public enum BlockType
    {
        Air = 0,
        Grass = 1,
        Dirt = 2,
        Stone = 3,
        Bedrock = 4,
        Sand = 5,
        Water = 6,
        Wood = 7,
        Leaves = 8,
        CoalOre = 9,
        IronOre = 10,
        GoldOre = 11,
        DiamondOre = 12,
        CraftingTable = 13,
        Planks = 14,
        Glass = 15,
        Cobblestone = 16,

        // Educational blocks
        KnowledgeBlockEasy = 50,
        KnowledgeBlockMedium = 51,
        KnowledgeBlockHard = 52,

        // Reward blocks (unlocked through learning)
        GlowStone = 60,
        MagicWood = 61,
        CrystalBlock = 62,
        RainbowBlock = 63,
        CloudBlock = 64
    }
}
