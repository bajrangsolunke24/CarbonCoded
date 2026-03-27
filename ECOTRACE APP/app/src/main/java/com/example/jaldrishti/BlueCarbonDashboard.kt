package com.example.jaldrishti

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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

data class CoastalLand(
    val id: String,
    val name: String,
    val area: Double,
    val carbonCredits: Double,
    val progress: Int,
    val location: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BlueCarbonDashboard(navController: NavController) {
    val primaryBlue = Color(0xFF1565C0)
    val lightBlue = Color(0xFFE3F2FD)

    var coastalLands by remember { mutableStateOf<List<CoastalLand>>(emptyList()) }
    var totalCarbonCredits by remember { mutableStateOf(0.0) }
    var totalArea by remember { mutableStateOf(0.0) }

    val localCoastalLands by DemoDataManager.localCoastalLands.collectAsState()

    LaunchedEffect(Unit, localCoastalLands) {
        val uid = Firebase.auth.currentUser?.uid
        if (uid != null) {
            Firebase.firestore.collection("coastalLands")
                .whereEqualTo("ngoId", uid)
                .get()
                .addOnSuccessListener { documents ->
                    val firestoreLands = documents.map { doc ->
                        CoastalLand(
                            id = doc.id,
                            name = doc.getString("name") ?: "",
                            area = doc.getDouble("area") ?: 0.0,
                            carbonCredits = doc.getDouble("carbonCredits") ?: 0.0,
                            progress = doc.getLong("progress")?.toInt() ?: 0,
                            location = doc.getString("location") ?: ""
                        )
                    }

                    val demoLands = localCoastalLands.filter { it["ngoId"] == uid }.map { doc ->
                        CoastalLand(
                            id = doc["id"] as? String ?: "",
                            name = doc["name"] as? String ?: "",
                            area = (doc["area"] as? Double) ?: 0.0,
                            carbonCredits = (doc["carbonCredits"] as? Double) ?: 0.0,
                            progress = (doc["progress"] as? Int) ?: 0,
                            location = doc["location"] as? String ?: ""
                        )
                    }

                    coastalLands = firestoreLands + demoLands
                    totalCarbonCredits = coastalLands.sumOf { it.carbonCredits }
                    totalArea = coastalLands.sumOf { it.area }
                }
                .addOnFailureListener {
                     // If read fails (e.g. permission denied), show at least the demo data
                    val demoLands = localCoastalLands.filter { it["ngoId"] == uid }.map { doc ->
                        CoastalLand(
                            id = doc["id"] as? String ?: "",
                            name = doc["name"] as? String ?: "",
                            area = (doc["area"] as? Double) ?: 0.0,
                            carbonCredits = (doc["carbonCredits"] as? Double) ?: 0.0,
                            progress = (doc["progress"] as? Int) ?: 0,
                            location = doc["location"] as? String ?: ""
                        )
                    }
                    coastalLands = demoLands
                    totalCarbonCredits = coastalLands.sumOf { it.carbonCredits }
                    totalArea = coastalLands.sumOf { it.area }
                }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Blue Carbon Dashboard",
                        fontWeight = FontWeight.Bold,
                        color = primaryBlue
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        bottomBar = {
             Button(
                onClick = {
                    val totalArea = coastalLands.sumOf { it.area }.toFloat()
                    navController.navigate("AnalyticsScreen/blue/$totalArea")
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = primaryBlue),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Proceed to Analytics • ${String.format("%.2f", coastalLands.sumOf { it.carbonCredits })} tCO₂e", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate("RegisterLand") },
                containerColor = primaryBlue
            ) {
                Icon(Icons.Default.Add, "Register Project", tint = Color.White)
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
                    colors = CardDefaults.cardColors(containerColor = primaryBlue),
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
                            "From ${coastalLands.size} coastal projects",
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
                        value = "${String.format("%.2f", totalArea)} ha",
                        color = lightBlue,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Projects",
                        value = "${coastalLands.size}",
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
                            color = primaryBlue
                        )
                        Spacer(Modifier.height(16.dp))
                        CarbonCreditsGraph(coastalLands.map { it.carbonCredits })
                    }
                }
            }

            // Progress Overview
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
                            "Overall Progress",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryBlue
                        )
                        Spacer(Modifier.height(16.dp))
                        val avgProgress = if (coastalLands.isNotEmpty()) {
                            coastalLands.map { it.progress }.average().toInt()
                        } else 0
                        LinearProgressIndicator(
                            progress = { avgProgress / 100f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(12.dp),
                            color = primaryBlue,
                            trackColor = Color.Gray.copy(alpha = 0.2f)
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "$avgProgress% Complete",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryBlue
                        )
                    }
                }
            }

            // Coastal Lands
            item {
                Text(
                    "Coastal Lands",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }

            if (coastalLands.isEmpty()) {
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
                                Icons.Default.WaterDrop,
                                null,
                                tint = Color.Gray,
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(Modifier.height(16.dp))
                            Text(
                                "No coastal lands allocated yet",
                                fontSize = 18.sp,
                                color = Color.Black.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            } else {
                items(coastalLands) { land ->
                    CoastalLandCard(
                        land = land,
                        onClick = { navController.navigate("LandDetails/${land.id}/blue") }
                    )
                }
            }
        }
    }
}

@Composable
fun CarbonCreditsGraph(credits: List<Double>) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            if (credits.isNotEmpty()) {
                val maxCredits = credits.maxOrNull() ?: 1.0
                val points = credits.mapIndexed { index, credit ->
                    Pair(
                        (index * size.width / (credits.size - 1).coerceAtLeast(1)).toFloat(),
                        (size.height * (1 - credit / maxCredits)).toFloat()
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
                drawPath(path, Color(0xFF1565C0).copy(alpha = 0.3f))

                // Draw line
                drawPath(path, Color(0xFF1565C0), style = Stroke(width = 4f))
            }
        }
    }
}

@Composable
fun CoastalLandCard(land: CoastalLand, onClick: () -> Unit) {
    val primaryBlue = Color(0xFF1565C0)
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp),
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(4.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        land.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        land.location,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                Text(
                    "${String.format("%.2f", land.carbonCredits)} tCO₂e",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryBlue
                )
            }
            Spacer(Modifier.height(12.dp))
            Text(
                "Progress: ${land.progress}%",
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(Modifier.height(4.dp))
            LinearProgressIndicator(
                progress = { land.progress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = primaryBlue,
                trackColor = Color.Gray.copy(alpha = 0.2f)
            )
        }
    }
}

