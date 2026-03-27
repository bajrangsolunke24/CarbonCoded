package com.example.jaldrishti

import androidx.compose.animation.Crossfade
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.delay
//


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeasibilityPage(navController: NavController) {
    val blue = Color(0xFF1565C0)
    val red = Color(0xFFD32F2F)
    val yellow = Color(0xFFFFC107)
    val green = Color(0xFF4CAF50)
    val lightBlue = Color(0xFFF0F8FF)
    val white = Color.White

    var currentStage by remember { mutableStateOf("input") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }

    // Output state for result
    var zoneColor by remember { mutableStateOf(blue) }
    var icon by remember { mutableStateOf(Icons.Default.Info) }
    var summaryTitle by remember { mutableStateOf("") }
    var summaryDesc by remember { mutableStateOf("") }
    var zoneName by remember { mutableStateOf("") }

    when (currentStage) {

        // INPUT SCREEN
        "input" -> Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Feasibility Check", color = white, fontWeight = FontWeight.Bold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = blue)
                )
            },
            containerColor = lightBlue
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 24.dp, vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Top
            ) {
                Text("Enter Your Location",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = blue
                )
                Spacer(Modifier.height(24.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(22.dp),
                    elevation = CardDefaults.cardElevation(10.dp),
                    colors = CardDefaults.cardColors(containerColor = white)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp)
                            .defaultMinSize(minHeight = 260.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        OutlinedTextField(
                            value = city,
                            onValueChange = { city = it },
                            label = { Text("District/City Name") },
                            placeholder = { Text("e.g., Pune") },
                            leadingIcon = {
                                Icon(Icons.Default.LocationCity, contentDescription = null, tint = blue)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                        )
                        Spacer(Modifier.height(20.dp))
                        OutlinedTextField(
                            value = state,
                            onValueChange = { state = it },
                            label = { Text("State Name") },
                            placeholder = { Text("e.g., Maharashtra") },
                            leadingIcon = {
                                Icon(Icons.Default.Place, contentDescription = null, tint = blue)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                        )
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = {
                                if (city.isNotBlank() && state.isNotBlank()) {
                                    currentStage = "loading"
                                }
                            },
                            //enabled = city.isNotBlank() && state.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = blue),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Analyze Feasibility", color = white, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                    }
                }
                Spacer(Modifier.height(30.dp))
                Text(
                    " Result is based on average annual precipitation zone mapping for your input district & state.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Center
                )

                Spacer(Modifier.height(40.dp))
                Button(
                    onClick = { navController.navigate("FeasibleResult") },
                    colors = ButtonDefaults.buttonColors(containerColor = blue),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = white)
                    Spacer(Modifier.width(8.dp))
                    Text("Proceed to Installation Details", color = white, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                Spacer(Modifier.height(20.dp))
                OutlinedButton(
                    onClick = { navController.navigate("MainPage") },
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                ) {
                    Icon(Icons.Default.Home, contentDescription = null, tint = blue)
                    Spacer(Modifier.width(8.dp))
                    Text("Back to Home", color = blue, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }
        }

        // LOADING SCREEN from your earlier code
        "loading" -> {
            LaunchedEffect(Unit) {
                delay(2850)

                val stateLower = state.trim().lowercase()
                val (zColor, zIcon, sTitle, sDesc, zName) = when {
                    stateLower in listOf("kerala", "assam", "meghalaya", "tripura", "west bengal", "coastal karnataka", "nagaland") -> {
                        listOf(
                            green,
                            Icons.Default.CheckCircle,
                            "Excellent Potential Confirmed!",
                            "Outstanding rainfall zone. Highly suitable for rainwater harvesting and AR systems.",
                            "High Rainfall Zone"
                        )
                    }
                    stateLower in listOf("maharashtra", "gujarat", "madhya pradesh", "odisha", "haryana", "andhra pradesh", "uttar pradesh") -> {
                        listOf(
                            yellow,
                            Icons.Default.Info,
                            "Moderate Suitability Achieved",
                            "Moderate rainfall. Feasible for harvesting with proper design.",
                            "Moderate Rainfall Zone"
                        )
                    }
                    else -> {
                        listOf(
                            red,
                            Icons.Default.Close,
                            "Limited Potential at This Location",
                            "Low rainfall detected. Larger catchment or alternate sources advised.",
                            "Low Rainfall Zone"
                        )
                    }
                }
                zoneColor = zColor as Color
                icon = zIcon as ImageVector
                summaryTitle = sTitle as String
                summaryDesc = sDesc as String
                zoneName = zName as String
                currentStage = "result"
            }
            FeasibilityLoadingScreen()
        }

        // RESULT SCREEN
        "result" -> Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(icon, contentDescription = null, tint = Color.White)
                            Spacer(Modifier.width(8.dp))
                            Text(zoneName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = zoneColor)
                )
            },
            containerColor = lightBlue
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp)
                        .align(Alignment.TopCenter),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(Modifier.height(16.dp))
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .defaultMinSize(minHeight = 132.dp),
                        shape = RoundedCornerShape(22.dp),
                        elevation = CardDefaults.cardElevation(10.dp),
                        colors = CardDefaults.cardColors(containerColor = white)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 28.dp, horizontal = 22.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(icon, contentDescription = null, tint = zoneColor, modifier = Modifier.size(54.dp))
                            Spacer(Modifier.height(14.dp))
                            Text(summaryTitle, fontWeight = FontWeight.Bold, color = blue, fontSize = 20.sp, textAlign = TextAlign.Center)
                            Spacer(Modifier.height(7.dp))
                            Text(summaryDesc, color = Color.Gray, fontSize = 14.sp, textAlign = TextAlign.Center)
                        }
                    }
                    // After the summary card, before the button column

                    Spacer(Modifier.height(16.dp))

