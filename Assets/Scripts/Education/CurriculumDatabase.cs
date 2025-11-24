using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace EduCraft.Education
{
    /// <summary>
    /// Database of all educational questions organized by subject and difficulty
    /// </summary>
    [CreateAssetMenu(fileName = "CurriculumDatabase", menuName = "EduCraft/Curriculum Database")]
    public class CurriculumDatabase : ScriptableObject
    {
        public List<Question> allQuestions = new List<Question>();

        /// <summary>
        /// Get questions filtered by subject and difficulty
        /// </summary>
        public List<Question> GetQuestions(SubjectType? subject = null, DifficultyTier? difficulty = null)
        {
            IEnumerable<Question> filtered = allQuestions;

            if (subject.HasValue)
            {
                filtered = filtered.Where(q => q.subject == subject.Value);
            }

            if (difficulty.HasValue)
            {
                filtered = filtered.Where(q => q.difficulty == difficulty.Value);
            }

            return filtered.ToList();
        }

        /// <summary>
        /// Get a random question based on filters
        /// </summary>
        public Question GetRandomQuestion(SubjectType? subject = null, DifficultyTier? difficulty = null)
        {
            List<Question> filtered = GetQuestions(subject, difficulty);

            if (filtered.Count > 0)
            {
                return filtered[Random.Range(0, filtered.Count)];
            }

            Debug.LogWarning("No questions found matching criteria!");
            return null;
        }

        /// <summary>
        /// Initialize with default third-grade curriculum questions
        /// </summary>
        public void InitializeDefaultQuestions()
        {
            allQuestions.Clear();

            // === MATH - EASY ===
            AddMathQuestion("What is 5 + 3?", 8, DifficultyTier.Easy, "Count on your fingers from 5");
            AddMathQuestion("What is 10 - 4?", 6, DifficultyTier.Easy, "Start at 10 and count back 4");
            AddMathQuestion("What is 2 × 4?", 8, DifficultyTier.Easy, "Two groups of 4");
            AddMathQuestion("What is 12 ÷ 3?", 4, DifficultyTier.Easy, "How many 3s fit into 12?");
            AddMathQuestion("What is 7 + 5?", 12, DifficultyTier.Easy, "Think 7 + 3 + 2");

            // === MATH - MEDIUM ===
            AddMathQuestion("What is 23 × 4?", 92, DifficultyTier.Medium, "Break it: (20 × 4) + (3 × 4)");
            AddMathQuestion("What is 56 ÷ 7?", 8, DifficultyTier.Medium, "What times 7 equals 56?");
            AddMathQuestion("What is 1/2 + 1/4?", 0.75f, DifficultyTier.Medium, "Convert to common denominators");
            AddMathQuestion("A rectangle is 5 meters wide and 8 meters long. What is its area?", 40, DifficultyTier.Medium, "Area = width × length");
            AddMathQuestion("What is 99 - 37?", 62, DifficultyTier.Medium, "Round 99 to 100, then adjust");

            // === MATH - HARD ===
            AddMathQuestion("What is 47 × 8?", 376, DifficultyTier.Hard, "Try (50 × 8) - (3 × 8)");
            AddMathQuestion("If you have 3/4 of a pizza and eat 1/3 of it, how much is left?", 0.5f, DifficultyTier.Hard, "Find 1/3 of 3/4 first");
            AddMathQuestion("What is 144 ÷ 12?", 12, DifficultyTier.Hard, "Think about 12 × 12");
            AddMathQuestion("A garden is 12 feet by 15 feet. What is the area in square feet?", 180, DifficultyTier.Hard, "Area = length × width");

            // === SCIENCE - EASY ===
            AddQuestion("What do plants need to make food from sunlight?", "photosynthesis", SubjectType.Science, DifficultyTier.Easy,
                "The process starts with 'photo'", new[] { "photosynthesis", "light", "sunlight" });

            AddQuestion("What are the three states of matter?", "solid liquid gas", SubjectType.Science, DifficultyTier.Easy,
                "Think ice, water, and steam", new[] { "solid liquid gas", "solid gas liquid", "liquid solid gas" });

            AddQuestion("What is the center of our solar system?", "sun", SubjectType.Science, DifficultyTier.Easy,
                "It's the brightest object in the sky during the day", new[] { "sun", "the sun" });

            // === SCIENCE - MEDIUM ===
            AddQuestion("What is the process by which a caterpillar becomes a butterfly called?", "metamorphosis", SubjectType.Science, DifficultyTier.Medium,
                "It starts with 'meta'", new[] { "metamorphosis", "transformation" });

            AddQuestion("What force pulls objects toward the center of the Earth?", "gravity", SubjectType.Science, DifficultyTier.Medium,
                "It's why things fall down", new[] { "gravity", "gravitational force" });

            AddQuestion("In a food chain, what do we call animals that eat only plants?", "herbivores", SubjectType.Science, DifficultyTier.Medium,
                "The word contains 'herb'", new[] { "herbivores", "herbivore" });

            // === SCIENCE - HARD ===
            AddQuestion("What is the process where water vapor turns into liquid water?", "condensation", SubjectType.Science, DifficultyTier.Hard,
                "You see this on a cold glass of water", new[] { "condensation", "condensing" });

            AddQuestion("What are organisms that break down dead plants and animals called?", "decomposers", SubjectType.Science, DifficultyTier.Hard,
                "They 'decompose' things", new[] { "decomposers", "decomposer", "bacteria", "fungi" });

            // === READING - EASY ===
            AddReadingQuestion(
                "Tom has a red bike. He rides it to school every day. Tom loves his bike.",
                "What color is Tom's bike?",
                "red",
                DifficultyTier.Easy,
                "Look at the first sentence",
                new[] { "red", "a red bike" }
            );

            AddReadingQuestion(
                "Sarah planted seeds in her garden. She watered them every day. Soon, green plants began to grow.",
                "What did Sarah plant?",
                "seeds",
                DifficultyTier.Easy,
                "What did she put in the garden?",
                new[] { "seeds", "plant seeds" }
            );

            // === READING - MEDIUM ===
            AddReadingQuestion(
                "The Amazon rainforest is home to more species of plants and animals than any other place on Earth. Scientists believe there may be millions of species still undiscovered. Many medicines come from rainforest plants.",
                "Why is the Amazon rainforest important?",
                "many species and medicines",
                DifficultyTier.Medium,
                "Think about biodiversity and medicine",
                new[] { "species", "medicines", "biodiversity", "plants and animals", "many species and medicines" }
            );

            // === READING - HARD ===
            AddReadingQuestion(
                "Recycling helps reduce waste and conserve natural resources. When we recycle paper, we save trees. When we recycle plastic, we keep it out of oceans where it can harm marine life. Recycling also uses less energy than making new products from raw materials.",
                "Name two benefits of recycling mentioned in the passage.",
                "saves trees and protects oceans",
                DifficultyTier.Hard,
                "Look for what recycling helps with",
                new[] { "saves trees", "protects oceans", "saves energy", "reduces waste", "conserves resources" }
            );

            Debug.Log($"Initialized {allQuestions.Count} curriculum questions");
        }

        void AddMathQuestion(string question, float answer, DifficultyTier difficulty, string hint)
        {
            Question q = new Question(question, answer.ToString(), SubjectType.Math, difficulty);
            q.isMathQuestion = true;
            q.numericAnswer = answer;
            q.hint = hint;
            allQuestions.Add(q);
        }

        void AddQuestion(string question, string answer, SubjectType subject, DifficultyTier difficulty, string hint, string[] alternatives)
        {
            Question q = new Question(question, answer, subject, difficulty);
            q.hint = hint;
            q.acceptableAnswers = alternatives;
            allQuestions.Add(q);
        }

        void AddReadingQuestion(string passage, string question, string answer, DifficultyTier difficulty, string hint, string[] alternatives)
        {
            Question q = new Question(question, answer, SubjectType.Reading, difficulty);
            q.passage = passage;
            q.hint = hint;
            q.acceptableAnswers = alternatives;
            allQuestions.Add(q);
        }
    }
}
