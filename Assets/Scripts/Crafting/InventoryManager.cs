using UnityEngine;
using EduCraft.Core;

namespace EduCraft.Crafting
{
    /// <summary>
    /// Manages player inventory and hotbar
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        public static InventoryManager Instance { get; private set; }

        [Header("Inventory Settings")]
        public const int HotbarSize = 9;
        public const int InventorySize = 27;
        public const int TotalSlots = HotbarSize + InventorySize;

        private ItemStack[] inventory = new ItemStack[TotalSlots];
        private int selectedHotbarSlot = 0;

        public delegate void InventoryChangedDelegate();
        public event InventoryChangedDelegate OnInventoryChanged;

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

            InitializeInventory();
        }

        void Update()
        {
            HandleHotbarInput();
        }

        /// <summary>
        /// Initialize empty inventory
        /// </summary>
        void InitializeInventory()
        {
            for (int i = 0; i < TotalSlots; i++)
            {
                inventory[i] = new ItemStack(BlockType.Air, 0);
            }

            // Give player some starting items for testing
            AddItem(new ItemStack(BlockType.Dirt, 64));
            AddItem(new ItemStack(BlockType.Stone, 64));
            AddItem(new ItemStack(BlockType.Wood, 32));
            AddItem(new ItemStack(BlockType.Planks, 16));
        }

        /// <summary>
        /// Handle hotbar selection with number keys
        /// </summary>
        void HandleHotbarInput()
        {
            for (int i = 0; i < HotbarSize; i++)
            {
                if (Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    selectedHotbarSlot = i;
                    OnInventoryChanged?.Invoke();
                }
            }

            // Mouse wheel scrolling
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            if (scroll != 0)
            {
                if (scroll > 0)
                {
                    selectedHotbarSlot--;
                    if (selectedHotbarSlot < 0)
                        selectedHotbarSlot = HotbarSize - 1;
                }
                else
                {
                    selectedHotbarSlot++;
                    if (selectedHotbarSlot >= HotbarSize)
                        selectedHotbarSlot = 0;
                }

                OnInventoryChanged?.Invoke();
            }
        }

        /// <summary>
        /// Add item to inventory, returns true if successful
        /// </summary>
        public bool AddItem(ItemStack item)
        {
            if (item.IsEmpty)
                return false;

            // Try to stack with existing items first
            for (int i = 0; i < TotalSlots; i++)
            {
                if (inventory[i].CanStackWith(item))
                {
                    int spaceLeft = ItemStack.MaxStackSize - inventory[i].amount;
                    int amountToAdd = Mathf.Min(spaceLeft, item.amount);

                    inventory[i].amount += amountToAdd;
                    item.amount -= amountToAdd;

                    if (item.amount <= 0)
                    {
                        OnInventoryChanged?.Invoke();
                        return true;
                    }
                }
            }

            // Find empty slots
            for (int i = 0; i < TotalSlots; i++)
            {
                if (inventory[i].IsEmpty)
                {
                    int amountToAdd = Mathf.Min(ItemStack.MaxStackSize, item.amount);
                    inventory[i] = new ItemStack(item.blockType, amountToAdd);
                    item.amount -= amountToAdd;

                    if (item.amount <= 0)
                    {
                        OnInventoryChanged?.Invoke();
                        return true;
                    }
                }
            }

            OnInventoryChanged?.Invoke();
            return item.amount <= 0;
        }

        /// <summary>
        /// Remove item from inventory
        /// </summary>
        public bool RemoveItem(BlockType blockType, int amount = 1)
        {
            int remaining = amount;

            for (int i = 0; i < TotalSlots; i++)
            {
                if (inventory[i].blockType == blockType)
                {
                    int toRemove = Mathf.Min(inventory[i].amount, remaining);
                    inventory[i].amount -= toRemove;
                    remaining -= toRemove;

                    if (inventory[i].amount <= 0)
                    {
                        inventory[i].Clear();
                    }

                    if (remaining <= 0)
                    {
                        OnInventoryChanged?.Invoke();
                        return true;
                    }
                }
            }

            OnInventoryChanged?.Invoke();
            return false;
        }

        /// <summary>
        /// Get the currently selected hotbar item
        /// </summary>
        public ItemStack GetSelectedItem()
        {
            return inventory[selectedHotbarSlot];
        }

        /// <summary>
        /// Get item at specific slot
        /// </summary>
        public ItemStack GetItemAt(int slot)
        {
            if (slot >= 0 && slot < TotalSlots)
            {
                return inventory[slot];
            }
            return null;
        }

        /// <summary>
        /// Set item at specific slot
        /// </summary>
        public void SetItemAt(int slot, ItemStack item)
        {
            if (slot >= 0 && slot < TotalSlots)
            {
                inventory[slot] = item;
                OnInventoryChanged?.Invoke();
            }
        }

        /// <summary>
        /// Check if inventory contains item
        /// </summary>
        public bool HasItem(BlockType blockType, int amount = 1)
        {
            int count = 0;
            for (int i = 0; i < TotalSlots; i++)
            {
                if (inventory[i].blockType == blockType)
                {
                    count += inventory[i].amount;
                }
            }
            return count >= amount;
        }

        /// <summary>
        /// Get current hotbar slot index
        /// </summary>
        public int GetSelectedSlot()
        {
            return selectedHotbarSlot;
        }
    }
}
