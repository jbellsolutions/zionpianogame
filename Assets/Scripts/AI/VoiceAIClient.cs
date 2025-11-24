using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace EduCraft.AI
{
    /// <summary>
    /// Client for communicating with the voice AI backend service
    /// </summary>
    public class VoiceAIClient : MonoBehaviour
    {
        public static VoiceAIClient Instance { get; private set; }

        [Header("Backend Settings")]
        public string backendURL = "http://localhost:5000";

        [Header("Audio")]
        public AudioSource audioSource;

        private bool isProcessing = false;

        public delegate void ResponseDelegate(string text, AudioClip audio);
        public delegate void ErrorDelegate(string error);

        public event ResponseDelegate OnResponseReceived;
        public event ErrorDelegate OnError;

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

            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
        }

        /// <summary>
        /// Send voice audio to backend for processing
        /// </summary>
        public void ProcessVoiceInput(AudioClip audioClip, string context)
        {
            if (isProcessing)
            {
                Debug.LogWarning("Already processing voice input!");
                return;
            }

            StartCoroutine(ProcessVoiceInputCoroutine(audioClip, context));
        }

        /// <summary>
        /// Process voice input through the AI pipeline
        /// </summary>
        IEnumerator ProcessVoiceInputCoroutine(AudioClip audioClip, string context)
        {
            isProcessing = true;

            // Convert audio clip to WAV bytes
            byte[] audioData = WavUtility.FromAudioClip(audioClip);

            // Create form data
            WWWForm form = new WWWForm();
            form.AddBinaryData("audio", audioData, "audio.wav", "audio/wav");
            form.AddField("context", context);

            // Send to backend
            using (UnityWebRequest request = UnityWebRequest.Post($"{backendURL}/process_voice", form))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    // Parse response
                    VoiceResponse response = JsonUtility.FromJson<VoiceResponse>(request.downloadHandler.text);

                    if (response != null && !string.IsNullOrEmpty(response.text))
                    {
                        // Download audio response
                        yield return StartCoroutine(DownloadAudioResponse(response.audio_url, response.text));
                    }
                    else
                    {
                        OnError?.Invoke("Invalid response from backend");
                    }
                }
                else
                {
                    OnError?.Invoke($"Backend error: {request.error}");
                }
            }

            isProcessing = false;
        }

        /// <summary>
        /// Download audio response from backend
        /// </summary>
        IEnumerator DownloadAudioResponse(string audioURL, string text)
        {
            using (UnityWebRequest request = UnityWebRequestMultimedia.GetAudioClip(audioURL, AudioType.WAV))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    AudioClip clip = DownloadHandlerAudioClip.GetContent(request);
                    OnResponseReceived?.Invoke(text, clip);

                    // Play audio
                    if (audioSource != null)
                    {
                        audioSource.clip = clip;
                        audioSource.Play();
                    }
                }
                else
                {
                    // Text-only response if audio fails
                    OnResponseReceived?.Invoke(text, null);
                    OnError?.Invoke($"Audio download failed: {request.error}");
                }
            }
        }

        /// <summary>
        /// Text-only evaluation (for testing without voice)
        /// </summary>
        public void EvaluateTextAnswer(string question, string answer, string context)
        {
            StartCoroutine(EvaluateTextAnswerCoroutine(question, answer, context));
        }

        /// <summary>
        /// Text-only evaluation coroutine
        /// </summary>
        IEnumerator EvaluateTextAnswerCoroutine(string question, string answer, string context)
        {
            WWWForm form = new WWWForm();
            form.AddField("question", question);
            form.AddField("answer", answer);
            form.AddField("context", context);

            using (UnityWebRequest request = UnityWebRequest.Post($"{backendURL}/evaluate_answer", form))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    TextResponse response = JsonUtility.FromJson<TextResponse>(request.downloadHandler.text);
                    OnResponseReceived?.Invoke(response.text, null);
                }
                else
                {
                    OnError?.Invoke($"Backend error: {request.error}");
                }
            }
        }

        [Serializable]
        private class VoiceResponse
        {
            public string text;
            public string audio_url;
            public bool is_correct;
        }

        [Serializable]
        private class TextResponse
        {
            public string text;
            public bool is_correct;
        }
    }

    /// <summary>
    /// Utility class for converting AudioClip to WAV format
    /// </summary>
    public static class WavUtility
    {
        public static byte[] FromAudioClip(AudioClip clip)
        {
            // Simplified WAV conversion
            // In production, use a proper WAV encoding library

            float[] samples = new float[clip.samples * clip.channels];
            clip.GetData(samples, 0);

            byte[] wavData = new byte[samples.Length * 2 + 44]; // 16-bit samples + WAV header

            // Write WAV header
            WriteWavHeader(wavData, clip.frequency, clip.channels, samples.Length);

            // Convert samples to 16-bit PCM
            for (int i = 0; i < samples.Length; i++)
            {
                short sample = (short)(samples[i] * 32767f);
                byte[] sampleBytes = BitConverter.GetBytes(sample);
                wavData[44 + i * 2] = sampleBytes[0];
                wavData[44 + i * 2 + 1] = sampleBytes[1];
            }

            return wavData;
        }

        static void WriteWavHeader(byte[] wav, int frequency, int channels, int samples)
        {
            int byteRate = frequency * channels * 2;
            int dataSize = samples * 2;

            // RIFF header
            wav[0] = (byte)'R';
            wav[1] = (byte)'I';
            wav[2] = (byte)'F';
            wav[3] = (byte)'F';

            byte[] fileSizeBytes = BitConverter.GetBytes(dataSize + 36);
            Array.Copy(fileSizeBytes, 0, wav, 4, 4);

            wav[8] = (byte)'W';
            wav[9] = (byte)'A';
            wav[10] = (byte)'V';
            wav[11] = (byte)'E';

            // fmt chunk
            wav[12] = (byte)'f';
            wav[13] = (byte)'m';
            wav[14] = (byte)'t';
            wav[15] = (byte)' ';

            byte[] fmtSizeBytes = BitConverter.GetBytes(16);
            Array.Copy(fmtSizeBytes, 0, wav, 16, 4);

            byte[] formatBytes = BitConverter.GetBytes((short)1); // PCM
            Array.Copy(formatBytes, 0, wav, 20, 2);

            byte[] channelsBytes = BitConverter.GetBytes((short)channels);
            Array.Copy(channelsBytes, 0, wav, 22, 2);

            byte[] sampleRateBytes = BitConverter.GetBytes(frequency);
            Array.Copy(sampleRateBytes, 0, wav, 24, 4);

            byte[] byteRateBytes = BitConverter.GetBytes(byteRate);
            Array.Copy(byteRateBytes, 0, wav, 28, 4);

            byte[] blockAlignBytes = BitConverter.GetBytes((short)(channels * 2));
            Array.Copy(blockAlignBytes, 0, wav, 32, 2);

            byte[] bitsPerSampleBytes = BitConverter.GetBytes((short)16);
            Array.Copy(bitsPerSampleBytes, 0, wav, 34, 2);

            // data chunk
            wav[36] = (byte)'d';
            wav[37] = (byte)'a';
            wav[38] = (byte)'t';
            wav[39] = (byte)'a';

            byte[] dataSizeBytes = BitConverter.GetBytes(dataSize);
            Array.Copy(dataSizeBytes, 0, wav, 40, 4);
        }
    }
}
