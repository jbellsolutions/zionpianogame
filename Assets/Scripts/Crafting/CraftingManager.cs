using System.Collections.Generic;
using UnityEngine;
using EduCraft.Core;

namespace EduCraft.Crafting
{
    /// <summary>
    /// Manages crafting recipes and crafting operations
    /// </summary>
    public class CraftingManager : MonoBehaviour
    {
        public static CraftingManager Instance { get; private set; }

        [Header("Recipes")]
        public List<CraftingRecipe> allRecipes = new List<CraftingRecipe>();

        private HashSet<BlockType> unlockedShards = new HashSet<BlockType>();

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

            InitializeDefaultRecipes();
        }

        /// <summary>
        /// Initialize default crafting recipes
        /// </summary>
        void InitializeDefaultRecipes()
        {
            // Note: In a real Unity project, these would be ScriptableObject assets
            // For this code generation, we'll create them programmatically

            // Planks from Wood (2x2 grid)
            CreateRecipe("Planks", BlockType.Wood, BlockType.Planks, 4, false, false);

            // Crafting Table (2x2 grid)
            BlockType[] craftingTablePattern = new BlockType[9]
            {
                BlockType.Planks, BlockType.Planks, BlockType.Air,
                BlockType.Planks, BlockType.Planks, BlockType.Air,
                BlockType.Air, BlockType.Air, BlockType.Air
            };
            CreateRecipe("Crafting Table", craftingTablePattern, BlockType.CraftingTable, 1, false, false);

            // Sticks (2x2 grid)
            BlockType[] sticksPattern = new BlockType[9]
            {
                BlockType.Planks, BlockType.Air, BlockType.Air,
                BlockType.Planks, BlockType.Air, BlockType.Air,
                BlockType.Air, BlockType.Air, BlockType.Air
            };
            CreateRecipe("Sticks", sticksPattern, BlockType.Wood, 4, false, false);

            Debug.Log($"Initialized {allRecipes.Count} crafting recipes");
        }

        /// <summary>
        /// Helper to create a simple 1-ingredient recipe
        /// </summary>
        void CreateRecipe(string name, BlockType input, BlockType output, int outputCount, bool needsTable, bool needsShard)
        {
            CraftingRecipe recipe = ScriptableObject.CreateInstance<CraftingRecipe>();
            recipe.recipeName = name;
            recipe.result = output;
            recipe.resultCount = outputCount;
            recipe.requiresCraftingTable = needsTable;
            recipe.requiresKnowledgeShard = needsShard;

            recipe.pattern = new BlockType[9]
            {
                input, BlockType.Air, BlockType.Air,
                BlockType.Air, BlockType.Air, BlockType.Air,
                BlockType.Air, BlockType.Air, BlockType.Air
            };

            allRecipes.Add(recipe);
        }

        /// <summary>
        /// Helper to create a recipe with custom pattern
        /// </summary>
        void CreateRecipe(string name, BlockType[] pattern, BlockType output, int outputCount, bool needsTable, bool needsShard)
        {
            CraftingRecipe recipe = ScriptableObject.CreateInstance<CraftingRecipe>();
            recipe.recipeName = name;
            recipe.result = output;
            recipe.resultCount = outputCount;
            recipe.requiresCraftingTable = needsTable;
            recipe.requiresKnowledgeShard = needsShard;
            recipe.pattern = pattern;

            allRecipes.Add(recipe);
        }

        /// <summary>
        /// Try to craft item from grid
        /// </summary>
        public CraftingRecipe GetMatchingRecipe(BlockType[] grid, bool hasCraftingTable)
        {
            foreach (CraftingRecipe recipe in allRecipes)
            {
                // Check if recipe requires crafting table
                if (recipe.requiresCraftingTable && !hasCraftingTable)
                    continue;

                // Check if recipe requires knowledge shard and if player has it
                if (recipe.requiresKnowledgeShard && !HasUnlockedShard(recipe.requiredShardType))
                    continue;

                // Check if pattern matches
                if (recipe.MatchesGrid(grid))
                {
                    return recipe;
                }
            }

            return null;
        }

        /// <summary>
        /// Perform crafting operation
        /// </summary>
        public ItemStack Craft(BlockType[] grid, bool hasCraftingTable, InventoryManager inventory)
        {
            CraftingRecipe recipe = GetMatchingRecipe(grid, hasCraftingTable);

            if (recipe != null)
            {
                // Create result
                ItemStack result = new ItemStack(recipe.result, recipe.resultCount);

                // Remove ingredients from grid (handled by UI)
                return result;
            }

            return null;
        }

        /// <summary>
        /// Unlock a shard type (called when player earns it through learning)
        /// </summary>
        public void UnlockShard(BlockType shardType)
        {
            if (!unlockedShards.Contains(shardType))
            {
                unlockedShards.Add(shardType);
                Debug.Log($"Unlocked shard: {shardType}");
            }
        }

        /// <summary>
        /// Check if player has unlocked a shard type
        /// </summary>
        public bool HasUnlockedShard(BlockType shardType)
        {
            return unlockedShards.Contains(shardType);
        }

        /// <summary>
        /// Get all recipes the player can currently see
        /// </summary>
        public List<CraftingRecipe> GetAvailableRecipes(bool hasCraftingTable)
        {
            List<CraftingRecipe> available = new List<CraftingRecipe>();

            foreach (CraftingRecipe recipe in allRecipes)
            {
                // Hide recipes that require crafting table if player doesn't have one
                if (recipe.requiresCraftingTable && !hasCraftingTable)
                    continue;

                // Hide shard-gated recipes until player unlocks the shard
                if (recipe.requiresKnowledgeShard && !HasUnlockedShard(recipe.requiredShardType))
                    continue;

                available.Add(recipe);
            }

            return available;
        }
    }
}
