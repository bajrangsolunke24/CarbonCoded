package com.example.jaldrishti

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*

import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarbonSelectionScreen(navController: NavController) {
    val primaryGreen = Color(0xFF2E7D32)
    val primaryBlue = Color(0xFF1565C0)
    val lightGreen = Color(0xFFE8F5E9)
    val lightBlue = Color(0xFFE3F2FD)
    val white = Color.White

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { navController.navigate("AIAssistant") },
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                icon = { Icon(Icons.Default.SmartToy, contentDescription = "AI") },
                text = { Text("AI Assistant") }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFFF5F5F5),
                            Color(0xFFE8F5E9)
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Spacer(Modifier.height(40.dp))

                // App Logo and Title
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(vertical = 20.dp)
                ) {
                    Text(
                        text = "ECOTRACE",
                        fontSize = 42.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = primaryGreen,
                        letterSpacing = 2.sp
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Track Your Carbon Impact",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(Modifier.height(20.dp))

                // Carbon Type Selection Cards
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Green Carbon Card
                    CarbonTypeCard(
                        title = "Green Carbon",
                        description = "Register your land and track carbon credits from forests, agriculture, and terrestrial ecosystems",
                        icon = Icons.Default.Forest,
                        backgroundColor = lightGreen,
                        iconColor = primaryGreen,
                        borderColor = primaryGreen,
                        onClick = {
                            navController.navigate("GreenCarbonSignUp")
                        }
                    )

                    // Blue Carbon Card
                    CarbonTypeCard(
                        title = "Blue Carbon",
                        description = "For NGOs: Manage coastal ecosystems, mangroves, and marine carbon sequestration projects",
                        icon = Icons.Default.WaterDrop,
                        backgroundColor = lightBlue,
                        iconColor = primaryBlue,
                        borderColor = primaryBlue,
                        onClick = {
                            navController.navigate("BlueCarbonSignIn")
                        }
                    )
                }

                Spacer(Modifier.weight(1f))

                // Footer
                Text(
                    text = "Choose your carbon tracking path",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(bottom = 20.dp)
                )
            }
        }
    }
}

@Composable
fun CarbonTypeCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    backgroundColor: Color,
    iconColor: Color,
    borderColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .padding(horizontal = 4.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(4.dp),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconColor,
                    modifier = Modifier.size(48.dp)
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Navigate",
                    tint = iconColor,
                    modifier = Modifier.size(28.dp)
                )
            }

            Column {
                Text(
                    text = title,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = iconColor
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

