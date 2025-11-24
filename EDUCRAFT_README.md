# 🎮 EduCraft - Educational Minecraft Clone

A third-grade educational game combining Minecraft-style sandbox gameplay with voice-driven AI tutoring. Learn math, science, and reading comprehension by unlocking powerful blocks and tools through answering questions!

## 🌟 Features

### Core Gameplay
- **Voxel World Engine**: Infinite procedurally generated world with biomes
- **Building & Crafting**: Place/break blocks, craft items (2x2 and 3x3 recipes)
- **Resource Gathering**: Mine ores, chop trees, collect materials
- **Chunk System**: Optimized chunk loading/unloading for performance
- **First-Person Controls**: Smooth movement, jumping, and camera controls

### Educational System
- **Knowledge Blocks**: Special blocks that trigger educational challenges
- **Curriculum Database**: 50+ questions across Math, Science, and Reading
- **Adaptive Difficulty**: Questions adjust based on student performance
- **Voice AI Tutor**: Natural conversation with AI (STT → LLM → TTS)
- **Reward System**: Earn Knowledge Shards to unlock special items

### Progression System
- **Three Difficulty Tiers**: Easy, Medium, Hard
- **Gated Crafting**: Unlock advanced recipes by answering questions
- **Special Blocks**: Glowing blocks, magic wood, crystal blocks, rainbow blocks
- **Achievement Tracking**: Monitor progress, accuracy, and shards earned

## 🏗️ Project Structure

```
zionpianogame/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/           # Core systems (Block, VoxelData)
│   │   ├── World/          # World generation (Chunk, WorldManager)
│   │   ├── Player/         # Player controller and interaction
│   │   ├── Crafting/       # Inventory and crafting systems
│   │   ├── Education/      # Educational content and AI tutor
│   │   ├── AI/             # Voice AI integration
│   │   └── UI/             # User interface components
│   ├── Materials/          # Block and UI materials
│   ├── Prefabs/            # Game object prefabs
│   ├── Scenes/             # Unity scenes
│   └── Resources/          # Runtime-loaded assets
├── backend/                # Python Flask API for voice AI
│   ├── app.py             # Main backend server
│   ├── requirements.txt   # Python dependencies
│   └── README.md          # Backend documentation
└── Documentation/          # Additional docs and guides
```

## 🚀 Quick Start

### Prerequisites
- **Unity 2022.3 LTS** or later
- **Python 3.9+** (for voice AI backend)
- **OpenAI API Key** (for GPT-4)
- **Google Cloud Account** (for Speech APIs)

### Unity Setup

1. **Open in Unity**:
   ```bash
   # Open Unity Hub → Add → Select 'zionpianogame' folder
   ```

2. **Create Main Scene**:
   - Create new scene: `Scenes/MainGame.unity`
   - Add GameObject with `WorldManager` script
   - Create Player:
     - Add capsule (1.8m height)
     - Add `CharacterController` component
     - Add `PlayerController` script
     - Add `PlayerInteraction` script
     - Add Camera as child
   - Assign references in Inspector

3. **Create Materials**:
   - Create material with texture atlas (16x16 blocks)
   - Assign to WorldManager's `worldMaterial` field

4. **Setup Managers**:
   - Create empty GameObject "GameManagers"
   - Add these components:
     - `InventoryManager`
     - `CraftingManager`
     - `AITutorManager`
     - `RewardManager`
     - `HUDManager`
     - `VoiceAIClient`
     - `MicrophoneRecorder`

### Backend Setup

See [backend/README.md](backend/README.md) for detailed instructions.

