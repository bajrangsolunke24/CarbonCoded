package com.example.jaldrishti.ai

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * AI Assistant Manager - Coordinates Whisper, OpenAI/Gemini, and ElevenLabs
 */
class AIAssistantManager(context: Context) {
    private val whisperClient = WhisperClient(context)
    private val openAIClient = OpenAIClient()
    private val geminiClient = GeminiClient()
    private val elevenLabsClient = ElevenLabsClient(context)
    
    // AI Provider selection - can be switched based on availability
    private var useGemini = false // Default to OpenAI (Groq)
    
    /**
     * Process voice input using Android's built-in speech recognition
     */
    suspend fun processVoiceInputRealtime(language: String = "English"): Pair<String, String> = withContext(Dispatchers.IO) {
        try {
            // Step 1: Real-time Speech Recognition
            Log.d("AIAssistant", "Starting real-time speech recognition...")
            val languageCode = getWhisperLanguageCode(language)
            val transcription = whisperClient.recognizeSpeech(languageCode)
            
            if (transcription.contains("error", ignoreCase = true) || transcription.contains("failed", ignoreCase = true)) {
                return@withContext Pair(transcription, "")
            }
            
            // Step 2: Text to AI Response (Gemini or OpenAI)
            Log.d("AIAssistant", "Getting AI response for: $transcription")
            val aiResponse = getAIResponse(transcription, language)
            
            return@withContext Pair(transcription, aiResponse)
            
        } catch (e: Exception) {
            Log.e("AIAssistant", "Error processing voice input", e)
            return@withContext Pair("Error processing voice", "Sorry, I couldn't process your request.")
        }
    }
    
    /**
     * Process voice input: Speech -> Text -> AI Response -> Speech
     */
    suspend fun processVoiceInput(
        audioFile: File,
        language: String = "English"
    ): Pair<String, String> = withContext(Dispatchers.IO) {
        try {
            // Step 1: Speech to Text (Whisper)
            Log.d("AIAssistant", "Starting speech-to-text...")
            val transcription = whisperClient.transcribeAudio(audioFile, getWhisperLanguageCode(language))
            
            if (transcription.isEmpty() || transcription.contains("error", ignoreCase = true)) {
                return@withContext Pair(transcription, "")
            }
            
            // Step 2: Text to AI Response (Gemini or OpenAI)
            Log.d("AIAssistant", "Getting AI response for: $transcription")
            val aiResponse = getAIResponse(transcription, language)
            
            return@withContext Pair(transcription, aiResponse)
            
        } catch (e: Exception) {
            Log.e("AIAssistant", "Error processing voice input", e)
            return@withContext Pair("Error processing voice", "Sorry, I couldn't process your request.")
        }
    }
    
    /**
     * Generate speech from text
     */
    suspend fun generateSpeech(
        text: String,
        language: String = "English"
    ): ByteArray? = withContext(Dispatchers.IO) {
        try {
            val audioFile = elevenLabsClient.generateSpeech(text, getElevenLabsVoiceId(language))
            audioFile?.readBytes()
        } catch (e: Exception) {
            Log.e("AIAssistant", "Error generating speech", e)
            null
        }
    }
    
    /**
     * Test all AI services connectivity
     */
    suspend fun testConnections(): Map<String, Boolean> = withContext(Dispatchers.IO) {
        mapOf(
            "whisper" to whisperClient.testConnection(),
            "gemini" to geminiClient.testConnection(),
            "openai" to openAIClient.testConnection(),
            "elevenlabs" to elevenLabsClient.testConnection()
        )
    }
    
    /**
     * Get text response only (no speech) - uses Gemini by default, falls back to OpenAI
     */
    suspend fun getTextResponse(message: String, language: String = "English"): String {
        return getAIResponse(message, language)
    }
    
    /**
     * Get AI response with automatic fallback between Gemini and OpenAI
     */
    private suspend fun getAIResponse(message: String, language: String = "English"): String {
        return try {
            if (useGemini) {
                Log.d("AIAssistant", "Using Gemini AI")
                val response = geminiClient.chatWithContext(message, language)
                if (response.contains("API key not configured") || response.contains("trouble connecting")) {
                    Log.w("AIAssistant", "Gemini failed, falling back to OpenAI")
                    useGemini = false
                    openAIClient.chat(message, language)
                } else {
                    response
                }
            } else {
                Log.d("AIAssistant", "Using OpenAI")
                val response = openAIClient.chat(message, language)
                if (response.contains("API key not set") || response.contains("Error calling OpenAI")) {
                    Log.w("AIAssistant", "OpenAI failed, trying Gemini")
                    useGemini = true
                    geminiClient.chatWithContext(message, language)
                } else {
                    response
                }
            }
        } catch (e: Exception) {
            Log.e("AIAssistant", "Error getting AI response", e)
            "Sorry, I'm having trouble connecting to AI services. Please check your API keys and try again."
        }
    }
    
    /**
     * Switch AI provider manually
     */
    fun setAIProvider(useGemini: Boolean) {
        this.useGemini = useGemini
        Log.d("AIAssistant", "AI provider switched to: ${if (useGemini) "Gemini" else "OpenAI"}")
    }
    
    /**
     * Get current AI provider
     */
    fun getCurrentAIProvider(): String = if (useGemini) "Gemini" else "OpenAI"
    
    private fun getWhisperLanguageCode(language: String): String {
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
    
    private fun getElevenLabsVoiceId(language: String): String {
        return when (language.lowercase()) {
            "hindi" -> "pNInz6obpgDQGcFmaJgB" // Adam (multilingual)
            "english" -> "21m00Tcm4TlvDq8ikWAM" // Rachel
            else -> "21m00Tcm4TlvDq8ikWAM" // Default to Rachel
        }
    }
}