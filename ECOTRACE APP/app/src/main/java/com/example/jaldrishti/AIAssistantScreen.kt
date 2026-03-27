package com.example.jaldrishti

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.jaldrishti.ai.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

class AIAssistantViewModel : ViewModel() {
    val messages = mutableStateListOf<ChatMessage>()
    var selectedLanguage by mutableStateOf("English")
    var isListening by mutableStateOf(false)
    var isSpeaking by mutableStateOf(false)
    var isProcessing by mutableStateOf(false)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(
    navController: NavController,
    viewModel: AIAssistantViewModel = viewModel()
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    // Get API keys safely
    val openaiKey = try { BuildConfig.OPENAI_API_KEY } catch (e: Exception) { "" }
    val elevenLabsKey = try { BuildConfig.ELEVENLABS_API_KEY } catch (e: Exception) { "" }
    val geminiKey = try { BuildConfig.GEMINI_API_KEY } catch (e: Exception) { "" }
    
    // Initialize AI components - Using Whisper + Ollama + ElevenLabs
    val aiManager = remember { AIAssistantManager(context) }
    val audioRecorder = remember { AudioRecorder(context) }
    val audioPlayer = remember { AudioPlayer(context) }
    
    var recordingFile: File? by remember { mutableStateOf(null) }
    var showApiKeyError by remember { mutableStateOf(false) }
    
    // Request permissions
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            viewModel.messages.add(
                ChatMessage("Microphone permission is required for voice input", isUser = false)
            )
        }
    }
    
    // Send welcome message on startup
    LaunchedEffect(Unit) {
        // Check microphone permission
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
        
        // Check if API key is set
        if (openaiKey.isEmpty() && geminiKey.isEmpty()) {
            showApiKeyError = true
            viewModel.messages.add(
                ChatMessage(
                    "⚠️ No AI API keys found. Please add OPENAI_API_KEY or GEMINI_API_KEY to gradle.properties and rebuild the project.",
                    isUser = false
                )
            )
            return@LaunchedEffect
        }
        
        // Send welcome message
        delay(500)
        val currentProvider = aiManager.getCurrentAIProvider()
        val welcome = aiManager.getTextResponse(
            "Introduce yourself briefly as a carbon credit assistant powered by $currentProvider AI and ask how you can help. Keep it to 2 sentences.",
            viewModel.selectedLanguage
        )
        viewModel.messages.add(ChatMessage(welcome, isUser = false))
        
        // Speak welcome
        val audio = aiManager.generateSpeech(welcome, viewModel.selectedLanguage)
        if (audio != null) {
            audioPlayer.playAudio(audio)
        } else {
            audioPlayer.speakText(welcome, viewModel.selectedLanguage)
        }
    }
    
    // Cleanup
    DisposableEffect(Unit) {
        onDispose {
            audioPlayer.release()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Assistant") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    Icon(
                        Icons.Default.SmartToy,
                        contentDescription = "AI",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // API Key status
            if (showApiKeyError) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "API Keys Required",
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Add to gradle.properties:\nOPENAI_API_KEY=your_openai_key\nGEMINI_API_KEY=your_gemini_key\nELEVENLABS_API_KEY=your_elevenlabs_key",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }
            
            // Language selector
            LanguageSelector(
                selectedLanguage = viewModel.selectedLanguage,
                onLanguageChange = { viewModel.selectedLanguage = it }
            )
            
            // AI Provider selector
            AIProviderSelector(
                currentProvider = aiManager.getCurrentAIProvider(),
                onProviderChange = { useGemini -> aiManager.setAIProvider(useGemini) },
                hasOpenAI = openaiKey.isNotEmpty(),
                hasGemini = geminiKey.isNotEmpty()
            )
            
            // Chat messages
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp),
                reverseLayout = false
            ) {
                items(viewModel.messages) { message ->
                    MessageBubble(message)
                }
                
                // Processing indicator
                if (viewModel.isProcessing) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.Start
                        ) {
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Thinking...")
                                }
                            }
                        }
                    }
                }
            }
            
            // Controls
            Surface(
                tonalElevation = 3.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        // Voice input button
                        Button(
                            onClick = {
                                // Check microphone permission first
                                if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
                                    != PackageManager.PERMISSION_GRANTED) {
                                    permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    return@Button
                                }
                                
                                if (!viewModel.isListening) {
                                    // Start real-time speech recognition
                                    scope.launch {
                                        viewModel.isListening = true
                                        viewModel.isProcessing = true
                                        
                                        // Use real-time speech recognition
                                        val (transcript, response) = aiManager.processVoiceInputRealtime(
                                            viewModel.selectedLanguage
                                        )
                                        
                                        viewModel.isListening = false
                                        
                                        if (transcript.isNotEmpty() && !transcript.contains("error", ignoreCase = true)) {
                                            viewModel.messages.add(ChatMessage(transcript, isUser = true))
                                            viewModel.messages.add(ChatMessage(response, isUser = false))
                                            
                                            // Speak response with ElevenLabs or fallback to Android TTS
                                            viewModel.isSpeaking = true
                                            val audio = aiManager.generateSpeech(response, viewModel.selectedLanguage)
                                            if (audio != null) {
                                                audioPlayer.playAudio(audio)
                                            } else {
                                                // Fallback to Android TTS
                                                Log.d("AIAssistant", "ElevenLabs failed, using Android TTS fallback")
                                                audioPlayer.speakText(response, viewModel.selectedLanguage)
                                            }
                                            
                                            delay(3000) // Approximate speech duration
                                            viewModel.isSpeaking = false
                                        } else {
                                            viewModel.messages.add(ChatMessage(transcript, isUser = false))
                                        }
                                        
                                        viewModel.isProcessing = false
                                    }
                                }
                            },
                            enabled = !viewModel.isSpeaking && !viewModel.isProcessing && !showApiKeyError,
                            colors = if (viewModel.isListening) {
                                ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.error
                                )
                            } else {
                                ButtonDefaults.buttonColors()
                            }
                        ) {
                            Icon(
                                imageVector = if (viewModel.isListening) Icons.Default.Stop else Icons.Default.Mic,
                                contentDescription = "Voice"
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (viewModel.isListening) "Stop" else "Speak")
                        }
                        
                        // Navigate button
                        Button(
                            onClick = {
                                scope.launch {
                                    viewModel.isProcessing = true
                                    val prompt = "Guide me step-by-step to register my land in this app. Be brief and clear (3 steps max)."
                                    val response = aiManager.getTextResponse(prompt, viewModel.selectedLanguage)
                                    viewModel.messages.add(ChatMessage(response, isUser = false))
                                    
                                    viewModel.isSpeaking = true
                                    val audio = aiManager.generateSpeech(response, viewModel.selectedLanguage)
                                    if (audio != null) {
                                        audioPlayer.playAudio(audio)
                                    } else {
                                        audioPlayer.speakText(response, viewModel.selectedLanguage)
                                    }
                                    
                                    delay(2000)
                                    viewModel.isSpeaking = false
                                    viewModel.isProcessing = false
                                }
                            },
                            enabled = !viewModel.isSpeaking && !viewModel.isListening && !viewModel.isProcessing && !showApiKeyError
                        ) {
                            Icon(Icons.Default.Navigation, "Navigate")
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Guide Me")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Text input for testing AI without microphone
                    var textInput by remember { mutableStateOf("") }
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = textInput,
                            onValueChange = { textInput = it },
                            label = { Text("Type your message") },
                            modifier = Modifier.weight(1f),
                            enabled = !viewModel.isProcessing && !showApiKeyError
                        )
                        
                        Button(
                            onClick = {
                                if (textInput.isNotBlank()) {
                                    scope.launch {
                                        viewModel.isProcessing = true
                                        viewModel.messages.add(ChatMessage(textInput, isUser = true))
                                        
                                        val response = aiManager.getTextResponse(textInput, viewModel.selectedLanguage)
                                        viewModel.messages.add(ChatMessage(response, isUser = false))
                                        
                                        textInput = ""
                                        viewModel.isProcessing = false
                                    }
                                }
                            },
                            enabled = !viewModel.isProcessing && !showApiKeyError && textInput.isNotBlank()
                        ) {
                            Text("Send")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Quick action buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        TextButton(
                            onClick = {
                                scope.launch {
                                    viewModel.isProcessing = true
                                    val response = aiManager.getTextResponse(
                                        "Explain what carbon credits are in simple terms (2 sentences)",
                                        viewModel.selectedLanguage
                                    )
                                    viewModel.messages.add(ChatMessage(response, isUser = false))
                                    viewModel.isProcessing = false
                                }
                            },
                            enabled = !viewModel.isProcessing && !showApiKeyError
                        ) {
                            Text("What are carbon credits?", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            colors = CardDefaults.cardColors(
                containerColor = if (message.isUser)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.secondaryContainer
            ),
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = message.text,
                modifier = Modifier.padding(12.dp),
                color = if (message.isUser) Color.White else MaterialTheme.colorScheme.onSecondaryContainer,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
fun LanguageSelector(
    selectedLanguage: String,
    onLanguageChange: (String) -> Unit
) {
    val languages = listOf(
        "English", "Hindi", "Marathi", "Tamil", "Telugu",
        "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi"
    )
    
    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(languages) { lang ->
            FilterChip(
                selected = selectedLanguage == lang,
                onClick = { onLanguageChange(lang) },
                label = { Text(lang, style = MaterialTheme.typography.labelMedium) }
            )
        }
    }
}

@Composable
fun AIProviderSelector(
    currentProvider: String,
    onProviderChange: (Boolean) -> Unit,
    hasOpenAI: Boolean,
    hasGemini: Boolean
) {
    if (!hasOpenAI && !hasGemini) return
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            "AI Provider:",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        if (hasGemini) {
            FilterChip(
                selected = currentProvider == "Gemini",
                onClick = { onProviderChange(true) },
                label = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Gemini", style = MaterialTheme.typography.labelMedium)
                        if (currentProvider == "Gemini") {
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                Icons.Default.Check,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = Color.White
                )
            )
        }
        
        if (hasOpenAI) {
            FilterChip(
                selected = currentProvider == "OpenAI",
                onClick = { onProviderChange(false) },
                label = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("OpenAI", style = MaterialTheme.typography.labelMedium)
                        if (currentProvider == "OpenAI") {
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                Icons.Default.Check,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.secondary,
                    selectedLabelColor = Color.White
                )
            )
        }
    }
}
