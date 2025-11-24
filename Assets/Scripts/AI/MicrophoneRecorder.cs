using UnityEngine;

namespace EduCraft.AI
{
    /// <summary>
    /// Records audio from microphone for voice input
    /// </summary>
    public class MicrophoneRecorder : MonoBehaviour
    {
        public static MicrophoneRecorder Instance { get; private set; }

        [Header("Recording Settings")]
        public int recordingFrequency = 16000;
        public int maxRecordingLength = 10; // seconds

        private AudioClip recordingClip;
        private bool isRecording = false;
        private string microphoneDevice;

        public delegate void RecordingDelegate(AudioClip clip);
        public event RecordingDelegate OnRecordingComplete;

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

            // Get default microphone
            if (Microphone.devices.Length > 0)
            {
                microphoneDevice = Microphone.devices[0];
                Debug.Log($"Using microphone: {microphoneDevice}");
            }
            else
            {
                Debug.LogError("No microphone detected!");
            }
        }

        /// <summary>
        /// Start recording from microphone
        /// </summary>
        public void StartRecording()
        {
            if (isRecording)
            {
                Debug.LogWarning("Already recording!");
                return;
            }

            if (string.IsNullOrEmpty(microphoneDevice))
            {
                Debug.LogError("No microphone available!");
                return;
            }

            recordingClip = Microphone.Start(microphoneDevice, false, maxRecordingLength, recordingFrequency);
            isRecording = true;

            Debug.Log("Recording started...");
        }

        /// <summary>
        /// Stop recording and return audio clip
        /// </summary>
        public void StopRecording()
        {
            if (!isRecording)
            {
                Debug.LogWarning("Not currently recording!");
                return;
            }

            int position = Microphone.GetPosition(microphoneDevice);
            Microphone.End(microphoneDevice);
            isRecording = false;

            // Trim the audio clip to actual recorded length
            AudioClip trimmedClip = TrimAudioClip(recordingClip, position);

            Debug.Log($"Recording stopped. Length: {trimmedClip.length} seconds");

            OnRecordingComplete?.Invoke(trimmedClip);
        }

        /// <summary>
        /// Trim audio clip to specific length
        /// </summary>
        AudioClip TrimAudioClip(AudioClip clip, int samples)
        {
            if (samples <= 0 || samples >= clip.samples)
                return clip;

            float[] data = new float[samples * clip.channels];
            clip.GetData(data, 0);

            AudioClip trimmedClip = AudioClip.Create(
                "RecordedAudio",
                samples,
                clip.channels,
                clip.frequency,
                false
            );

            trimmedClip.SetData(data, 0);
            return trimmedClip;
        }

        /// <summary>
        /// Check if currently recording
        /// </summary>
        public bool IsRecording()
        {
            return isRecording;
        }

        /// <summary>
        /// Toggle recording on/off
        /// </summary>
        public void ToggleRecording()
        {
            if (isRecording)
            {
                StopRecording();
            }
            else
            {
                StartRecording();
            }
        }
    }
}
