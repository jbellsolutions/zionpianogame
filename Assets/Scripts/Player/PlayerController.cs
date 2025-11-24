using UnityEngine;

namespace EduCraft.Player
{
    /// <summary>
    /// First-person player controller with movement and look
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float walkSpeed = 5f;
        public float runSpeed = 8f;
        public float jumpForce = 8f;
        public float gravity = 20f;

        [Header("Look")]
        public float mouseSensitivity = 2f;
        public float maxLookAngle = 90f;

        [Header("References")]
        public Transform playerCamera;

        private CharacterController characterController;
        private Vector3 moveDirection = Vector3.zero;
        private float verticalRotation = 0f;
        private bool isGrounded = false;

        void Start()
        {
            characterController = GetComponent<CharacterController>();

            // Lock cursor
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;

            // Find camera if not assigned
            if (playerCamera == null)
            {
                playerCamera = GetComponentInChildren<Camera>()?.transform;
                if (playerCamera == null)
                {
                    Debug.LogError("Player camera not found!");
                }
            }
        }

        void Update()
        {
            HandleMovement();
            HandleLook();
            HandleCursorToggle();
        }

        /// <summary>
        /// Handle player movement input
        /// </summary>
        void HandleMovement()
        {
            isGrounded = characterController.isGrounded;

            // Get input
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");
            bool isRunning = Input.GetKey(KeyCode.LeftShift);
            bool jump = Input.GetButtonDown("Jump");

            // Calculate movement direction
            Vector3 forward = transform.forward;
            Vector3 right = transform.right;

            float currentSpeed = isRunning ? runSpeed : walkSpeed;

            if (isGrounded)
            {
                moveDirection = (forward * vertical + right * horizontal) * currentSpeed;

                // Jump
                if (jump)
                {
                    moveDirection.y = jumpForce;
                }
            }

            // Apply gravity
            moveDirection.y -= gravity * Time.deltaTime;

            // Move the character
            characterController.Move(moveDirection * Time.deltaTime);
        }

        /// <summary>
        /// Handle camera look with mouse
        /// </summary>
        void HandleLook()
        {
            // Only look if cursor is locked
            if (Cursor.lockState != CursorLockMode.Locked)
                return;

            // Get mouse input
            float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

            // Rotate player horizontally
            transform.Rotate(0, mouseX, 0);

            // Rotate camera vertically
            verticalRotation -= mouseY;
            verticalRotation = Mathf.Clamp(verticalRotation, -maxLookAngle, maxLookAngle);
            playerCamera.localRotation = Quaternion.Euler(verticalRotation, 0, 0);
        }

        /// <summary>
        /// Toggle cursor lock with Escape key
        /// </summary>
        void HandleCursorToggle()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (Cursor.lockState == CursorLockMode.Locked)
                {
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                }
                else
                {
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                }
            }
        }

        /// <summary>
        /// Get the position the player is looking at
        /// </summary>
        public bool GetLookingAtPosition(out Vector3 position, out Vector3 normal, float maxDistance = 5f)
        {
            position = Vector3.zero;
            normal = Vector3.up;

            Ray ray = new Ray(playerCamera.position, playerCamera.forward);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, maxDistance))
            {
                position = hit.point;
                normal = hit.normal;
                return true;
            }

            return false;
        }
    }
}