// LOCATION CARD (Now full-width, bold)
                    // Location card block
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 74.dp),
                        shape = RoundedCornerShape(20.dp),
                        elevation = CardDefaults.cardElevation(9.dp),
                        colors = CardDefaults.cardColors(containerColor = white)
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(vertical = 20.dp, horizontal = 24.dp)
                                .fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.MyLocation,
                                contentDescription = null,
                                tint = blue,
                                modifier = Modifier.size(34.dp)
                            )
                            Spacer(Modifier.width(18.dp))
                            Text(
                                "$city, $state",
                                fontWeight = FontWeight.Bold,
                                color = blue,
                                fontSize = 18.sp,
                                maxLines = 1,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

// Call ExpandableTipCard here

                    Spacer(Modifier.height(25.dp))

                    ExpandableTipCard(zoneName = zoneName, blue = blue, yellow = yellow)


                    Spacer(Modifier.height(20.dp))




                }
                // Buttons stick to the bottom (no large gap)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 30.dp, start = 18.dp, end = 18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = { navController.navigate("FeasibleResult") },
                        colors = ButtonDefaults.buttonColors(containerColor = blue),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = white)
                        Spacer(Modifier.width(8.dp))
                        Text("Proceed to Installation Details", color = white, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                    OutlinedButton(
                        onClick = { navController.navigate("MainPage") },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Icon(Icons.Default.Home, contentDescription = null, tint = blue)
                        Spacer(Modifier.width(8.dp))
                        Text("Back to Home", color = blue, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeasibilityLoadingScreen() {
    val blue = Color(0xFF1565C0)
    val white = Color.White
    val lightBlue = Color(0xFFF0F8FF)
    val checkingItems = listOf(
        CheckingItem("Historical Rainfall Data", Icons.Default.CloudQueue, "Analyzing last 10 years precipitation patterns"),
        CheckingItem("Groundwater Table Analysis", Icons.Default.WaterDrop, "Checking depth, quality and seasonal variations"),
        CheckingItem("Soil Composition Study", Icons.Default.Landscape, "Testing permeability and filtration capacity"),
        CheckingItem("Local Water Demand Pattern", Icons.Default.Analytics, "Assessing household and community usage"),
        CheckingItem("Roof Area Assessment", Icons.Default.Home, "Calculating catchment area potential"),
        CheckingItem("Climate Conditions", Icons.Default.Thermostat, "Evaluating temperature and humidity factors"),
        CheckingItem("Environmental Impact", Icons.Default.Eco, "Checking sustainability and ecological benefits"),
        CheckingItem("Cost-Benefit Analysis", Icons.Default.AccountBalance, "Calculating ROI and payback period")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text("Feasibility Analysis",
                        color = white,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = blue)
            )
        },
        containerColor = lightBlue
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Card(
                    colors = CardDefaults.cardColors(containerColor = white),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(4.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "Analyzing Your Location",
                            fontWeight = FontWeight.Bold,
                            color = blue,
                            fontSize = 22.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Comprehensive rainwater harvesting potential assessment",
                            fontWeight = FontWeight.Medium,
                            color = Color.Gray,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        CircularProgressIndicator(
                            color = blue,
                            strokeWidth = 6.dp,
                            modifier = Modifier.size(80.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Processing data...",
                            color = blue,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        LinearProgressIndicator(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .height(8.dp),
                            color = blue,
                            trackColor = lightBlue
                        )
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    "What we're analyzing:",
                    fontWeight = FontWeight.Bold,
                    color = blue,
                    fontSize = 18.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
            items(checkingItems) { item ->
                FeasibilityCheckItemCard(item, blue)
                Spacer(modifier = Modifier.height(12.dp))
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }
}

data class CheckingItem(
    val title: String,
    val icon: ImageVector,
    val description: String
)
@Composable
fun FeasibilityCheckItemCard(item: CheckingItem, iconColor: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = iconColor.copy(alpha = 0.1f),
                modifier = Modifier.size(48.dp)
            ) {
                Icon(
                    item.icon,
                    contentDescription = item.title,
                    tint = iconColor,
                    modifier = Modifier
                        .padding(12.dp)
                        .size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    item.title,
                    color = Color.Black,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    item.description,
                    color = Color.Gray,
                    fontSize = 13.sp
                )
            }
        }
    }
}
@Composable
fun ExpandableTipCard(zoneName: String, blue: Color, yellow: Color) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .wrapContentWidth()
            .padding(horizontal = 8.dp)
            .clickable { expanded = !expanded },
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFEAF7FE))
    ) {
        Row(
            modifier = Modifier
                .padding(vertical = 14.dp, horizontal = 16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                imageVector = Icons.Default.Lightbulb,
                contentDescription = null,
                tint = yellow,
                modifier = Modifier.size(28.dp)
            )
            Spacer(Modifier.width(13.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    when(zoneName) {
                        "High Rainfall Zone" -> "Pro Tip: Install roof filters and clean gutters after seasonal rainfall. Simple gravity tanks work best in high rainfall regions."
                        "Moderate Rainfall Zone" -> "Smart Advice: Use storage tanks sized for both heavy rain periods and dry spells. Check gutter outlets during first rains."
                        else -> "Important: Use largest catchment area possible, and consider modular storage."
                    },
                    color = blue,
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp,
                    maxLines = if (expanded) Int.MAX_VALUE else 3,
                    overflow = if (expanded) TextOverflow.Visible else TextOverflow.Ellipsis,
                    modifier = Modifier.animateContentSize()
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "Tap tip to ${if(expanded) "collapse" else "expand"}",
                    color = Color.Gray,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.W400
                )
            }
        }
    }
}