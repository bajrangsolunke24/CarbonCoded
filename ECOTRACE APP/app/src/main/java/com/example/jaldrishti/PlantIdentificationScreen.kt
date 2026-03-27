package com.example.jaldrishti

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.jaldrishti.ai.CarbonCreditCalculator
import com.example.jaldrishti.ai.PlantIdentificationClient
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlantIdentificationScreen(
    navController: NavController,
    landId: String,
    areaInHectares: Double,
    collectionPath: String = "lands",
    viewModel: LandViewModel = viewModel()
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val primaryGreen = Color(0xFF2E7D32)
    
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var selectedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var isIdentifying by remember { mutableStateOf(false) }
    var identificationResult by remember { mutableStateOf<PlantIdentificationClient.PlantIdentificationResult?>(null) }
    var carbonCreditResult by remember { mutableStateOf<CarbonCreditCalculator.CarbonCreditResult?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showResults by remember { mutableStateOf(false) }
    
    // Initialize clients
    val plantIdentificationClient = remember { PlantIdentificationClient() }
    val carbonCalculator = remember { CarbonCreditCalculator() }
    
    // Camera permission launcher
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            Log.e("PlantIdentification", "Camera permission denied")
        }
    }
    
    // Camera launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        bitmap?.let {
            selectedBitmap = it
            selectedImageUri = null
        }
    }
    
    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            selectedImageUri = it
            selectedBitmap = null
        }
    }
    
    // Convert URI to Bitmap when needed
    LaunchedEffect(selectedImageUri) {
        selectedImageUri?.let { uri ->
            try {
                val bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    val source = ImageDecoder.createSource(context.contentResolver, uri)
                    ImageDecoder.decodeBitmap(source)
                } else {
                    @Suppress("DEPRECATION")
                    MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                }
                selectedBitmap = bitmap
            } catch (e: Exception) {
                Log.e("PlantIdentification", "Failed to load image", e)
            }
        }
    }
    
    // Identify plant function
    fun identifyPlant() {
        selectedBitmap?.let { bitmap ->
            scope.launch {
                isIdentifying = true
                errorMessage = null
                try {
                    Log.d("PlantIdentification", "Starting plant identification...")
                    val result = plantIdentificationClient.identifyPlant(bitmap)
                    Log.d("PlantIdentification", "Plant identification result: $result")
                    
                    if (result != null) {
                        identificationResult = result
                        
                        Log.d("PlantIdentification", "Plant identified: ${result.plantName}")
                        Log.d("PlantIdentification", "Plant type: ${result.plantType}")
                        Log.d("PlantIdentification", "Carbon absorption: ${result.carbonAbsorptionRate}")
                        
                        // Calculate carbon credits
                        val creditResult = carbonCalculator.calculateCarbonCredits(
                            plantResult = result,
                            areaInHectares = areaInHectares,
                            region = "subtropical", // Default for India
                            soilQuality = "medium",
                            irrigationType = "rainfed"
                        )
                        carbonCreditResult = creditResult
                        showResults = true
                        
                        Log.d("PlantIdentification", "Carbon credits calculated: ${creditResult.totalCreditsPerYear}/year")
                        Log.d("PlantIdentification", "Estimated value: $${creditResult.estimatedValue}/year")
                    } else {
                        Log.e("PlantIdentification", "Failed to identify plant - result is null")
                        errorMessage = "Failed to identify plant. Please try with a clearer image or use a different photo."
                    }
                } catch (e: Exception) {
                    Log.e("PlantIdentification", "Plant identification error", e)
                    errorMessage = "Error identifying plant: ${e.message}"
                } finally {
                    isIdentifying = false
                }
            }
        } ?: run {
            Log.e("PlantIdentification", "No bitmap selected for identification")
            errorMessage = "Please select an image first"
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Plant Identification",
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = primaryGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Instructions
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = primaryGreen.copy(alpha = 0.1f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        "📸 Upload Plant Photo",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Take a clear photo of the main crop, plant, or tree on your land. Our AI will identify it and calculate carbon credits based on the plant type and your land area (${String.format("%.2f", areaInHectares)} hectares).",
                        fontSize = 14.sp,
                        color = Color.Black.copy(alpha = 0.7f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Image capture buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // Camera button
                Button(
                    onClick = {
                        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
                            == PackageManager.PERMISSION_GRANTED) {
                            cameraLauncher.launch(null)
                        } else {
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
                ) {
                    Icon(Icons.Default.CameraAlt, "Camera")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Camera")
                }
                
                // Gallery button
                Button(
                    onClick = { galleryLauncher.launch("image/*") },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
                ) {
                    Icon(Icons.Default.PhotoLibrary, "Gallery")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Gallery")
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Selected image preview
            selectedBitmap?.let { bitmap ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Image(
                        bitmap = bitmap.asImageBitmap(),
                        contentDescription = "Selected plant image",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Identify button
                Button(
                    onClick = { identifyPlant() },
                    enabled = !isIdentifying,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
                ) {
                    if (isIdentifying) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Identifying...")
                    } else {
                        Icon(Icons.Default.Search, "Identify")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Identify Plant & Calculate Credits")
                    }
                }
            }
            
            // Error message
            errorMessage?.let { error ->
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.1f))
                ) {
                    Text(
                        text = error,
                        modifier = Modifier.padding(16.dp),
                        color = Color.Red,
                        fontSize = 14.sp
                    )
                }
            }
            
            // Results
            if (showResults && identificationResult != null && carbonCreditResult != null) {
                Spacer(modifier = Modifier.height(24.dp))
                
                PlantIdentificationResults(
                    plantResult = identificationResult!!,
                    carbonResult = carbonCreditResult!!,
                    areaInHectares = areaInHectares,
                    onSaveResults = {
                        // Save results to land data
                        scope.launch {
                                viewModel.updateLandWithPlantData(
                                    landId = landId,
                                    plantResult = identificationResult!!,
                                    carbonResult = carbonCreditResult!!,
                                    collectionPath = collectionPath
                                ) { success ->
                                    if (success) {
                                        val destination = if (collectionPath == "coastalLands") "BlueCarbonDashboard" else "GreenCarbonDashboard"
                                        navController.navigate(destination) {
                                            popUpTo(destination) { inclusive = true }
                                        }
                                    }
                                }
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun PlantIdentificationResults(
    plantResult: PlantIdentificationClient.PlantIdentificationResult,
    carbonResult: CarbonCreditCalculator.CarbonCreditResult,
    areaInHectares: Double,
    onSaveResults: () -> Unit
) {
    val primaryGreen = Color(0xFF2E7D32)
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Plant identification header
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Eco,
                    contentDescription = "Plant",
                    tint = primaryGreen,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        "Plant Identified",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    Text(
                        "Confidence: ${(plantResult.confidence * 100).toInt()}%",
                        fontSize = 12.sp,
                        color = Color.Black.copy(alpha = 0.6f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Plant details
            Text(
                plantResult.plantName,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            Text(
                "Type: ${plantResult.plantType.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }}",
                fontSize = 14.sp,
                color = Color.Black.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                plantResult.description,
                fontSize = 14.sp,
                color = Color.Black.copy(alpha = 0.8f)
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Carbon credits summary
            Card(
                colors = CardDefaults.cardColors(containerColor = primaryGreen.copy(alpha = 0.1f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        "🌱 Carbon Credit Calculation",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                "${String.format("%.2f", carbonResult.totalCreditsPerYear)}",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = primaryGreen
                            )
                            Text(
                                "Credits/Year",
                                fontSize = 12.sp,
                                color = Color.Black.copy(alpha = 0.6f)
                            )
                        }
                        
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                "$${String.format("%.0f", carbonResult.estimatedValue)}",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1976D2)
                            )
                            Text(
                                "USD/Year",
                                fontSize = 12.sp,
                                color = Color.Black.copy(alpha = 0.6f)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        "CO₂ Absorption: ${String.format("%.0f", carbonResult.totalCO2AbsorptionKg)} kg/year",
                        fontSize = 14.sp,
                        color = Color.Black.copy(alpha = 0.8f)
                    )
                    
                    Text(
                        "Area: ${String.format("%.2f", areaInHectares)} hectares",
                        fontSize = 14.sp,
                        color = Color.Black.copy(alpha = 0.8f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Projections
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "${String.format("%.0f", carbonResult.projectedCredits5Years)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    Text(
                        "5-Year Total",
                        fontSize = 12.sp,
                        color = Color.Black.copy(alpha = 0.6f),
                        textAlign = TextAlign.Center
                    )
                }
                
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "${String.format("%.0f", carbonResult.projectedCredits10Years)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    Text(
                        "10-Year Total",
                        fontSize = 12.sp,
                        color = Color.Black.copy(alpha = 0.6f),
                        textAlign = TextAlign.Center
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Save button
            Button(
                onClick = onSaveResults,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
            ) {
                Icon(Icons.Default.Save, "Save")
                Spacer(modifier = Modifier.width(8.dp))
                Text("Save & Complete Registration")
            }
        }
    }
}