using UnityEngine;
using EduCraft.Core;

namespace EduCraft.Crafting
{
    /// <summary>
    /// Defines a crafting recipe
    /// </summary>
    [CreateAssetMenu(fileName = "New Recipe", menuName = "EduCraft/Crafting Recipe")]
    public class CraftingRecipe : ScriptableObject
    {
        public string recipeName;
        public BlockType result;
        public int resultCount = 1;

        [Header("Recipe Pattern (3x3 grid)")]
        [Tooltip("Use BlockType.Air for empty slots")]
        public BlockType[] pattern = new BlockType[9];

        [Header("Requirements")]
        public bool requiresCraftingTable = false;
        public bool requiresKnowledgeShard = false;
        public BlockType requiredShardType;

        /// <summary>
        /// Check if recipe matches a given grid (3x3 or 2x2)
        /// </summary>
        public bool MatchesGrid(BlockType[] grid)
        {
            if (grid.Length == 4) // 2x2 grid
            {
                return MatchesSmallGrid(grid);
            }
            else if (grid.Length == 9) // 3x3 grid
            {
                return MatchesLargeGrid(grid);
            }

            return false;
        }

        /// <summary>
        /// Check if recipe matches 2x2 grid
        /// </summary>
        bool MatchesSmallGrid(BlockType[] grid)
        {
            if (requiresCraftingTable)
                return false;

            // Try all positions in the 3x3 pattern where a 2x2 grid could fit
            for (int offsetX = 0; offsetX < 2; offsetX++)
            {
                for (int offsetY = 0; offsetY < 2; offsetY++)
                {
                    if (Matches2x2AtOffset(grid, offsetX, offsetY))
                        return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Check if 2x2 grid matches pattern at offset
        /// </summary>
        bool Matches2x2AtOffset(BlockType[] grid, int offsetX, int offsetY)
        {
            for (int y = 0; y < 2; y++)
            {
                for (int x = 0; x < 2; x++)
                {
                    int gridIndex = y * 2 + x;
                    int patternIndex = (y + offsetY) * 3 + (x + offsetX);

                    if (grid[gridIndex] != pattern[patternIndex])
                        return false;
                }
            }

            // Make sure the rest of the pattern is air
            for (int i = 0; i < 9; i++)
            {
                int x = i % 3;
                int y = i / 3;

                if (x < offsetX || x >= offsetX + 2 || y < offsetY || y >= offsetY + 2)
                {
                    if (pattern[i] != BlockType.Air)
                        return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Check if recipe matches 3x3 grid
        /// </summary>
        bool MatchesLargeGrid(BlockType[] grid)
        {
            for (int i = 0; i < 9; i++)
            {
                if (grid[i] != pattern[i])
                    return false;
            }

            return true;
        }
    }
}
