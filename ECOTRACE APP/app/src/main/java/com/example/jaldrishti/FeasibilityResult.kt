package com.example.jaldrishti


import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeasibilityFlow(navController: NavController) {
    var isLoading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        delay(3000)
        isLoading = false
    }
    Crossfade(isLoading) { loading ->
        if (loading) FeasibilityLoadingPage() else FeasibilityResultPage()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeasibilityLoadingPage() {
    val blue = Color(0xFF1565C0)
    val white = Color.White
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Feasibility Analysis", color = white, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = blue)
            )
        },
        containerColor = white
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))
            Text("Analyzing your location for rainwater harvesting potential",
                color = Color.Black, fontWeight = FontWeight.Medium, fontSize = 17.sp)
            Spacer(Modifier.height(30.dp))
            CircularProgressIndicator(color = blue, strokeWidth = 6.dp, modifier = Modifier.size(56.dp))
            Spacer(Modifier.height(14.dp))
            Text("Analyzing your location...", color = blue, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            LinearProgressIndicator(color = blue, modifier = Modifier.fillMaxWidth().height(8.dp))
            Spacer(Modifier.height(28.dp))
            Text("What we're checking:", fontWeight = FontWeight.Medium, color = Color.Black, fontSize = 15.sp)
            Spacer(Modifier.height(13.dp))
            FeasibilityPoint("Historical Rainfall Data", Icons.Default.CloudQueue, blue)
            FeasibilityPoint("Groundwater table depth & quality", Icons.Default.WaterDrop, blue)
            FeasibilityPoint("Soil composition", Icons.Default.CheckCircle, blue)
            FeasibilityPoint("Local water demand pattern", Icons.Default.LocationOn, blue)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeasibilityResultPage() {
    val blue = Color(0xFF1565C0)
    val white = Color.White
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Feasibility Confirmed!", color = white, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = blue)
            )
        },
        containerColor = white
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(8.dp))
            Text("Your location shows excellent potential for RH & AR systems.",
                color = Color.Black, fontWeight = FontWeight.Medium, fontSize = 16.sp)
            Spacer(Modifier.height(13.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F8FF)),
                shape = RoundedCornerShape(11.dp),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.LocationOn, contentDescription = "Location", tint = blue)
                    Spacer(Modifier.width(7.dp))
                    Column {
                        Text("Kurukshetra, Haryana", color = blue, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text("29.9556° N, 76.8195° E", color = Color.Black, fontSize = 13.sp)
                    }
                }
            }
            Spacer(Modifier.height(19.dp))
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                FeasibilityBox(
                    "Rainfall Analysis", "582mm\nAnnual Rainfall", "Good",
                    "Rainfall conditions: Suitable", Icons.Default.CloudQueue, blue
                )
                Spacer(Modifier.width(12.dp))
                FeasibilityBox(
                    "Groundwater Analysis", "", "Good",
                    "Groundwater condition: Suitable", Icons.Default.WaterDrop, blue
                )
            }
            Spacer(Modifier.height(25.dp))
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly) {
                Button(onClick = { /* go to home */ }, colors = ButtonDefaults.buttonColors(containerColor = blue)) {
                    Text("Back to Home", color = Color.White)
                }
                Button(onClick = { /* go to install */ }, colors = ButtonDefaults.buttonColors(containerColor = blue)) {
                    Text("Proceed to Installation Details", color = Color.White)
                }
            }
        }
    }
}

@Composable
fun FeasibilityPoint(label: String, icon: ImageVector, iconColor: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 6.dp)) {
        Icon(icon, contentDescription = label, tint = iconColor, modifier = Modifier.size(22.dp))
        Spacer(Modifier.width(10.dp))
        Text(label, color = Color.Black, fontSize = 14.sp)
    }
}

@Composable
fun FeasibilityBox(
    title: String,
    value: String,
    grade: String,
    condition: String,
    icon: ImageVector,
    color: Color
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(5.dp),
        modifier = Modifier.width(150.dp).height(160.dp),
    ) {
        Column(
            Modifier.padding(12.dp).fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(22.dp))
                Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFB8E1FF)) {
                    Text(grade, color = color, fontWeight = FontWeight.Bold, fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 1.dp))
                }
            }
            Spacer(Modifier.height(5.dp))
            Text(title, color = color, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(Modifier.height(2.dp))
            if (value.isNotEmpty()) Text(value, color = Color.Black, fontSize = 12.sp)
            Spacer(Modifier.height(7.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(2.dp))
                Text(condition, color = color, fontWeight = FontWeight.Medium, fontSize = 12.sp)
            }
        }
    }
}
