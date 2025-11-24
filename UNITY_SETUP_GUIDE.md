# Unity Setup Guide for EduCraft

Complete step-by-step guide to set up the EduCraft Unity project from scratch.

## Prerequisites

- Unity Hub installed
- Unity 2022.3 LTS or later
- Visual Studio or VS Code with C# extension
- Git (optional, for version control)

## Step 1: Create Unity Project

1. Open Unity Hub
2. Click "New Project"
3. Select "3D (URP)" template for better graphics
4. Name: "EduCraft"
5. Location: Choose your desired folder
6. Click "Create Project"

## Step 2: Import Scripts

1. Copy all scripts from `Assets/Scripts/` to your Unity project's `Assets/Scripts/` folder
2. Wait for Unity to compile (may take a minute)
3. Fix any compilation errors (check console)

## Step 3: Create Main Scene

### A. World Setup

1. Create new scene: `Assets/Scenes/MainGame.unity`
2. Delete default "Main Camera" (we'll use player camera)
3. Create empty GameObject named "World"
4. Add `WorldManager` component to it

### B. Create Block Material

1. Right-click in Materials folder → Create → Material
2. Name it "BlockMaterial"
3. Create or import a 16x16 texture atlas:
   - Each block type gets a texture in the atlas
   - Layout: 16 blocks wide × 16 blocks tall = 256 block types
   - Size: 256×256 or 512×512 pixels
4. Assign texture to material's "Base Map"
5. Drag material to WorldManager's "World Material" field

**Quick Texture Atlas**: Use this layout:
```
Row 0: Grass Top, Grass Side, Dirt, Stone, ...
Row 1: Sand, Water, Wood, Leaves, ...
Row 2: Coal Ore, Iron Ore, Gold Ore, Diamond Ore, ...
...
```

### C. Create Player

1. Create empty GameObject named "Player"
2. Tag it as "Player" (Tag dropdown → Add Tag → "Player")
3. Position at (0, 75, 0) - above ground
4. Add `CharacterController` component:
   - Radius: 0.4
   - Height: 1.8
   - Center: (0, 0.9, 0)
5. Add `PlayerController` script
6. Add `PlayerInteraction` script

### D. Create Player Camera

1. Create Camera as child of Player
2. Name it "PlayerCamera"
3. Position: (0, 0.6, 0) - eye level
4. Rotation: (0, 0, 0)
5. Drag to PlayerController's "Player Camera" field

### E. Create Chunk Prefab

1. Create empty GameObject named "ChunkPrefab"
2. Add these components:
   - `Mesh Filter`
   - `Mesh Renderer`
   - `Mesh Collider`
   - `Chunk` script
3. On Mesh Renderer:
   - Assign "BlockMaterial" to Materials[0]
4. Drag ChunkPrefab to Project window to create prefab
5. Delete from scene
6. Assign prefab to WorldManager's "Chunk Prefab" field
7. Assign Player to WorldManager's "Player" field

## Step 4: Setup Game Managers

1. Create empty GameObject named "GameManagers"
2. Add these components (all at once):
   - `InventoryManager`
   - `CraftingManager`
   - `AITutorManager`
   - `RewardManager`

## Step 5: Create UI

### A. Create Canvas

1. Right-click in Hierarchy → UI → Canvas
2. Canvas settings:
   - Render Mode: Screen Space - Overlay
   - Canvas Scaler:
     - UI Scale Mode: Scale With Screen Size
     - Reference Resolution: 1920×1080

### B. Create HUD

1. Create empty GameObject as child of Canvas, name it "HUD"
2. Add `HUDManager` script to HUD

### C. Create Crosshair

1. UI → Image (child of HUD)
2. Name: "Crosshair"
3. Set sprite to a crosshair texture (or use + symbol)
4. Anchor: Center
5. Position: (0, 0, 0)
6. Size: 32×32
7. Drag to HUDManager's "Crosshair" field

### D. Create Hotbar

1. UI → Panel (child of HUD)
2. Name: "HotbarPanel"
3. Anchor: Bottom-Center
4. Position: (0, 50, 0)
5. Size: 720×80
6. Add Horizontal Layout Group component:
   - Spacing: 10
   - Child Alignment: Middle Center

### E. Create Hotbar Slot Prefab

1. UI → Image (child of HotbarPanel)
2. Name: "HotbarSlot"
3. Size: 70×70
4. Add Outline component (for selection indicator)
5. Drag to Project to create prefab
6. Delete from scene
7. Assign to HUDManager's "Hotbar Slot Prefab" field
8. Assign HotbarPanel to HUDManager's "Hotbar Panel" field

### F. Create Challenge Panel

1. UI → Panel (child of Canvas)
2. Name: "ChallengePanel"
3. Anchor: Center
4. Size: 800×600
5. Background color: Semi-transparent black

Add children to ChallengePanel:

**Question Text:**
```
UI → Text (TextMeshPro recommended)
Name: "QuestionText"
Anchor: Top-stretch
Position: (0, -50, 0)
Size: 700×300
Font Size: 24
Alignment: Center
```

**Answer Input:**
```
UI → Input Field
Name: "AnswerInput"
Anchor: Middle-Center
Position: (0, -50, 0)
Size: 600×50
```

**Submit Button:**
```
UI → Button
Name: "SubmitButton"
Anchor: Bottom-Center
Position: (0, 100, 0)
Text: "Submit Answer"
```

**Hint Button:**
```
UI → Button
Name: "HintButton"
Anchor: Bottom-Center
Position: (0, 50, 0)
Text: "Show Hint"
```

Assign all to HUDManager component.

### G. Create Subtitle Panel

1. UI → Panel (child of HUD)
2. Name: "SubtitlePanel"
3. Anchor: Bottom-stretch
4. Position: (0, 100, 0)
5. Height: 60

Add child:
```
UI → Text
Name: "SubtitleText"
Anchor: Stretch
Size: Full
Font Size: 18
Alignment: Center
```

Assign to HUDManager.

## Step 6: Setup Voice AI

1. Add empty GameObject to GameManagers
2. Add `VoiceAIClient` script
3. Add `MicrophoneRecorder` script
4. Create AudioSource component
5. Assign AudioSource to VoiceAIClient

## Step 7: Configure Layers

1. Edit → Project Settings → Tags and Layers
2. Add new layer: "Blocks"
3. Select all ChunkPrefab → Set Layer → Blocks
4. On PlayerInteraction component:
   - Block Layer: Select "Blocks"

## Step 8: Configure Input

Unity's new Input System (optional but recommended):

1. Window → Package Manager
2. Install "Input System"
3. Create `Assets/Settings/InputActions.inputactions`
4. Add actions:
   - Move (Vector2)
   - Look (Vector2)
   - Jump (Button)
   - Break (Button)
   - Place (Button)
   - Interact (Button)

Or use old Input Manager (already set up in PlayerController).

## Step 9: Create Curriculum Database

1. Right-click in Project → Create → EduCraft → Curriculum Database
2. Name: "MainCurriculum"
3. Select it in Inspector
4. Click "Initialize Default Questions" (custom inspector needed)
5. Or manually add questions via script
6. Assign to AITutorManager's "Curriculum" field

## Step 10: Build Settings

1. File → Build Settings
2. Add Scenes/MainGame.unity
3. Platform: Standalone (Windows/Mac/Linux)
4. Architecture: x86_64

## Step 11: Test Run

1. Click Play button
2. You should:
   - See generated terrain
   - Be able to move with WASD
   - Look with mouse
   - Break/place blocks
3. Check Console for errors

## Common Issues and Fixes

### Terrain Not Generating
- Check WorldManager has material assigned
- Verify Player is tagged correctly
- Check ChunkPrefab has all components

### Can't Break Blocks
- Ensure chunks are on "Blocks" layer
- Check PlayerInteraction has layer set
- Verify MeshCollider is on chunks

### Player Falls Through World
- Check CharacterController is properly sized
- Ensure player Y position starts at 75+
- Verify chunks have colliders

### UI Not Showing
- Check Canvas render mode
- Verify HUDManager references are assigned
- Ensure UI is on UI layer

## Performance Tips

1. **View Distance**: Start with 4-6 chunks for testing
2. **Editor**: Use "Maximize on Play" for better performance
3. **Profiler**: Window → Analysis → Profiler to check performance

## Next Steps

1. Create custom block textures
2. Add more curriculum questions
3. Set up backend server (see backend/README.md)
4. Test voice AI integration
5. Customize reward blocks
6. Add sound effects

## Recommended Unity Packages

- **ProBuilder**: For creating custom models
- **TextMesh Pro**: Better text rendering (included in Unity)
- **Cinemachine**: Advanced camera controls
- **Post Processing**: Visual effects

## Project Settings Recommendations

### Quality Settings
- Edit → Project Settings → Quality
- Create "Low", "Medium", "High" presets
- Adjust for target platform

### Graphics Settings
- Use URP for better performance
- Enable post-processing for polish
- Configure shadows for balance

### Audio Settings
- Import audio clips for:
  - Block breaking
  - Block placing
  - Correct answer
  - Wrong answer
  - Background music

## Version Control Setup (Git)

Create `.gitignore`:
```gitignore
# Unity
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# Visual Studio
.vs/
*.csproj
*.sln

# OS
.DS_Store
Thumbs.db

# Sensitive
backend/.env
*.pem
*.key
```

Initialize:
```bash
git init
git add .
git commit -m "Initial EduCraft setup"
```

## Congratulations! 🎉

Your EduCraft Unity project is now set up and ready for development!

**Quick Checklist:**
- [X] Scripts imported and compiled
- [X] Scene created with World, Player, and Camera
- [X] UI components created and linked
- [X] Game managers configured
- [X] Voice AI client ready
- [X] Curriculum database initialized

Start the backend server and press Play to begin learning through gameplay!