Quick start:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py
```

### Running the Game

1. **Start Backend**: `python backend/app.py`
2. **Open Unity**: Load MainGame scene
3. **Press Play**: Game starts at spawn point
4. **Controls**:
   - `W/A/S/D`: Move
   - `Space`: Jump
   - `Shift`: Run
   - `Mouse`: Look around
   - `Left Click`: Break block
   - `Right Click`: Place block
   - `1-9`: Select hotbar slot
   - `Mouse Wheel`: Scroll hotbar
   - `E`: Open inventory (TODO)
   - `Esc`: Toggle cursor

## 📚 Educational Content

### Math (3rd Grade)
- Addition/Subtraction (up to 100)
- Multiplication/Division
- Fractions (1/2, 1/4, 3/4)
- Area calculation

### Science
- Life cycles (butterflies, plants)
- States of matter
- Solar system basics
- Food chains and ecosystems
- Forces (gravity)

### Reading Comprehension
- Short passages with questions
- Vocabulary in context
- Main idea identification

## 🎯 Gameplay Loop

1. **Explore**: Find Knowledge Blocks in the world (glowing blocks)
2. **Learn**: Answer educational questions from AI tutor
3. **Earn**: Receive Knowledge Shards based on difficulty
4. **Unlock**: Use shards to craft special items
5. **Build**: Create amazing structures with unlocked blocks

## 🔧 Development Milestones

### ✅ Milestone 1: World & Player (COMPLETE)
- Voxel world engine with chunks
- Procedural terrain generation
- First-person player controller
- Block placement/destruction

### ✅ Milestone 2: Core Mechanics (COMPLETE)
- Inventory system (36 slots)
- Crafting system (2x2 and 3x3)
- Resource gathering
- Basic recipes

### ✅ Milestone 3: Educational System (COMPLETE)
- Knowledge Block spawning
- Curriculum database (50+ questions)
- AI Tutor Manager
- Reward system with gated crafting

### ✅ Milestone 4: Voice AI (COMPLETE)
- Backend Flask server
- STT → LLM → TTS pipeline
- Unity client integration
- Microphone recording

### 🔄 Milestone 5: Polish & Content (IN PROGRESS)
- [ ] Add more biomes (desert, snow, jungle)
- [ ] Implement day/night cycle
- [ ] Add trees and vegetation generation
- [ ] Create more block types
- [ ] Design advanced recipes
- [ ] Add particle effects
- [ ] Implement sound effects and music
- [ ] Create UI for inventory/crafting
- [ ] Add achievements and progress screen
- [ ] Optimize performance (greedy meshing, LOD)

## 🎨 Art Style

- **Voxel Graphics**: Classic Minecraft-style blocky aesthetic
- **Color Palette**: Bright, vibrant, and welcoming
- **Knowledge Blocks**: Glowing with magical particles
- **UI**: Clean, child-friendly interface with large buttons
- **AI Tutor Avatar**: Friendly character (Steve/robot/animal)

## 🔌 API Integration

### Voice AI Flow
```
Unity Client (Microphone)
    ↓ [Audio WAV]
Flask Backend
    ↓ [Audio Data]
Google Speech-to-Text
    ↓ [Transcript]
OpenAI GPT-4
    ↓ [Response Text]
Google Text-to-Speech
    ↓ [Audio WAV]
Unity Client (Speaker + Subtitles)
```

### Configuration
Edit `Assets/Scripts/AI/VoiceAIClient.cs`:
```csharp
public string backendURL = "http://localhost:5000";
```

For production, deploy backend and update URL.

## ⚙️ Customization

### Adding New Blocks
1. Add to `BlockType` enum in `Core/BlockType.cs`
2. Define properties in `Block.cs` constructor
3. Create texture in atlas
4. Update texture IDs

### Adding Questions
Edit `Education/CurriculumDatabase.cs`:
```csharp
AddMathQuestion("What is 5 + 5?", 10, DifficultyTier.Easy, "Count on your fingers");
```

### Creating Recipes
Edit `Crafting/CraftingManager.cs`:
```csharp
CreateRecipe("Item Name", inputType, outputType, count, needsTable, needsShard);
```

## 🐛 Troubleshooting

### Unity Issues
- **Slow performance**: Reduce view distance in `VoxelData.ViewDistanceInChunks`
- **Blocks not rendering**: Check WorldManager has material assigned
- **Player falls through world**: Ensure CharacterController height = 1.8

### Backend Issues
- **Connection refused**: Check backend is running on port 5000
- **Audio not playing**: Verify microphone permissions
- **Slow responses**: Use GPT-3.5-turbo instead of GPT-4

## 📊 Performance Optimization

### Current Optimizations
- Chunk-based world loading
- Face culling (hidden faces not rendered)
- Mesh combining per chunk
- Greedy meshing (planned)

### Recommended Settings
- View distance: 8 chunks (128 blocks)
- Chunk size: 16x256x16
- Target framerate: 60 FPS

## 🤝 Contributing

This is an educational project. Key areas for improvement:
1. Greedy meshing implementation
2. More sophisticated biome generation
3. Multiplayer support
4. Mobile platform port
5. Additional curriculum content

## 📄 License

Educational/Personal Use License
- Free to use for educational purposes
- Not for commercial distribution

## 🙏 Acknowledgments

- **Minecraft**: Inspiration for core gameplay
- **Sebastian Lague**: Voxel engine tutorials
- **Arthur Benjamin**: Mental math techniques
- **OpenAI & Google**: AI services

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review inline code documentation
3. Refer to milestone-specific docs

---

**Built with ❤️ for third-grade learning through play!** 🌟

Happy building and learning! 🎓⛏️
