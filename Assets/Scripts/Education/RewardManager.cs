using UnityEngine;
using EduCraft.Core;
using EduCraft.Crafting;

namespace EduCraft.Education
{
    /// <summary>
    /// Manages rewards for completing educational challenges
    /// </summary>
    public class RewardManager : MonoBehaviour
    {
        public static RewardManager Instance { get; private set; }

        [Header("Reward Shards")]
        public BlockType easyShardType = BlockType.KnowledgeBlockEasy;
        public BlockType mediumShardType = BlockType.KnowledgeBlockMedium;
        public BlockType hardShardType = BlockType.KnowledgeBlockHard;

        [Header("Reward Amounts")]
        public int easyShardCount = 1;
        public int mediumShardCount = 2;
        public int hardShardCount = 3;

        // Player statistics
        private int totalQuestionsAnswered = 0;
        private int totalCorrectAnswers = 0;
        private int easyShardsEarned = 0;
        private int mediumShardsEarned = 0;
        private int hardShardsEarned = 0;

        public delegate void RewardDelegate(DifficultyTier difficulty, BlockType shardType, int amount);
        public event RewardDelegate OnRewardAwarded;

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
        }

        /// <summary>
        /// Award reward based on question difficulty
        /// </summary>
        public void AwardReward(DifficultyTier difficulty)
        {
            BlockType shardType;
            int amount;

            switch (difficulty)
            {
                case DifficultyTier.Easy:
                    shardType = easyShardType;
                    amount = easyShardCount;
                    easyShardsEarned += amount;
                    break;

                case DifficultyTier.Medium:
                    shardType = mediumShardType;
                    amount = mediumShardCount;
                    mediumShardsEarned += amount;
                    break;

                case DifficultyTier.Hard:
                    shardType = hardShardType;
                    amount = hardShardCount;
                    hardShardsEarned += amount;
                    break;

                default:
                    shardType = easyShardType;
                    amount = 1;
                    break;
            }

            // Add shard to inventory
            InventoryManager inventory = InventoryManager.Instance;
            if (inventory != null)
            {
                ItemStack shard = new ItemStack(shardType, amount);
                inventory.AddItem(shard);
            }

            // Unlock shard type in crafting
            CraftingManager crafting = CraftingManager.Instance;
            if (crafting != null)
            {
                crafting.UnlockShard(shardType);
            }

            // Update statistics
            totalCorrectAnswers++;
            totalQuestionsAnswered++;

            // Trigger event
            OnRewardAwarded?.Invoke(difficulty, shardType, amount);

            Debug.Log($"Awarded {amount}x {shardType} for completing {difficulty} question!");
        }

        /// <summary>
        /// Record a wrong answer (for statistics)
        /// </summary>
        public void RecordWrongAnswer()
        {
            totalQuestionsAnswered++;
        }

        /// <summary>
        /// Get accuracy percentage
        /// </summary>
        public float GetAccuracy()
        {
            if (totalQuestionsAnswered == 0)
                return 0f;

            return (float)totalCorrectAnswers / totalQuestionsAnswered * 100f;
        }

        /// <summary>
        /// Get total shards earned
        /// </summary>
        public int GetTotalShardsEarned()
        {
            return easyShardsEarned + mediumShardsEarned + hardShardsEarned;
        }

        /// <summary>
        /// Get statistics summary
        /// </summary>
        public string GetStatsSummary()
        {
            return $"Questions Answered: {totalQuestionsAnswered}\n" +
                   $"Correct: {totalCorrectAnswers}\n" +
                   $"Accuracy: {GetAccuracy():F1}%\n" +
                   $"Easy Shards: {easyShardsEarned}\n" +
                   $"Medium Shards: {mediumShardsEarned}\n" +
                   $"Hard Shards: {hardShardsEarned}";
        }
    }
}
