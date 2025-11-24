using EduCraft.Core;

namespace EduCraft.Crafting
{
    /// <summary>
    /// Represents a stack of items in an inventory slot
    /// </summary>
    [System.Serializable]
    public class ItemStack
    {
        public BlockType blockType;
        public int amount;
        public const int MaxStackSize = 64;

        public ItemStack(BlockType type, int count = 1)
        {
            blockType = type;
            amount = count;
        }

        public bool IsEmpty => blockType == BlockType.Air || amount <= 0;

        public bool CanStackWith(ItemStack other)
        {
            return other != null &&
                   blockType == other.blockType &&
                   amount < MaxStackSize;
        }

        public void Clear()
        {
            blockType = BlockType.Air;
            amount = 0;
        }
    }
}
