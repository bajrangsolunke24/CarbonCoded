package com.example.jaldrishti

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.collectAsState
import com.google.firebase.Firebase
import com.google.firebase.firestore.firestore
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

enum class BoundaryMethod {
    AR, MAP
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BoundaryMarkingScreen(
    navController: NavController,
    viewModel: LandViewModel
) {
    val primaryGreen = Color(0xFF2E7D32)
    val lightGreen = Color(0xFFE8F5E9)
    var selectedMethod by remember { mutableStateOf<BoundaryMethod?>(null) }
    
    val draftLand by viewModel.draftLand.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Mark Boundary",
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                ),
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = primaryGreen)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Spacer(Modifier.height(20.dp))

            // Land Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = lightGreen),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        "Land: ${draftLand.name.ifEmpty { "New Land" }}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryGreen
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Type: ${draftLand.type.ifEmpty { "N/A" }}",
                        fontSize = 14.sp,
                        color = Color.Black.copy(alpha = 0.7f)
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Area: ${draftLand.area} hectares",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            Text(
                "Choose Boundary Marking Method",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(Modifier.height(10.dp))

            // AR Method
            BoundaryMethodCard(
                title = "AR Walking",
                description = "Walk around your land boundary using AR to mark coordinates",
                icon = Icons.Default.ViewInAr,
                color = primaryGreen,
                onClick = {
                    selectedMethod = BoundaryMethod.AR
                    navController.navigate("ARBoundary") // Uses ViewModel data model
                }
            )

            // Map Method
            BoundaryMethodCard(
                title = "Map Drawing",
                description = "Manually draw the boundary on a map",
                icon = Icons.Default.Map,
                color = primaryGreen,
                onClick = {
                    selectedMethod = BoundaryMethod.MAP
                    navController.navigate("MapBoundary") // Uses ViewModel data model
                }
            )
        }
    }
}

@Composable
fun BoundaryMethodCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(40.dp)
            )
            Spacer(Modifier.width(16.dp))
            Column {
                Text(
                    title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
