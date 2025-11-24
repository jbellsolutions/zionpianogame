using UnityEngine;
using EduCraft.Core;

namespace EduCraft.Education
{
    /// <summary>
    /// Manages the AI tutoring system and educational challenges
    /// </summary>
    public class AITutorManager : MonoBehaviour
    {
        public static AITutorManager Instance { get; private set; }

        [Header("Curriculum")]
        public CurriculumDatabase curriculum;

        [Header("Progress Tracking")]
        private int consecutiveCorrect = 0;
        private int consecutiveIncorrect = 0;
        private DifficultyTier currentDifficulty = DifficultyTier.Easy;

        private Question currentQuestion;
        private bool isInChallenge = false;

        public delegate void ChallengeEventDelegate(Question question);
        public delegate void AnswerEventDelegate(bool correct, Question question);

        public event ChallengeEventDelegate OnChallengeStarted;
        public event AnswerEventDelegate OnAnswerSubmitted;

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

            // Initialize curriculum if not assigned
            if (curriculum == null)
            {
                curriculum = ScriptableObject.CreateInstance<CurriculumDatabase>();
                curriculum.InitializeDefaultQuestions();
            }
        }

        /// <summary>
        /// Start an educational challenge
        /// </summary>
        public void StartChallenge(BlockType knowledgeBlockType)
        {
            if (isInChallenge)
            {
                Debug.LogWarning("Challenge already in progress!");
                return;
            }

            // Determine difficulty from block type
            DifficultyTier difficulty = GetDifficultyFromBlockType(knowledgeBlockType);

            // Get adaptive difficulty
            difficulty = GetAdaptiveDifficulty(difficulty);

            // Select random question
            currentQuestion = curriculum.GetRandomQuestion(null, difficulty);

            if (currentQuestion != null)
            {
                isInChallenge = true;
                OnChallengeStarted?.Invoke(currentQuestion);
                Debug.Log($"Challenge started: {currentQuestion.questionText}");
            }
            else
            {
                Debug.LogError("No questions available!");
            }
        }

        /// <summary>
        /// Submit answer to current challenge
        /// </summary>
        public void SubmitAnswer(string answer)
        {
            if (!isInChallenge || currentQuestion == null)
            {
                Debug.LogWarning("No active challenge!");
                return;
            }

            bool isCorrect = currentQuestion.IsCorrect(answer);

            // Update adaptive difficulty tracking
            if (isCorrect)
            {
                consecutiveCorrect++;
                consecutiveIncorrect = 0;

                // Increase difficulty after 3 correct in a row
                if (consecutiveCorrect >= 3 && currentDifficulty < DifficultyTier.Hard)
                {
                    currentDifficulty++;
                    consecutiveCorrect = 0;
                    Debug.Log($"Difficulty increased to {currentDifficulty}");
                }
            }
            else
            {
                consecutiveIncorrect++;
                consecutiveCorrect = 0;

                // Decrease difficulty after 2 incorrect in a row
                if (consecutiveIncorrect >= 2 && currentDifficulty > DifficultyTier.Easy)
                {
                    currentDifficulty--;
                    consecutiveIncorrect = 0;
                    Debug.Log($"Difficulty decreased to {currentDifficulty}");
                }
            }

            // Trigger event
            OnAnswerSubmitted?.Invoke(isCorrect, currentQuestion);

            // Award reward if correct
            if (isCorrect)
            {
                RewardManager.Instance?.AwardReward(currentQuestion.difficulty);
            }

            // End challenge
            isInChallenge = false;
            currentQuestion = null;
        }

        /// <summary>
        /// Get hint for current question
        /// </summary>
        public string GetHint()
        {
            if (currentQuestion != null && !string.IsNullOrEmpty(currentQuestion.hint))
            {
                return currentQuestion.hint;
            }

            return "No hint available.";
        }

        /// <summary>
        /// Get current question
        /// </summary>
        public Question GetCurrentQuestion()
        {
            return currentQuestion;
        }

        /// <summary>
        /// Check if a challenge is active
        /// </summary>
        public bool IsChallengeActive()
        {
            return isInChallenge;
        }

        /// <summary>
        /// Determine difficulty from Knowledge Block type
        /// </summary>
        DifficultyTier GetDifficultyFromBlockType(BlockType blockType)
        {
            switch (blockType)
            {
                case BlockType.KnowledgeBlockEasy:
                    return DifficultyTier.Easy;
                case BlockType.KnowledgeBlockMedium:
                    return DifficultyTier.Medium;
                case BlockType.KnowledgeBlockHard:
                    return DifficultyTier.Hard;
                default:
                    return DifficultyTier.Easy;
            }
        }

        /// <summary>
        /// Apply adaptive difficulty adjustment
        /// </summary>
        DifficultyTier GetAdaptiveDifficulty(DifficultyTier baseDifficulty)
        {
            // If player is doing well, might get harder questions
            if (consecutiveCorrect >= 2 && baseDifficulty < DifficultyTier.Hard)
            {
                return baseDifficulty + 1;
            }

            // If player is struggling, might get easier questions
            if (consecutiveIncorrect >= 1 && baseDifficulty > DifficultyTier.Easy)
            {
                return baseDifficulty - 1;
            }

            return baseDifficulty;
        }

        /// <summary>
        /// Cancel current challenge
        /// </summary>
        public void CancelChallenge()
        {
            isInChallenge = false;
            currentQuestion = null;
        }
    }
}
