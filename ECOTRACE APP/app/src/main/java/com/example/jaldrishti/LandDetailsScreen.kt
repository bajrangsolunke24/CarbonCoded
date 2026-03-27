package com.example.jaldrishti

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.firestore

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LandDetailsScreen(
    navController: NavController,
    landId: String,
    type: String // "green" or "blue"
) {
    val isBlue = type == "blue"
    val primaryColor = if (isBlue) Color(0xFF1565C0) else Color(0xFF2E7D32)
    val bgColor = if (isBlue) Color(0xFFE3F2FD) else Color(0xFFE8F5E9)
    val title = if (isBlue) "Coastal Project Details" else "Land Details"

    var landData by remember { mutableStateOf<Map<String, Any>?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    // Fetch Data (Try Firestore first, then Demo Data)
    LaunchedEffect(landId) {
        val collection = if (isBlue) "coastalLands" else "lands"
        val uid = Firebase.auth.currentUser?.uid
        
        // 1. Try local demo data first if ID starts with "demo"
        if (landId.startsWith("demo")) {
            val source = if (isBlue) DemoDataManager.localCoastalLands.value else DemoDataManager.localLands.value
            val found = source.find { it["id"] == landId }
            if (found != null) {
                landData = found
                isLoading = false
                return@LaunchedEffect
            }
        }

        // 2. Try Firestore
        if (uid != null) {
            Firebase.firestore.collection(collection).document(landId).get()
                .addOnSuccessListener { doc ->
                    if (doc.exists()) {
                        landData = doc.data
                    }
                    isLoading = false
                }
                .addOnFailureListener {
                    // Fallback to searching local if firestore permission failed or doc not found
                     val source = if (isBlue) DemoDataManager.localCoastalLands.value else DemoDataManager.localLands.value
                    val found = source.find { it["id"] == landId }
                    if (found != null) {
                        landData = found
                    }
                    isLoading = false
                }
        } else {
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, fontWeight = FontWeight.Bold, color = primaryColor) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = primaryColor)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(padding)
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = primaryColor, modifier = Modifier.align(Alignment.Center))
            } else if (landData == null) {
                 Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.ErrorOutline, null, tint = Color.Gray, modifier = Modifier.size(48.dp))
                    Spacer(Modifier.height(8.dp))
                    Text("Details not found", color = Color.Gray)
                }
            } else {
                val data = landData!!
                val name = data["name"] as? String ?: "Unnamed Land"
                val location = (data["address"] ?: data["location"]) as? String ?: "Unknown Location"
                val area = (data["area"] as? Double) ?: 0.0
                val credits = (data["carbonCredits"] as? Double) ?: 0.0
                val perimeter = (data["perimeter"] as? Double) ?: 0.0
                val progress = (data["progress"] as? Long)?.toInt() ?: (data["progress"] as? Int) ?: 0
                
                // Money Calculation: ₹1500 per Carbon Credit (Demo Rate)
                val moneyGenerated = credits * 1500.0

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(Modifier.padding(20.dp)) {
                            Text(name, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            Spacer(Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.LocationOn, null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text(location, fontSize = 16.sp, color = Color.Gray)
                            }
                        }
                    }

                    // Money & Credits Row
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        DetailStatCard(
                            "Money Generated",
                            "₹${String.format("%,.2f", moneyGenerated)}",
                            Icons.Default.AttachMoney,
                            Color(0xFF4CAF50), // Money Green
                            Modifier.weight(1f)
                        )
                        DetailStatCard(
                            "Carbon Credits",
                            "${String.format("%.2f", credits)} tCO₂e",
                            Icons.Default.Co2,
                            primaryColor,
                            Modifier.weight(1f)
                        )
                    }

                    // Physical Stats Row
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                         DetailStatCard(
                            "Area",
                            "${String.format("%.2f", area)} ha",
                            Icons.Default.Landscape,
                            Color(0xFF795548), // Brown
                            Modifier.weight(1f)
                        )
                        if (perimeter > 0) {
                             DetailStatCard(
                                "Perimeter",
                                "${String.format("%.1f", perimeter)} m",
                                Icons.Default.Straighten,
                                Color(0xFF607D8B), // Blue Gray
                                Modifier.weight(1f)
                            )
                        } else if (isBlue) {
                             DetailStatCard(
                                "Progress",
                                "$progress%",
                                Icons.Default.TrendingUp,
                                Color(0xFFFF9800), // Orange
                                Modifier.weight(1f)
                            )
                        }
                    }
                    
                    if (isBlue) {
                        Card(
                             modifier = Modifier.fillMaxWidth(),
                             colors = CardDefaults.cardColors(containerColor = Color.White),
                             shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Project Status", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.Black)
                                Spacer(Modifier.height(12.dp))
                                Text("Rehabilitation Progress", fontSize = 14.sp, color = Color.Gray)
                                Spacer(Modifier.height(8.dp))
                                LinearProgressIndicator(
                                    progress = { progress / 100f },
                                    modifier = Modifier.fillMaxWidth().height(10.dp),
                                    color = primaryColor,
                                    trackColor = Color.LightGray.copy(alpha=0.5f),
                                    strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailStatCard(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color, modifier: Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(color.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color)
            }
            Spacer(Modifier.height(12.dp))
            Text(title, fontSize = 12.sp, color = Color.Gray)
            Spacer(Modifier.height(4.dp))
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.Black)
        }
    }
}
