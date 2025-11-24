# EduCraft Development Notes

Technical notes and decisions for the development team.

## Architecture Decisions

### Why Unity?
- **Mature 3D Engine**: Well-suited for voxel games
- **C# Language**: Easy to learn, good performance
- **Cross-Platform**: Can deploy to Windows, Mac, mobile, web
- **Asset Store**: Many educational game templates and assets
- **Large Community**: Abundant tutorials and support

### Why Flask for Backend?
- **Simplicity**: Easy to set up and deploy
- **Python**: Ideal for AI/ML integrations
- **Flexibility**: Easy to swap AI services
- **RESTful**: Standard API pattern

## Code Organization

### Namespace Structure
```csharp
EduCraft.Core        // Fundamental systems (blocks, voxel data)
EduCraft.World       // World generation and management
EduCraft.Player      // Player controls and interaction
EduCraft.Crafting    // Inventory and crafting
EduCraft.Education   // Educational content and logic
EduCraft.AI          // Voice AI integration
EduCraft.UI          // User interface
```

### Design Patterns Used

**Singleton Pattern**:
- WorldManager, InventoryManager, CraftingManager
- Ensures single instance, global access
- Convenient for manager classes

**Observer Pattern**:
- Events for inventory changes, rewards, challenges
- Loose coupling between systems
- Easy to extend functionality

**Factory Pattern**:
- Block creation from BlockType enum
- Recipe creation in CraftingManager

**Component Pattern**:
- Unity's GameObject/Component system
- Separation of concerns (movement, interaction, etc.)

## Performance Considerations

### Chunk System
- **Chunk Size**: 16×256×16 blocks
  - Width/Depth: 16 = good balance (Minecraft uses 16)
  - Height: 256 = allows tall mountains
- **View Distance**: 8 chunks = 128 blocks radius
  - Adjustable based on performance
- **Loading Strategy**: Load chunks in spiral pattern around player
- **Unloading**: Remove chunks beyond view distance + 1

### Mesh Generation
- **Current**: Generate mesh per chunk with face culling
- **Optimization Needed**: Greedy meshing algorithm
  - Combines adjacent faces of same block type
  - Reduces vertex count by ~80%
  - Implementation: TODO in Milestone 5

### Memory Management
- **Block Storage**: byte[,,] array (1 byte per block)
  - 16×256×16 = 65,536 bytes per chunk = ~64 KB
  - 100 loaded chunks = ~6.4 MB for block data
- **Mesh Storage**: Shared material reduces draw calls
- **Texture Atlas**: Single texture for all blocks reduces batches

## Educational Design

### Curriculum Alignment
Based on Common Core State Standards for 3rd Grade:

**Math**:
- 3.OA.C.7: Multiplication/division within 100
- 3.NF.A.1: Understand fractions
- 3.MD.C.7: Area and perimeter

**Science**:
- Next Generation Science Standards (NGSS)
- 3-LS1: Life cycles and traits
- 3-PS2: Forces and interactions
- 3-ESS2: Earth systems

**Reading**:
- CCSS.ELA-LITERACY.RL.3.1: Ask and answer questions
- CCSS.ELA-LITERACY.RI.3.2: Main idea

### Adaptive Difficulty Algorithm
```
consecutiveCorrect >= 3 → increase difficulty
consecutiveIncorrect >= 2 → decrease difficulty

Current Difficulty Tier determines next question probability:
- Easy Tier: 70% Easy, 25% Medium, 5% Hard
- Medium Tier: 15% Easy, 70% Medium, 15% Hard
- Hard Tier: 5% Easy, 30% Medium, 65% Hard
```

### Reward Balance
```
Easy Question: 1 shard
Medium Question: 2 shards
Hard Question: 3 shards

Recipe Costs (examples):
- Glowing Block: 10 Easy Shards
- Magic Wood: 5 Medium Shards
- Crystal Block: 3 Hard Shards
- Rainbow Block: 10 Hard + 20 Medium + 30 Easy Shards
```

## Voice AI Pipeline

### Latency Optimization
Target: <2 seconds total latency

**Breakdown**:
1. Unity → Backend: ~50ms (local network)
2. STT Processing: ~500ms (Google Speech-to-Text)
3. LLM Processing: ~800ms (GPT-4)
4. TTS Processing: ~400ms (Google TTS)
5. Backend → Unity: ~50ms
6. Audio Playback Start: ~100ms

**Total**: ~1.9 seconds

**Optimizations**:
- Stream audio while recording (reduces step 1)
- Use GPT-3.5-turbo for simple answers (reduces step 3 to ~300ms)
- Cache common responses (eliminates steps 3-4)
- Preload audio for frequent feedback ("Correct!", "Try again")

### Alternative AI Services

**STT Options**:
1. Google Speech-to-Text (current) - $0.006/15s
2. OpenAI Whisper - $0.006/minute
3. Azure Speech - $1/hour
4. AssemblyAI - $0.00025/second

**LLM Options**:
1. GPT-4 (current) - $0.03/1K tokens
2. GPT-3.5-turbo - $0.002/1K tokens (15× cheaper!)
3. Claude 3 Sonnet - $0.003/1K tokens
4. Llama 2 (self-hosted) - Free but needs GPU

