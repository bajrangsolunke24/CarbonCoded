package com.example.jaldrishti.ai

import android.content.Context
import android.util.Log
import com.example.jaldrishti.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * ElevenLabs Client - Wrapper around ElevenLabsTTS for consistency
 */
class ElevenLabsClient(
    private val context: Context,
    private val apiKey: String = BuildConfig.ELEVENLABS_API_KEY
) {
    private val ttsClient = ElevenLabsTTS(apiKey)
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()
    
    suspend fun generateSpeech(text: String, voiceId: String = "21m00Tcm4TlvDq8ikWAM"): File? = withContext(Dispatchers.IO) {
        try {
            val audioBytes = ttsClient.speak(text, getLanguageFromVoiceId(voiceId))
            
            if (audioBytes != null) {
                // Save to temp file and return
                val tempFile = File(context.cacheDir, "speech_${System.currentTimeMillis()}.mp3")
                tempFile.writeBytes(audioBytes)
                Log.d("ElevenLabsClient", "Speech saved to: ${tempFile.absolutePath}")
                tempFile
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e("ElevenLabsClient", "Speech generation failed", e)
            null
        }
    }
    
    suspend fun testConnection(): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("https://api.elevenlabs.io/v1/voices")
                .addHeader("xi-api-key", apiKey)
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            Log.e("ElevenLabsClient", "Connection test failed", e)
            false
        }
    }
    
    private fun getLanguageFromVoiceId(voiceId: String): String {
        return when (voiceId) {
            "pNInz6obpgDQGcFmaJgB" -> "Hindi"
            "21m00Tcm4TlvDq8ikWAM" -> "English"
            else -> "English"
        }
    }
}