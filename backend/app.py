"""
EduCraft Voice AI Backend Service
Handles STT -> LLM -> TTS pipeline for educational voice interactions
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import tempfile
from datetime import datetime

# AI Service imports (install with: pip install openai google-cloud-speech google-cloud-texttospeech)
import openai
from google.cloud import speech_v1 as speech
from google.cloud import texttospeech

app = Flask(__name__)
CORS(app)  # Enable CORS for Unity client

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Initialize API clients
openai.api_key = OPENAI_API_KEY
speech_client = speech.SpeechClient()
tts_client = texttospeech.TextToSpeechClient()

# Conversation history (in production, use a database)
conversation_history = {}


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


@app.route('/process_voice', methods=['POST'])
def process_voice():
    """
    Main endpoint for voice processing pipeline:
    1. Receive audio from Unity
    2. Convert to text (STT)
    3. Process with LLM
    4. Convert response to speech (TTS)
    5. Return both text and audio URL
    """
    try:
        # Get audio file and context
        audio_file = request.files.get('audio')
        context = request.form.get('context', '')

        if not audio_file:
            return jsonify({"error": "No audio file provided"}), 400

        # Read audio data
        audio_data = audio_file.read()

        # Step 1: Speech-to-Text
        transcript = speech_to_text(audio_data)
        print(f"Transcribed: {transcript}")

        # Step 2: LLM Processing
        llm_response, is_correct = process_with_llm(transcript, context)
        print(f"LLM Response: {llm_response}")

        # Step 3: Text-to-Speech
        audio_url = text_to_speech(llm_response)
        print(f"TTS Audio: {audio_url}")

        return jsonify({
            "text": llm_response,
            "audio_url": audio_url,
            "is_correct": is_correct,
            "transcript": transcript
        })

    except Exception as e:
        print(f"Error in process_voice: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/evaluate_answer', methods=['POST'])
def evaluate_answer():
    """
    Text-only answer evaluation (no voice)
    Used for testing and as fallback
    """
    try:
        question = request.form.get('question')
        answer = request.form.get('answer')
        context = request.form.get('context', '')

        if not question or not answer:
            return jsonify({"error": "Question and answer required"}), 400

        # Process with LLM
        llm_response, is_correct = evaluate_with_llm(question, answer, context)

        return jsonify({
            "text": llm_response,
            "is_correct": is_correct
        })

    except Exception as e:
        print(f"Error in evaluate_answer: {str(e)}")
        return jsonify({"error": str(e)}), 500


def speech_to_text(audio_data):
    """
    Convert audio to text using Google Speech-to-Text
    Alternative: OpenAI Whisper
    """
    try:
        # Google Speech-to-Text
        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
        )

        response = speech_client.recognize(config=config, audio=audio)

        # Get transcript
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript

        return transcript.strip()

    except Exception as e:
        print(f"STT Error: {str(e)}")
        # Fallback: OpenAI Whisper
        return whisper_transcribe(audio_data)


def whisper_transcribe(audio_data):
    """
    Fallback STT using OpenAI Whisper
    """
    try:
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name

        # Transcribe with Whisper
        with open(temp_path, 'rb') as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)

        # Clean up
        os.unlink(temp_path)

        return transcript['text']

    except Exception as e:
        print(f"Whisper Error: {str(e)}")
        return ""


def process_with_llm(user_input, context):
    """
    Process user input with LLM (GPT-4 or Claude)
    Returns: (response_text, is_correct)
    """
    try:
        # Build prompt with context
        system_prompt = """You are Steve from Minecraft, a friendly AI tutor helping a third-grader learn.
        You are patient, encouraging, and make learning fun.

        When evaluating answers:
        - Be generous with partial credit
        - Provide gentle corrections
        - Celebrate correct answers enthusiastically
        - Offer hints for wrong answers

        Keep responses conversational and age-appropriate."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context: {context}\n\nStudent said: {user_input}"}
        ]

        # Call GPT-4
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )

        response_text = response.choices[0].message.content

        # Determine if answer is correct (simplified)
        is_correct = determine_correctness(response_text)

        return response_text, is_correct

    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return "I'm having trouble processing that. Could you try again?", False


def evaluate_with_llm(question, answer, context):
    """
    Evaluate a specific question/answer pair
    """
    try:
        system_prompt = """You are an educational AI evaluating a third-grader's answer.
        Determine if the answer is correct and provide friendly feedback.

        Response format:
        - Start with "Correct!" or "Not quite."
        - Explain why briefly
        - For wrong answers, give the correct answer
        - Keep it encouraging"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Question: {question}\n\nStudent's answer: {answer}\n\nContext: {context}"}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.3,
            max_tokens=150
        )

        response_text = response.choices[0].message.content
        is_correct = "correct!" in response_text.lower()

        return response_text, is_correct

    except Exception as e:
        print(f"Evaluation Error: {str(e)}")
        return "I couldn't evaluate that answer. Please try again.", False


def text_to_speech(text):
    """
    Convert text to speech using Google TTS
    Returns URL to audio file
    """
    try:
        # Set up TTS request
        synthesis_input = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Neural2-J",  # Male voice
            ssml_gender=texttospeech.SsmlVoiceGender.MALE
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            speaking_rate=0.9,  # Slightly slower for clarity
            pitch=0.0
        )

        # Generate speech
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Save to temporary file
        audio_filename = f"response_{datetime.now().timestamp()}.wav"
        audio_path = os.path.join(tempfile.gettempdir(), audio_filename)

        with open(audio_path, 'wb') as out:
            out.write(response.audio_content)

        # Return URL (in production, upload to cloud storage)
        return f"/audio/{audio_filename}"

    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return None


@app.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        audio_path = os.path.join(tempfile.gettempdir(), filename)
        return send_file(audio_path, mimetype='audio/wav')
    except Exception as e:
        return jsonify({"error": str(e)}), 404


def determine_correctness(response_text):
    """
    Simple heuristic to determine if answer was correct
    based on LLM response
    """
    correct_indicators = ["correct", "right", "great job", "perfect", "excellent", "yes!"]
    incorrect_indicators = ["not quite", "incorrect", "wrong", "try again", "actually"]

    response_lower = response_text.lower()

    for indicator in correct_indicators:
        if indicator in response_lower:
            return True

    for indicator in incorrect_indicators:
        if indicator in response_lower:
            return False

    return False  # Default to incorrect if unclear


if __name__ == '__main__':
    # Run Flask server
    print("Starting EduCraft Voice AI Backend...")
    print("Ensure OPENAI_API_KEY and GOOGLE_APPLICATION_CREDENTIALS are set")
    app.run(host='0.0.0.0', port=5000, debug=True)
