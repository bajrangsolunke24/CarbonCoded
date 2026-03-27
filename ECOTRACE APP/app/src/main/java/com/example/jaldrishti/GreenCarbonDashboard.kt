package com.example.jaldrishti

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.firestore

data class Land(
    val id: String,
    val name: String,
    val area: Double,
    val carbonCredits: Double,
    val type: String,
    val registeredDate: String,
    val plantName: String = "",
    val plantType: String = "",
    val estimatedValue: Double = 0.0,
    val needsPlantIdentification: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GreenCarbonDashboard(navController: NavController) {
    val primaryGreen = Color(0xFF2E7D32)
    val lightGreen = Color(0xFFE8F5E9)
    val lightBlue = Color(0xFFE3F2FD)

    var lands by remember { mutableStateOf<List<Land>>(emptyList()) }
    var totalCarbonCredits by remember { mutableStateOf(0.0) }
    var selectedLand by remember { mutableStateOf<Land?>(null) }

    val localLands by DemoDataManager.localLands.collectAsState()

    LaunchedEffect(Unit, localLands) {
        val uid = Firebase.auth.currentUser?.uid
        if (uid != null) {
            Firebase.firestore.collection("lands")
                .whereEqualTo("userId", uid)
                .addSnapshotListener { documents, e ->
                    // Fetch Demo Data
                    val demoLands = localLands.filter { it["userId"] == uid }.map { doc ->
                        Land(
                            id = doc["id"] as? String ?: "",
                            name = doc["name"] as? String ?: "",
                            area = (doc["area"] as? Double) ?: 0.0,
                            carbonCredits = (doc["carbonCredits"] as? Double) ?: 0.0,
                            type = doc["type"] as? String ?: "",
                            registeredDate = doc["registeredDate"] as? String ?: "",
                            plantName = doc["plantName"] as? String ?: "",
                            plantType = doc["plantType"] as? String ?: "",
                            estimatedValue = (doc["estimatedValue"] as? Double) ?: 0.0,
                            needsPlantIdentification = (doc["needsPlantIdentification"] as? Boolean) ?: false
                        )
                    }

                    if (e != null) {
                        // If Firestore fails (Permission error), just show demo data
                         lands = demoLands
                         totalCarbonCredits = lands.sumOf { it.carbonCredits }
                        return@addSnapshotListener
                    }

                    if (documents != null) {
                        val firestoreLands = documents.map { doc ->
                            Land(
                                id = doc.id,
                                name = doc.getString("name") ?: "",
                                area = doc.getDouble("area") ?: 0.0,
                                carbonCredits = doc.getDouble("carbonCredits") ?: 0.0,
                                type = doc.getString("type") ?: "",
                                registeredDate = doc.getString("registeredDate") ?: "",
                                plantName = doc.getString("plantName") ?: "",
                                plantType = doc.getString("plantType") ?: "",
                                estimatedValue = doc.getDouble("estimatedValue") ?: 0.0,
                                needsPlantIdentification = doc.getBoolean("needsPlantIdentification") ?: false
                            )
                        }
                        lands = firestoreLands + demoLands
                        totalCarbonCredits = lands.sumOf { it.carbonCredits }
                    } else {
                         lands = demoLands
                         totalCarbonCredits = lands.sumOf { it.carbonCredits }
                    }
                }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Green Carbon Dashboard",
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                ),
                actions = {
                    IconButton(onClick = { navController.navigate("RegisterLand") }) {
                        Icon(Icons.Default.Add, "Add Land", tint = primaryGreen)
                    }
                }
            )
        },
        bottomBar = {
             Button(
                onClick = {
                    val totalArea = lands.sumOf { it.area }.toFloat()
                    navController.navigate("AnalyticsScreen/green/$totalArea")
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Proceed to Analytics • ${String.format("%.2f", lands.sumOf { it.carbonCredits })} tCO₂e", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate("RegisterLand") },
                containerColor = primaryGreen
            ) {
                Icon(Icons.Default.Add, "Register Land", tint = Color.White)
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Total Carbon Credits Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = primaryGreen),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp)
                    ) {
                        Text(
                            "Total Carbon Credits",
                            fontSize = 16.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "${String.format("%.2f", totalCarbonCredits)} tCO₂e",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "From ${lands.size} registered lands",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
            }

            // Stats Row
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Total Area",
                        value = "${String.format("%.2f", lands.sumOf { it.area })} ha",
                        color = lightGreen,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Lands",
                        value = "${lands.size}",
                        color = lightBlue,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Carbon Credits Trend Graph
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Text(
                            "Carbon Credits Trend",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryGreen
                        )
                        Spacer(Modifier.height(16.dp))
                        CarbonCreditsGraph(lands)
                    }
                }
            }

            // Registered Lands
            item {
                Text(
                    "Registered Lands",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }

            if (lands.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Default.Place,
                                null,
                                tint = Color.Gray,
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(Modifier.height(16.dp))
                            Text(
                                "No lands registered yet",
                                fontSize = 18.sp,
                                color = Color.Black.copy(alpha = 0.7f)
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Register your first land to start tracking carbon credits",
                                fontSize = 14.sp,
                                color = Color.Black.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            } else {
                items(lands) { land ->
                    LandCard(
                        land = land,
                        onClick = {
                            if (land.needsPlantIdentification) {
                                // Navigate to plant identification
                                navController.navigate("PlantIdentification/${land.id}/${land.area}")
                            } else {
                                // Navigate to land details
                                navController.navigate("LandDetails/${land.id}/green")
                            }
                        }
                    )
                }
            }
        }
    }
}

