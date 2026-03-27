package com.example.jaldrishti.ai

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.util.*
import java.util.concurrent.TimeUnit

/**
 * 11Labs Text-to-Speech Client
 */
class ElevenLabsTTS(
    private val apiKey: String
) {
    private val baseUrl = "https://api.elevenlabs.io/v1"
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()
    
    // Language-specific voice IDs (you can customize these)
    private val voiceIds = mapOf(
        "English" to "21m00Tcm4TlvDq8ikWAM",  // Default English voice (Rachel)
        "Hindi" to "pNInz6obpgDQGcFmaJgB",
        "Marathi" to "21m00Tcm4TlvDq8ikWAM", // Using default for now
        "Tamil" to "21m00Tcm4TlvDq8ikWAM",
        "Telugu" to "21m00Tcm4TlvDq8ikWAM",
        "Bengali" to "21m00Tcm4TlvDq8ikWAM",
        "Gujarati" to "21m00Tcm4TlvDq8ikWAM",
        "Kannada" to "21m00Tcm4TlvDq8ikWAM",
        "Malayalam" to "21m00Tcm4TlvDq8ikWAM",
        "Punjabi" to "21m00Tcm4TlvDq8ikWAM"
    )
    
    suspend fun speak(text: String, language: String = "English"): ByteArray? = withContext(Dispatchers.IO) {
        if (apiKey.isEmpty()) {
            Log.e("ElevenLabsTTS", "API key is empty")
            return@withContext null
        }
        
        if (text.isBlank()) {
            Log.e("ElevenLabsTTS", "Text is empty")
            return@withContext null
        }
        
        val voiceId = voiceIds[language] ?: voiceIds["English"]!!
        
        try {
            val json = JSONObject().apply {
                put("text", text)
                put("model_id", "eleven_multilingual_v2")
                put("voice_settings", JSONObject().apply {
                    put("stability", 0.5)
                    put("similarity_boost", 0.8)
                })
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/text-to-speech/$voiceId")
                .addHeader("xi-api-key", apiKey)
                .addHeader("Content-Type", "application/json")
                .post(requestBody)
                .build()
            
            Log.d("ElevenLabsTTS", "Generating speech for: ${text.take(50)}... (language: $language, voiceId: $voiceId)")
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val audioBytes = response.body?.bytes()
                Log.d("ElevenLabsTTS", "Audio generated successfully: ${audioBytes?.size ?: 0} bytes")
                audioBytes
            } else {
                val errorBody = response.body?.string()
                Log.e("ElevenLabsTTS", "Error ${response.code}: ${response.message}")
                Log.e("ElevenLabsTTS", "Error body: $errorBody")
                null
            }
        } catch (e: Exception) {
            Log.e("ElevenLabsTTS", "TTS failed", e)
            null
        }
    }
}

/**
 * Audio player using ExoPlayer for playing TTS audio with Android TTS fallback
 */
class AudioPlayer(private val context: Context) {
    private var exoPlayer: ExoPlayer? = null
    private var androidTTS: TextToSpeech? = null
    private var isTTSReady = false
    
    init {
        exoPlayer = ExoPlayer.Builder(context).build()
        
        // Initialize Android TTS as fallback
        androidTTS = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                isTTSReady = true
                androidTTS?.language = Locale.US
                Log.d("AudioPlayer", "Android TTS initialized successfully")
            } else {
                Log.e("AudioPlayer", "Android TTS initialization failed")
            }
        }
    }
    
    suspend fun playAudio(audioBytes: ByteArray) = withContext(Dispatchers.Main) {
        try {
            // Save to temp file
            val tempFile = File(context.cacheDir, "tts_${System.currentTimeMillis()}.mp3")
            tempFile.writeBytes(audioBytes)
            
            Log.d("AudioPlayer", "Saved audio file: ${tempFile.absolutePath}, size: ${audioBytes.size} bytes")
            
            // Play with ExoPlayer using proper URI
            val mediaItem = MediaItem.fromUri(android.net.Uri.fromFile(tempFile))
            exoPlayer?.setMediaItem(mediaItem)
            exoPlayer?.prepare()
            exoPlayer?.play()
            
            Log.d("AudioPlayer", "Started playing audio")
        } catch (e: Exception) {
            Log.e("AudioPlayer", "Playback failed", e)
        }
    }
    
    suspend fun speakText(text: String, language: String = "English") = withContext(Dispatchers.Main) {
        if (isTTSReady && androidTTS != null) {
            try {
                // Set language for TTS
                val locale = when (language.lowercase()) {
                    "hindi" -> Locale("hi", "IN")
                    "marathi" -> Locale("mr", "IN")
                    "tamil" -> Locale("ta", "IN")
                    "telugu" -> Locale("te", "IN")
                    "gujarati" -> Locale("gu", "IN")
                    "bengali" -> Locale("bn", "IN")
                    "kannada" -> Locale("kn", "IN")
                    "malayalam" -> Locale("ml", "IN")
                    "punjabi" -> Locale("pa", "IN")
                    else -> Locale.US
                }
                
                androidTTS?.language = locale
                androidTTS?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "tts_${System.currentTimeMillis()}")
                Log.d("AudioPlayer", "Speaking with Android TTS: ${text.take(50)}...")
            } catch (e: Exception) {
                Log.e("AudioPlayer", "Android TTS failed", e)
            }
        } else {
            Log.e("AudioPlayer", "Android TTS not ready")
        }
    }
    
    fun stop() {
        exoPlayer?.stop()
        androidTTS?.stop()
    }
    
    fun release() {
        exoPlayer?.release()
        exoPlayer = null
        androidTTS?.shutdown()
        androidTTS = null
    }
    
    fun addListener(listener: Player.Listener) {
        exoPlayer?.addListener(listener)
    }
}
