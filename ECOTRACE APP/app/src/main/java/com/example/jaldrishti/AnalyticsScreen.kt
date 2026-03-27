package com.example.jaldrishti

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    navController: NavController,
    type: String = "green", // "green" or "blue"
    area: Float = 10.0f
) {
    val primaryColor = if (type == "green") Color(0xFF2E7D32) else Color(0xFF1565C0)
    var carbonCredits by remember { mutableStateOf(0.0) }
    
    // Simulate streamed data for graphs
    val initialData = List(10) { (10..50).random().toFloat() }
    var graphData by remember { mutableStateOf(initialData) }

    // WebSocket Simulation
    LaunchedEffect(Unit) {
        // Calculate credits based on area (dummy formula)
        // Green: 1.5 credits per hectare
        // Blue: 2.5 credits per hectare
        val factor = if (type == "green") 1.5 else 2.5
        carbonCredits = area * factor

        while(true) {
            delay(2000) // 2 second stream
            val newItem = (10..50).random().toFloat()
            graphData = graphData.drop(1) + newItem
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Real-time Analytics", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = primaryColor,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = primaryColor),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(24.dp)) {
                        Text("Projected Carbon Credits", color = Color.White.copy(alpha = 0.8f))
                        Text(
                            "${String.format("%.2f", carbonCredits)} tCO₂e",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text("Based on area: $area ha", color = Color.White.copy(alpha = 0.6f))
                    }
                }
            }

            item {
                Text(
                    "Sequestration Rate (Live)",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(4.dp),
                    modifier = Modifier.fillMaxWidth().height(250.dp)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text("CO₂ Capture (tons/hour)", fontSize = 14.sp, color = Color.Black.copy(alpha = 0.7f))
                        Spacer(Modifier.height(16.dp))
                        StreamingGraph(data = graphData, color = primaryColor)
                    }
                }
            }
            
            item {
                 Text(
                    "Market Value",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Text(
                    "Payout & Payment Details",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Text(
                    "Monthly Performance",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(2.dp),
                    modifier = Modifier.fillMaxWidth().height(200.dp)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Monthly Carbon Credits (Last 6 Months)", fontSize = 12.sp, color = Color.Black.copy(alpha = 0.7f))
                        Spacer(Modifier.height(8.dp))
                        // Mock Bar Chart
                        Row(
                            Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            val months = listOf("Aug", "Sep", "Oct", "Nov", "Dec", "Jan")
                            val data = listOf(0.4f, 0.5f, 0.45f, 0.6f, 0.7f, 0.8f)
                            data.forEachIndexed { index, value ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .width(24.dp)
                                            .fillMaxHeight(value) // Height relative to max
                                            .background(primaryColor, RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(months[index], fontSize = 10.sp, color = Color.Black.copy(alpha = 0.7f))
                                }
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    "Payout History",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Month", fontWeight = FontWeight.Bold, color = primaryColor)
                            Text("Amount", fontWeight = FontWeight.Bold, color = primaryColor)
                            Text("Status", fontWeight = FontWeight.Bold, color = primaryColor)
                        }
                        HorizontalDivider(Modifier.padding(vertical = 8.dp))
                        
                        val history = listOf(
                             Triple("Jan 2026", "₹26,640", "Paid"),
                             Triple("Dec 2025", "₹23,296", "Paid"),
                             Triple("Nov 2025", "₹20,800", "Paid")
                        )
                        
                        history.forEach {
                            Row(
                                Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(it.first, fontSize = 14.sp)
                                Text(it.second, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                Text(it.third, fontSize = 14.sp, color = if(it.third=="Paid") Color(0xFF2E7D32) else Color.Gray)
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    "Upcoming Payout",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor
                )
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Linked Account", color = Color.Gray)
                            Text("**** 4582", fontWeight = FontWeight.Bold)
                        }
                        HorizontalDivider(Modifier.padding(vertical = 12.dp), color = Color.LightGray.copy(alpha = 0.5f))
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Est. Next Payout", color = Color.Gray)
                            Text("Feb 15, 2026", fontWeight = FontWeight.Bold, color = primaryColor)
                        }
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = { /* TODO: Withdraw */ },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Withdraw Funds")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StreamingGraph(data: List<Float>, color: Color) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        val maxVal = 60f // fixed scale
        
        val stepX = width / (data.size - 1)
        
        val path = Path()
        data.forEachIndexed { index, value ->
            val x = index * stepX
            val y = height - (value / maxVal * height)
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
            
            drawCircle(color, 4f, androidx.compose.ui.geometry.Offset(x,y))
        }
        
        drawPath(path, color, style = Stroke(width = 5f))
        
        // Fill
        path.lineTo(width, height)
        path.lineTo(0f, height)
        path.close()
        drawPath(path, color.copy(alpha = 0.2f))
    }
}

@Composable
fun MarketCard(title: String, value: String, change: String, color: Color, modifier: Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(title, color = Color.Gray, fontSize = 12.sp)
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black)
            if (change.isNotEmpty()) Text(change, color = color, fontSize = 14.sp)
        }
    }
}