**TTS Options**:
1. Google TTS (current) - $4/1M characters
2. ElevenLabs - $0.30/1K characters (more natural)
3. Azure TTS - $16/1M characters
4. Amazon Polly - $4/1M characters

### Cost Estimation
Assuming 100 students, 20 questions/day each:

**Daily Usage**:
- 2,000 questions × 10s audio = 20,000 seconds
- STT: 20,000s = $0.80
- LLM: ~50K tokens = $1.50
- TTS: ~100K characters = $0.40
- **Total**: $2.70/day = $81/month

**Optimization**:
- Use GPT-3.5 for simple checks: $0.10/day
- Cache TTS responses: $0.20/day
- **Optimized**: $1.10/day = $33/month

## Security Considerations

### API Key Protection
- ❌ NEVER embed API keys in Unity builds
- ✅ Always use backend server as proxy
- ✅ Implement rate limiting (max 60 requests/minute/student)
- ✅ Validate all inputs server-side

### Content Filtering
- Filter transcribed text for inappropriate content
- Sanitize all user inputs before LLM
- Use OpenAI's moderation endpoint
- Log flagged content for review

### Authentication (Future)
- Student login system
- Parent dashboard
- Teacher admin panel
- Progress encryption

## Testing Strategy

### Unit Tests
Test individual components:
```csharp
[Test]
public void TestBlockPlacement()
{
    WorldManager.SetBlockAtPosition(new Vector3(0, 70, 0), BlockType.Stone);
    Assert.AreEqual(BlockType.Stone, WorldManager.GetBlockAtPosition(new Vector3(0, 70, 0)));
}
```

### Integration Tests
Test system interactions:
- Inventory → Crafting flow
- Challenge → Reward flow
- Voice → Backend → Response flow

### Playtest Focus Areas
1. **Controls**: Intuitive for age group?
2. **Difficulty**: Questions appropriately challenging?
3. **Engagement**: Kids want to keep playing?
4. **Learning**: Actually teaching the concepts?
5. **Voice AI**: Responses natural and helpful?

## Known Limitations

### Current Issues
1. **No Greedy Meshing**: High vertex count
2. **Single Biome**: All terrain looks similar
3. **No Day/Night**: Always daytime
4. **No Sound**: Silent gameplay
5. **No Save System**: Progress lost on quit
6. **Text-Only Challenges**: Voice AI not fully integrated in Unity
7. **Basic UI**: Functional but not polished

### Planned Improvements
See Milestone 5 in EDUCRAFT_README.md

## Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-biome`
2. Implement in code
3. Test in Unity Editor
4. Update documentation
5. Create pull request
6. Review and merge

### Code Review Checklist
- [ ] Code follows C# naming conventions
- [ ] All public methods have XML documentation
- [ ] No hardcoded magic numbers
- [ ] Performance impact considered
- [ ] Educational value maintained
- [ ] Age-appropriate content

### Version Numbering
- Major.Minor.Patch (e.g., 1.2.3)
- Major: Milestone completion
- Minor: New features
- Patch: Bug fixes

Current: **0.4.0** (Milestone 4 complete)

## Useful Resources

### Unity Voxel Tutorials
- Sebastian Lague: "Coding Adventure: Minecraft"
- Brackeys: "How to make Minecraft in Unity"
- GamesPlusJames: Voxel Engine series

### Educational Game Design
- "Game-Based Learning" by Marc Prensky
- "Reality is Broken" by Jane McGonigal
- GDC talks on educational games

### AI Integration
- OpenAI Cookbook: Best practices
- Google Cloud Speech samples
- Unity ML-Agents documentation

## Future Enhancements

### Multiplayer (v2.0)
- P2P networking with Mirror/Photon
- Cooperative learning challenges
- Shared world building

### Mobile Version (v2.5)
- Touch controls
- Reduced graphics for mobile GPUs
- Offline mode with syncing

### VR Support (v3.0)
- Full room-scale VR
- Hand tracking for block manipulation
- Voice AI perfect for VR

### Expanded Curriculum
- Grades 1-5 (not just 3rd)
- More subjects (history, geography)
- Multiple languages
- Accessibility features (dyslexia-friendly fonts)

## Contributing Guidelines

### Code Style
```csharp
// Use PascalCase for public members
public void CalculateScore() { }

// Use camelCase for private members
private int playerScore;

// Use SCREAMING_CASE for constants
private const int MAX_HEALTH = 100;

// Always use explicit access modifiers
public class MyClass { }  // Good
class MyClass { }         // Bad (implicit internal)
```

### Git Commit Messages
```
feat: Add new biome generation system
fix: Resolve chunk loading crash
docs: Update setup guide
refactor: Simplify mesh generation code
perf: Optimize chunk update loop
test: Add unit tests for crafting
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Performance improvement

## Testing Done
- [ ] Tested in Unity Editor
- [ ] Tested build
- [ ] Backend API tested

## Screenshots
(if applicable)
```

## Contact

For questions or discussions:
- GitHub Issues: Technical bugs
- Discussions: Feature ideas
- Email: For sensitive/private matters

---

**Remember**: The goal is to make learning fun! Every feature should serve the educational mission. 🎓✨
