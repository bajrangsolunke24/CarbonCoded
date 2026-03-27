package com.example.jaldrishti.ai

import android.util.Log
import com.example.jaldrishti.BuildConfig
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Google Gemini AI Client for text generation
 */
class GeminiClient {
    private val apiKey = BuildConfig.GEMINI_API_KEY
    
    private val generativeModel by lazy {
        GenerativeModel(
            modelName = "gemini-2.5-flash",
            apiKey = apiKey
        )
    }
    
    /**
     * Generate chat response using Gemini
     */
    suspend fun chat(message: String, language: String = "English"): String = withContext(Dispatchers.IO) {
        try {
            if (apiKey.isEmpty()) {
                return@withContext "Gemini API key not configured. Please add GEMINI_API_KEY to gradle.properties"
            }
            
            val prompt = buildPrompt(message, language)
            Log.d("GeminiClient", "Sending prompt: $prompt")
            
            val response = generativeModel.generateContent(prompt)
            val result = response.text ?: "Sorry, I couldn't generate a response."
            
            Log.d("GeminiClient", "Gemini response: $result")
            return@withContext result
            
        } catch (e: Exception) {
            Log.e("GeminiClient", "Error calling Gemini API", e)
            return@withContext "Sorry, I'm having trouble connecting to Gemini AI. Please try again."
        }
    }
    
    /**
     * Generate response with context about carbon credits and land registration
     */
    suspend fun chatWithContext(message: String, language: String = "English"): String = withContext(Dispatchers.IO) {
        try {
            if (apiKey.isEmpty()) {
                return@withContext "Gemini API key not configured. Please add GEMINI_API_KEY to gradle.properties"
            }
            
            val contextualPrompt = buildContextualPrompt(message, language)
            Log.d("GeminiClient", "Sending contextual prompt to Gemini")
            
            val response = generativeModel.generateContent(contextualPrompt)
            val result = response.text ?: "Sorry, I couldn't generate a response."
            
            Log.d("GeminiClient", "Gemini contextual response: $result")
            return@withContext result
            
        } catch (e: Exception) {
            Log.e("GeminiClient", "Error calling Gemini API with context", e)
            return@withContext "Sorry, I'm having trouble connecting to Gemini AI. Please try again."
        }
    }
    
    /**
     * Test Gemini API connection
     */
    suspend fun testConnection(): Boolean = withContext(Dispatchers.IO) {
        try {
            if (apiKey.isEmpty()) {
                Log.w("GeminiClient", "API key not configured")
                return@withContext false
            }
            
            val response = generativeModel.generateContent("Hello")
            return@withContext response.text?.isNotEmpty() == true
            
        } catch (e: Exception) {
            Log.e("GeminiClient", "Gemini connection test failed", e)
            return@withContext false
        }
    }
    
    private fun buildPrompt(message: String, language: String): String {
        val languageInstruction = if (language != "English") {
            "Please respond in $language language. "
        } else ""
        
        return """
            ${languageInstruction}You are a helpful AI assistant for a carbon credit and land registration app called JalDrishti. 
            
            Your role is to:
            - Help users understand carbon credits and environmental sustainability
            - Guide users through land registration processes
            - Provide information about blue carbon (marine ecosystems) and green carbon (terrestrial ecosystems)
            - Answer questions about environmental conservation
            - Be concise and helpful (keep responses under 100 words unless more detail is specifically requested)
            
            User question: $message
            
            Please provide a helpful, accurate response.
        """.trimIndent()
    }
    
    private fun buildContextualPrompt(message: String, language: String): String {
        val languageInstruction = if (language != "English") {
            "Please respond in $language language. "
        } else ""
        
        return """
            ${languageInstruction}You are an expert AI assistant for JalDrishti, a carbon credit and land registration application.
            
            CONTEXT ABOUT THE APP:
            - JalDrishti helps users register their land for carbon credit programs
            - Supports both Blue Carbon (mangroves, seagrass, salt marshes) and Green Carbon (forests, agricultural land)
            - Users can mark land boundaries using AR technology or maps
            - The app calculates potential carbon credits based on land type and vegetation
            - Users can verify their land through NGO partnerships
            - The app provides feasibility analysis for carbon credit projects
            
            CARBON CREDIT BASICS:
            - Carbon credits represent 1 ton of CO2 equivalent removed or avoided
            - Blue carbon ecosystems can sequester 3-10x more carbon than terrestrial forests
            - Land must be properly registered and verified to generate legitimate credits
            - Different ecosystems have different carbon sequestration rates
            
            LAND REGISTRATION PROCESS:
            1. Create account and select carbon type (Blue/Green)
            2. Mark land boundaries using AR or map tools
            3. Upload required documents and photos
            4. Submit for NGO verification
            5. Receive feasibility analysis and carbon credit estimates
            
            User question: $message
            
            Provide a helpful, accurate response based on this context. Keep it concise (under 150 words) unless more detail is requested.
        """.trimIndent()
    }
}