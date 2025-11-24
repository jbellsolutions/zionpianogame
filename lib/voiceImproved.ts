// Improved voice service with real-time two-way conversation

export class VoiceServiceImproved {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isTalking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
      this.synthesis = window.speechSynthesis;

      // Load voices
      if (this.synthesis) {
        // Chrome loads voices asynchronously
        if (this.synthesis.getVoices().length === 0) {
          this.synthesis.addEventListener('voiceschanged', () => {
            console.log('Voices loaded:', this.synthesis!.getVoices().length);
          });
        }
      }
    }
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    } else {
      console.warn('Speech recognition not available');
    }
  }

  // Start listening with live feedback
  async startListening(callbacks: {
    onInterim?: (text: string) => void;
    onFinal: (text: string) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }): Promise<void> {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    // Stop speaking if currently talking
    if (this.isTalking) {
      this.stopSpeaking();
    }

    this.isListening = true;

    this.recognition.onstart = () => {
      console.log('🎤 Listening started');
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      const current = event.results.length - 1;
      const result = event.results[current];
      const transcript = result[0].transcript;

      console.log(`${result.isFinal ? 'Final' : 'Interim'} result:`, transcript);

      if (result.isFinal) {
        callbacks.onFinal(transcript);
      } else if (callbacks.onInterim) {
        callbacks.onInterim(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      this.isListening = false;

      let errorMessage = 'Something went wrong';
      if (event.error === 'no-speech') {
        errorMessage = "I didn't hear anything. Try again!";
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Please allow microphone access in your browser settings.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Check your connection.';
      } else if (event.error === 'aborted') {
        return; // Don't show error for user abort
      }

      callbacks.onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      console.log('🎤 Listening stopped');
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      this.isListening = false;
      if (error.name === 'InvalidStateError') {
        // Recognition already started, stop and restart
        this.recognition.stop();
        setTimeout(() => this.startListening(callbacks), 100);
      } else {
        callbacks.onError?.('Could not start microphone. Please try again.');
      }
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      this.isListening = false;
    }
  }

  // Speak with better voice selection and callbacks
  async speak(text: string, options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      options?.onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 0.95; // Slightly slower for clarity
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;

      // Select best voice
      const voices = this.synthesis!.getVoices();
      console.log('Available voices:', voices.length);

      // Prefer these voices in order
      const preferredVoiceNames = [
        'Google US English',
        'Microsoft David',
        'Alex',
        'Daniel',
        'Samantha'
      ];

      let selectedVoice = null;
      for (const voiceName of preferredVoiceNames) {
        selectedVoice = voices.find(v =>
          v.name.includes(voiceName) && v.lang.startsWith('en')
        );
        if (selectedVoice) break;
      }

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en-US')) ||
                       voices.find(v => v.lang.startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      }

      utterance.onstart = () => {
        console.log('🔊 Speaking started');
        this.isTalking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        console.log('🔊 Speaking ended');
        this.isTalking = false;
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (error: any) => {
        console.error('Speech synthesis error:', error);
        this.isTalking = false;
        options?.onError?.(error);
        resolve();
      };

      try {
        this.synthesis.speak(utterance);
      } catch (error: any) {
        console.error('Error initiating speech:', error);
        this.isTalking = false;
        options?.onError?.(error);
        resolve();
      }
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isTalking = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isCurrentlySpeaking(): boolean {
    return this.isTalking || (this.synthesis?.speaking ?? false);
  }

  // Check if browser supports voice features
  static isSupported(): { recognition: boolean; synthesis: boolean } {
    const hasRecognition =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const hasSynthesis =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    return {
      recognition: hasRecognition,
      synthesis: hasSynthesis,
    };
  }
}

// 11Labs integration for premium voice quality
export async function speakWith11Labs(
  text: string,
  apiKey: string,
  options?: {
    voiceId?: string;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  const voiceId = options?.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam - friendly male voice

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`11Labs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      options?.onEnd?.();
    };

    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
      options?.onError?.(new Error('Audio playback failed'));
    };

    await audio.play();
  } catch (error: any) {
    console.error('11Labs error:', error);
    options?.onError?.(error);
    throw error;
  }
}
