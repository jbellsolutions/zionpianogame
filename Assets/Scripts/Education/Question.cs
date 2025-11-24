using UnityEngine;

namespace EduCraft.Education
{
    /// <summary>
    /// Represents an educational question
    /// </summary>
    [System.Serializable]
    public class Question
    {
        public string questionText;
        public string correctAnswer;
        public string[] acceptableAnswers; // Alternative correct answers
        public string hint;
        public SubjectType subject;
        public DifficultyTier difficulty;

        [Header("Reading Comprehension")]
        public string passage; // For reading comprehension questions

        [Header("Math")]
        public bool isMathQuestion;
        public float numericAnswer; // For math questions
        public float tolerance = 0.01f; // Acceptable error margin

        public Question(string question, string answer, SubjectType subj, DifficultyTier diff)
        {
            questionText = question;
            correctAnswer = answer;
            subject = subj;
            difficulty = diff;
        }

        /// <summary>
        /// Check if the provided answer is correct
        /// </summary>
        public bool IsCorrect(string playerAnswer)
        {
            if (string.IsNullOrEmpty(playerAnswer))
                return false;

            string cleanAnswer = playerAnswer.Trim().ToLower();
            string cleanCorrect = correctAnswer.Trim().ToLower();

            // For math questions, try numeric comparison
            if (isMathQuestion)
            {
                if (float.TryParse(cleanAnswer, out float playerNum))
                {
                    return Mathf.Abs(playerNum - numericAnswer) <= tolerance;
                }
            }

            // Check main answer
            if (cleanAnswer == cleanCorrect)
                return true;

            // Check acceptable alternatives
            if (acceptableAnswers != null)
            {
                foreach (string alt in acceptableAnswers)
                {
                    if (cleanAnswer == alt.Trim().ToLower())
                        return true;
                }
            }

            return false;
        }
    }

    public enum SubjectType
    {
        Math,
        Science,
        Reading,
        Writing
    }

    public enum DifficultyTier
    {
        Easy = 1,
        Medium = 2,
        Hard = 3
    }
}
