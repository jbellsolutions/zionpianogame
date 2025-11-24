# EduCraft Voice AI Backend

This backend service handles the voice AI pipeline for EduCraft:
**Speech-to-Text → LLM Processing → Text-to-Speech**

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Keys

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google Cloud Credentials**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a project and enable Speech-to-Text and Text-to-Speech APIs
  3. Create a service account and download the JSON key
  4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file

### 3. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /process_voice
Process voice audio through the full AI pipeline.

**Request:**
- `audio` (file): WAV audio file
- `context` (string): Context for the AI (question, subject, etc.)

**Response:**
```json
{
  "text": "Great job! That's correct!",
  "audio_url": "/audio/response_123.wav",
  "is_correct": true,
  "transcript": "The answer is 42"
}
```

### POST /evaluate_answer
Text-only answer evaluation (no voice).

**Request:**
- `question` (string): The question asked
- `answer` (string): Student's answer
- `context` (string): Additional context

**Response:**
```json
{
  "text": "Correct! Well done!",
  "is_correct": true
}
```

### GET /health
Health check endpoint.

## Architecture

```
Unity Client → Flask Backend → AI Services
                    ↓
              ┌─────┴─────┐
              ↓           ↓           ↓
         Google STT   OpenAI GPT-4   Google TTS
```

## Alternative AI Services

### Using OpenAI Whisper for STT
Already implemented as fallback in `whisper_transcribe()`

### Using Anthropic Claude for LLM
Replace the `openai.ChatCompletion.create()` call with:

```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=200,
    messages=[{"role": "user", "content": user_input}]
)
```

### Using ElevenLabs for TTS
For more natural voice:

```python
from elevenlabs import generate, play

audio = generate(
    text=text,
    voice="Steve",  # Custom voice
    model="eleven_monolingual_v1"
)
```

## Optimization Tips

### Reduce Latency
1. **Stream responses**: Implement streaming STT and TTS
2. **Parallel processing**: Run STT and LLM preparation in parallel
3. **Cache common responses**: Cache frequently given feedback
4. **Use faster models**: GPT-3.5-turbo instead of GPT-4 for simple evaluations

### Cost Optimization
1. **Batch requests**: Group multiple evaluations
2. **Use cheaper models**: Mix GPT-4 and GPT-3.5 based on complexity
3. **Implement rate limiting**: Prevent excessive API calls
4. **Local STT**: Use offline Whisper for reduced cost

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### Deploy to Cloud

**Option 1: Google Cloud Run**
```bash
gcloud run deploy educraft-backend --source .
```

**Option 2: AWS Elastic Beanstalk**
```bash
eb init -p python-3.11 educraft-backend
eb create educraft-env
```

**Option 3: Railway/Render**
- Connect GitHub repo
- Auto-deploys on push

## Security

- **Never expose API keys** in Unity client
- **Implement authentication**: Add API key validation
- **Rate limiting**: Prevent abuse
- **Input validation**: Sanitize all inputs
- **Content filtering**: Block inappropriate content

## Monitoring

Add logging and monitoring:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Processing request from {request.remote_addr}")
```

## Troubleshooting

**Issue**: "No module named 'google'"
- Solution: `pip install google-cloud-speech google-cloud-texttospeech`

**Issue**: "Authentication failed"
- Solution: Check that `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON

**Issue**: "Slow responses"
- Solution: Use GPT-3.5-turbo or implement caching

**Issue**: "Audio format error"
- Solution: Ensure Unity sends 16kHz mono WAV files
