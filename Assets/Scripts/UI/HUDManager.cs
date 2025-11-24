using UnityEngine;
using UnityEngine.UI;
using EduCraft.Crafting;
using EduCraft.Education;

namespace EduCraft.UI
{
    /// <summary>
    /// Manages the in-game HUD display
    /// </summary>
    public class HUDManager : MonoBehaviour
    {
        [Header("Hotbar")]
        public GameObject hotbarPanel;
        public GameObject hotbarSlotPrefab;
        private Image[] hotbarSlots = new Image[InventoryManager.HotbarSize];

        [Header("Crosshair")]
        public Image crosshair;

        [Header("Subtitles")]
        public Text subtitleText;
        public GameObject subtitlePanel;

        [Header("Tutorial")]
        public Text tutorQuestionText;
        public InputField answerInputField;
        public Button submitButton;
        public Button hintButton;
        public GameObject challengePanel;

        private InventoryManager inventory;
        private AITutorManager tutor;

        void Start()
        {
            inventory = InventoryManager.Instance;
            tutor = AITutorManager.Instance;

            InitializeHotbar();
            InitializeChallengeUI();

            // Hide challenge panel initially
            if (challengePanel != null)
                challengePanel.SetActive(false);

            // Subscribe to events
            if (inventory != null)
                inventory.OnInventoryChanged += UpdateHotbar;

            if (tutor != null)
            {
                tutor.OnChallengeStarted += OnChallengeStarted;
                tutor.OnAnswerSubmitted += OnAnswerSubmitted;
            }
        }

        void OnDestroy()
        {
            // Unsubscribe from events
            if (inventory != null)
                inventory.OnInventoryChanged -= UpdateHotbar;

            if (tutor != null)
            {
                tutor.OnChallengeStarted -= OnChallengeStarted;
                tutor.OnAnswerSubmitted -= OnAnswerSubmitted;
            }
        }

        /// <summary>
        /// Initialize hotbar UI
        /// </summary>
        void InitializeHotbar()
        {
            if (hotbarPanel == null)
            {
                Debug.LogWarning("Hotbar panel not assigned!");
                return;
            }

            for (int i = 0; i < InventoryManager.HotbarSize; i++)
            {
                GameObject slot = Instantiate(hotbarSlotPrefab, hotbarPanel.transform);
                hotbarSlots[i] = slot.GetComponent<Image>();
            }

            UpdateHotbar();
        }

        /// <summary>
        /// Initialize challenge UI components
        /// </summary>
        void InitializeChallengeUI()
        {
            if (submitButton != null)
            {
                submitButton.onClick.AddListener(OnSubmitAnswer);
            }

            if (hintButton != null)
            {
                hintButton.onClick.AddListener(OnShowHint);
            }
        }

        /// <summary>
        /// Update hotbar display
        /// </summary>
        void UpdateHotbar()
        {
            for (int i = 0; i < InventoryManager.HotbarSize; i++)
            {
                ItemStack item = inventory.GetItemAt(i);

                if (hotbarSlots[i] != null)
                {
                    // Update slot appearance based on item
                    // TODO: Add sprite rendering for items

                    // Highlight selected slot
                    if (i == inventory.GetSelectedSlot())
                    {
                        hotbarSlots[i].color = Color.yellow;
                    }
                    else
                    {
                        hotbarSlots[i].color = Color.white;
                    }
                }
            }
        }

        /// <summary>
        /// Show subtitle text
        /// </summary>
        public void ShowSubtitle(string text, float duration = 3f)
        {
            if (subtitleText != null)
            {
                subtitleText.text = text;
                if (subtitlePanel != null)
                    subtitlePanel.SetActive(true);

                CancelInvoke(nameof(HideSubtitle));
                Invoke(nameof(HideSubtitle), duration);
            }
        }

        /// <summary>
        /// Hide subtitle
        /// </summary>
        void HideSubtitle()
        {
            if (subtitlePanel != null)
                subtitlePanel.SetActive(false);
        }

        /// <summary>
        /// Called when educational challenge starts
        /// </summary>
        void OnChallengeStarted(Question question)
        {
            if (challengePanel != null)
            {
                challengePanel.SetActive(true);
            }

            // Display question
            if (tutorQuestionText != null)
            {
                string questionDisplay = question.questionText;

                // Add passage for reading comprehension
                if (question.subject == SubjectType.Reading && !string.IsNullOrEmpty(question.passage))
                {
                    questionDisplay = $"<i>{question.passage}</i>\n\n{question.questionText}";
                }

                tutorQuestionText.text = questionDisplay;
            }

            // Clear answer field
            if (answerInputField != null)
            {
                answerInputField.text = "";
                answerInputField.ActivateInputField();
            }

            // Lock player movement (optional)
            Time.timeScale = 0f; // Pause game during challenge
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
        }

        /// <summary>
        /// Called when answer is submitted
        /// </summary>
        void OnAnswerSubmitted(bool correct, Question question)
        {
            // Show feedback
            string feedback = correct
                ? "Correct! Great job!"
                : $"Not quite. The answer is: {question.correctAnswer}";

            ShowSubtitle(feedback, 3f);

            // Hide challenge panel
            if (challengePanel != null)
            {
                challengePanel.SetActive(false);
            }

            // Resume game
            Time.timeScale = 1f;
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }

        /// <summary>
        /// Submit answer button handler
        /// </summary>
        void OnSubmitAnswer()
        {
            if (answerInputField != null && tutor != null)
            {
                string answer = answerInputField.text;
                tutor.SubmitAnswer(answer);
            }
        }

        /// <summary>
        /// Show hint button handler
        /// </summary>
        void OnShowHint()
        {
            if (tutor != null)
            {
                string hint = tutor.GetHint();
                ShowSubtitle("Hint: " + hint, 5f);
            }
        }
    }
}
