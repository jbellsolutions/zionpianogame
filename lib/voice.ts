// Voice recognition and synthesis utilities

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }

      // Initialize speech synthesis
      this.synthesis = window.speechSynthesis;
    }
  }

  // Start listening to user's voice
  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.isListening = false;
      onError?.('Could not start listening');
    }
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Speak text using browser TTS
  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a friendly male voice (like Steve!)
    const voices = this.synthesis.getVoices();
    const maleVoice = voices.find(
      (voice) =>
        voice.name.includes('Male') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('David')
    );
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }
}

// Optional: 11Labs integration for higher quality voice
export async function speak11Labs(text: string, apiKey: string): Promise<void> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    }
  } catch (error) {
    console.error('11Labs error:', error);
  }
}
