using UnityEngine;
using EduCraft.Core;
using EduCraft.World;

namespace EduCraft.Player
{
    /// <summary>
    /// Handles player interaction with blocks (placing/breaking)
    /// </summary>
    [RequireComponent(typeof(PlayerController))]
    public class PlayerInteraction : MonoBehaviour
    {
        [Header("Interaction Settings")]
        public float interactionRange = 5f;
        public LayerMask blockLayer;

        [Header("Highlight")]
        public GameObject highlightBlock;
        public Material highlightMaterial;

        [Header("References")]
        public Transform playerCamera;

        private PlayerController playerController;
        private WorldManager worldManager;
        private Vector3 currentBlockPosition;
        private bool isBlockHighlighted = false;

        void Start()
        {
            playerController = GetComponent<PlayerController>();
            worldManager = WorldManager.Instance;

            if (playerCamera == null)
            {
                playerCamera = GetComponentInChildren<Camera>()?.transform;
            }

            // Create highlight block
            if (highlightBlock == null)
            {
                CreateHighlightBlock();
            }
        }

        void Update()
        {
            HandleBlockHighlight();
            HandleBlockInteraction();
        }

        /// <summary>
        /// Highlight the block the player is looking at
        /// </summary>
        void HandleBlockHighlight()
        {
            Ray ray = new Ray(playerCamera.position, playerCamera.forward);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, interactionRange, blockLayer))
            {
                // Calculate the block position
                Vector3 hitPoint = hit.point - hit.normal * 0.5f;
                Vector3 blockPos = new Vector3(
                    Mathf.Floor(hitPoint.x),
                    Mathf.Floor(hitPoint.y),
                    Mathf.Floor(hitPoint.z)
                );

                // Update highlight
                if (!isBlockHighlighted || currentBlockPosition != blockPos)
                {
                    currentBlockPosition = blockPos;
                    highlightBlock.transform.position = blockPos;
                    highlightBlock.SetActive(true);
                    isBlockHighlighted = true;
                }
            }
            else
            {
                // No block in range
                if (isBlockHighlighted)
                {
                    highlightBlock.SetActive(false);
                    isBlockHighlighted = false;
                }
            }
        }

        /// <summary>
        /// Handle block breaking and placing
        /// </summary>
        void HandleBlockInteraction()
        {
            if (!isBlockHighlighted)
                return;

            // Break block (left click)
            if (Input.GetMouseButtonDown(0))
            {
                BreakBlock();
            }

            // Place block (right click)
            if (Input.GetMouseButtonDown(1))
            {
                PlaceBlock();
            }
        }

        /// <summary>
        /// Break the highlighted block
        /// </summary>
        void BreakBlock()
        {
            BlockType blockType = worldManager.GetBlockAtPosition(currentBlockPosition);

            // Can't break bedrock
            if (blockType == BlockType.Bedrock)
            {
                Debug.Log("Cannot break bedrock!");
                return;
            }

            // Check if it's a Knowledge Block (special interaction)
            if (blockType == BlockType.KnowledgeBlockEasy ||
                blockType == BlockType.KnowledgeBlockMedium ||
                blockType == BlockType.KnowledgeBlockHard)
            {
                // Trigger educational challenge instead of breaking
                TriggerKnowledgeBlock(blockType);
                return;
            }

            // Remove the block
            worldManager.SetBlockAtPosition(currentBlockPosition, BlockType.Air);

            // TODO: Add block to inventory (will implement in Milestone 2)
            Debug.Log($"Broke {blockType} block at {currentBlockPosition}");
        }

        /// <summary>
        /// Place a block adjacent to the highlighted block
        /// </summary>
        void PlaceBlock()
        {
            Ray ray = new Ray(playerCamera.position, playerCamera.forward);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, interactionRange, blockLayer))
            {
                // Calculate placement position (adjacent to hit block)
                Vector3 placePos = hit.point + hit.normal * 0.5f;
                Vector3 blockPos = new Vector3(
                    Mathf.Floor(placePos.x),
                    Mathf.Floor(placePos.y),
                    Mathf.Floor(placePos.z)
                );

                // Check if position is not occupied by player
                if (Vector3.Distance(blockPos, transform.position) > 1f)
                {
                    // TODO: Get block type from hotbar (will implement in Milestone 2)
                    // For now, place stone
                    BlockType blockToPlace = BlockType.Stone;

                    worldManager.SetBlockAtPosition(blockPos, blockToPlace);
                    Debug.Log($"Placed {blockToPlace} block at {blockPos}");
                }
            }
        }

        /// <summary>
        /// Trigger educational challenge when interacting with Knowledge Block
        /// </summary>
        void TriggerKnowledgeBlock(BlockType blockType)
        {
            Debug.Log($"Knowledge Block triggered! Type: {blockType}");
            // TODO: Implement in Milestone 3 - trigger AI tutor system
        }

        /// <summary>
        /// Create the highlight block object
        /// </summary>
        void CreateHighlightBlock()
        {
            highlightBlock = GameObject.CreatePrimitive(PrimitiveType.Cube);
            highlightBlock.name = "BlockHighlight";

            // Remove collider
            Destroy(highlightBlock.GetComponent<Collider>());

            // Create highlight material
            if (highlightMaterial == null)
            {
                highlightMaterial = new Material(Shader.Find("Standard"));
                highlightMaterial.color = new Color(1f, 1f, 1f, 0.3f);
                highlightMaterial.SetFloat("_Mode", 3); // Transparent mode
                highlightMaterial.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                highlightMaterial.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                highlightMaterial.SetInt("_ZWrite", 0);
                highlightMaterial.DisableKeyword("_ALPHATEST_ON");
                highlightMaterial.EnableKeyword("_ALPHABLEND_ON");
                highlightMaterial.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                highlightMaterial.renderQueue = 3000;
            }

            highlightBlock.GetComponent<Renderer>().material = highlightMaterial;
            highlightBlock.transform.localScale = new Vector3(1.01f, 1.01f, 1.01f); // Slightly larger than block
            highlightBlock.SetActive(false);
        }
    }
}
