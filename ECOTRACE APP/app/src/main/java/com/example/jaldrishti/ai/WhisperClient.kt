package com.example.jaldrishti.ai

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.coroutines.resume

/**
 * Android Speech Recognition Client (replaces Whisper for better mobile compatibility)
 */
class WhisperClient(private val context: Context) {
    
    suspend fun transcribeAudio(audioFile: File, language: String = "auto"): String = withContext(Dispatchers.IO) {
        // For now, return a placeholder since we'll use real-time speech recognition
        // This method is called after recording, but we'll implement real-time recognition instead
        return@withContext "Audio recorded successfully. Please use real-time speech recognition."
    }
    
    suspend fun recognizeSpeech(languageCode: String = "en-US"): String = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { continuation ->
            if (!SpeechRecognizer.isRecognitionAvailable(context)) {
                continuation.resume("Speech recognition not available on this device")
                return@suspendCancellableCoroutine
            }
            
            val speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageCode)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
            
            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d("WhisperClient", "Ready for speech")
                }
                
                override fun onBeginningOfSpeech() {
                    Log.d("WhisperClient", "Speech started")
                }
                
                override fun onRmsChanged(rmsdB: Float) {}
                
                override fun onBufferReceived(buffer: ByteArray?) {}
                
                override fun onEndOfSpeech() {
                    Log.d("WhisperClient", "Speech ended")
                }
                
                override fun onError(error: Int) {
                    val errorMessage = when (error) {
                        SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                        SpeechRecognizer.ERROR_CLIENT -> "Client side error"
                        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                        SpeechRecognizer.ERROR_NETWORK -> "Network error"
                        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                        SpeechRecognizer.ERROR_NO_MATCH -> "No speech input detected"
                        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
                        SpeechRecognizer.ERROR_SERVER -> "Server error"
                        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
                        else -> "Unknown error"
                    }
                    Log.e("WhisperClient", "Speech recognition error: $errorMessage")
                    speechRecognizer.destroy()
                    continuation.resume("Speech recognition failed: $errorMessage")
                }
                
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val transcription = matches?.firstOrNull() ?: "No speech detected"
                    Log.d("WhisperClient", "Transcription: $transcription")
                    speechRecognizer.destroy()
                    continuation.resume(transcription)
                }
                
                override fun onPartialResults(partialResults: Bundle?) {
                    val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    Log.d("WhisperClient", "Partial: ${matches?.firstOrNull()}")
                }
                
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
            
            continuation.invokeOnCancellation {
                speechRecognizer.destroy()
            }
            
            speechRecognizer.startListening(intent)
        }
    }
    
    suspend fun testConnection(): Boolean = withContext(Dispatchers.IO) {
        return@withContext SpeechRecognizer.isRecognitionAvailable(context)
    }
    
    private fun getLanguageCode(language: String): String {
        return when (language.lowercase()) {
            "hindi" -> "hi-IN"
            "marathi" -> "mr-IN"
            "tamil" -> "ta-IN"
            "telugu" -> "te-IN"
            "gujarati" -> "gu-IN"
            "bengali" -> "bn-IN"
            "kannada" -> "kn-IN"
            "malayalam" -> "ml-IN"
            "punjabi" -> "pa-IN"
            "urdu" -> "ur-IN"
            else -> "en-US"
        }
    }
}