// Components from previous version, kept here as they are part of this screen composition
// StatCard is used by GreenCarbonDashboard
@Composable
fun StatCard(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = color),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                title,
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(Modifier.height(4.dp))
            Text(
                value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }
    }
}

@Composable
fun CarbonCreditsGraph(lands: List<Land>) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            if (lands.isNotEmpty()) {
                val maxCredits = lands.maxOfOrNull { it.carbonCredits } ?: 1.0
                val points = lands.mapIndexed { index, land ->
                    Pair(
                        (index * size.width / (lands.size - 1).coerceAtLeast(1)).toFloat(),
                        (size.height * (1 - land.carbonCredits / maxCredits)).toFloat()
                    )
                }

                val path = Path().apply {
                    points.forEachIndexed { index, point ->
                        if (index == 0) moveTo(point.first, point.second)
                        else lineTo(point.first, point.second)
                    }
                }

                // Fill area
                path.lineTo(size.width, size.height)
                path.lineTo(0f, size.height)
                path.close()
                drawPath(path, Color(0xFF2E7D32).copy(alpha = 0.3f))

                // Draw line
                drawPath(path, Color(0xFF2E7D32), style = Stroke(width = 4f))
            }
        }
    }
}

@Composable
fun LandCard(land: Land, onClick: () -> Unit) {
    val primaryGreen = Color(0xFF2E7D32)
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(4.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Place,
                null,
                tint = primaryGreen,
                modifier = Modifier.size(48.dp)
            )
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    land.name,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Spacer(Modifier.height(4.dp))
                
                // Show plant name if available
                if (land.plantName.isNotEmpty()) {
                    Text(
                        "🌱 ${land.plantName}",
                        fontSize = 13.sp,
                        color = primaryGreen,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(Modifier.height(2.dp))
                } else if (land.needsPlantIdentification) {
                    Text(
                        "📸 Plant identification needed",
                        fontSize = 13.sp,
                        color = Color(0xFFFF9800),
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(Modifier.height(2.dp))
                }
                
                Text(
                    "${land.type} • ${String.format("%.2f", land.area)} ha",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(Modifier.height(4.dp))
                
                Row {
                    Text(
                        "${String.format("%.2f", land.carbonCredits)} tCO₂e",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    
                    if (land.estimatedValue > 0) {
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "$${String.format("%.0f", land.estimatedValue)}/yr",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1976D2)
                        )
                    }
                }
            }
            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                null,
                tint = primaryGreen,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
