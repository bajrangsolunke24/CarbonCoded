package com.example.jaldrishti

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*

import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.firestore

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterLandScreen(navController: NavController, viewModel: LandViewModel) {
    val context = LocalContext.current
    val primaryGreen = Color(0xFF2E7D32)
    val lightGreen = Color(0xFFE8F5E9)

    var landName by remember { mutableStateOf("") }
    var landType by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var latitude by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    val fusedLocationClient: FusedLocationProviderClient = remember {
        LocationServices.getFusedLocationProviderClient(context)
    }

    fun getCurrentLocation() {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                location?.let {
                    latitude = it.latitude.toString()
                    longitude = it.longitude.toString()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Register Land",
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
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = lightGreen),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        tint = primaryGreen,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Text(
                        "Fill in the land details. You can mark boundaries using AR or Map after submission.",
                        fontSize = 14.sp,
                        color = Color.Black.copy(alpha = 0.7f),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Land Name
            OutlinedTextField(
                value = landName,
                onValueChange = { landName = it },
                label = { Text("Land Name *") },
                leadingIcon = {
                    Icon(Icons.Default.Place, null, tint = primaryGreen)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            // Land Type
            var expanded by remember { mutableStateOf(false) }
            val landTypes = listOf("Forest", "Agricultural", "Grassland", "Wetland", "Mangrove", "Seagrass", "Salt Marsh", "Other")

            Box(
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = landType,
                    onValueChange = {},
                    readOnly = true,
                    enabled = false, // Disable default interaction to let Box handle click
                    label = { Text("Land Type *") },
                    leadingIcon = {
                        Icon(Icons.Default.Category, null, tint = primaryGreen)
                    },
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                    },
                    modifier = Modifier
                        .fillMaxWidth(), // Removed menuAnchor due to version issues 
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        disabledTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        disabledContainerColor = Color.White,
                        disabledBorderColor = Color.Gray
                    )
                )
                // Overlay to capture clicks
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .clickable { expanded = !expanded }
                )
            
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(Color.White).fillMaxWidth(0.9f)
                ) {
                    landTypes.forEach { type ->
                        DropdownMenuItem(
                            text = { Text(type) },
                            onClick = {
                                landType = type
                                expanded = false
                            }
                        )
                    }
                }
            }

            // Address
            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Address *") },
                leadingIcon = {
                    Icon(Icons.Default.LocationOn, null, tint = primaryGreen)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            // Location Coordinates
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = latitude,
                    onValueChange = { latitude = it },
                    label = { Text("Latitude") },
                    leadingIcon = {
                        Icon(Icons.Default.MyLocation, null, tint = primaryGreen)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    readOnly = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
                OutlinedTextField(
                    value = longitude,
                    onValueChange = { longitude = it },
                    label = { Text("Longitude") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    readOnly = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
            }

            // Get Location Button
            Button(
                onClick = { getCurrentLocation() },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.MyLocation, null, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Get My Location", fontWeight = FontWeight.Bold)
            }

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description (Optional)") },
                leadingIcon = {
                    Icon(Icons.Default.Description, null, tint = primaryGreen)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                shape = RoundedCornerShape(12.dp),
                maxLines = 4,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            Spacer(Modifier.height(8.dp))

            // Submit Button
            Button(
                onClick = {
                    if (landName.isNotEmpty() && landType.isNotEmpty() && address.isNotEmpty()) {
                        val lat = latitude.toDoubleOrNull() ?: 0.0
                        val lng = longitude.toDoubleOrNull() ?: 0.0
                        
                        viewModel.updateBasicDetails(
                            name = landName,
                            type = landType,
                            address = address,
                            description = description,
                            lat = lat,
                            lng = lng
                        )
                        
                        navController.navigate("BoundaryMarking")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                shape = RoundedCornerShape(16.dp),
                enabled = landName.isNotEmpty() && landType.isNotEmpty() && address.isNotEmpty()
            ) {
                 Text(
                    "Submit & Mark Boundary",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
