package com.example.jaldrishti

import android.Manifest
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.location.Location
import android.preference.PreferenceManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.navigation.NavController
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polygon
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

data class BoundaryPoint(
    val latitude: Double,
    val longitude: Double,
    val altitude: Double = 0.0,
    val timestamp: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ARBoundaryScreen(navController: NavController, viewModel: LandViewModel) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val primaryGreen = Color(0xFF2E7D32)
    
    // Initialize OSMDroid
    LaunchedEffect(Unit) {
        val prefs: SharedPreferences = context.getSharedPreferences("osmdroid", Context.MODE_PRIVATE)
        Configuration.getInstance().load(context, prefs)
        Configuration.getInstance().userAgentValue = context.packageName
    }

    var map by remember { mutableStateOf<MapView?>(null) }
    var boundaryPoints by remember { mutableStateOf<List<GeoPoint>>(emptyList()) }
    var area by remember { mutableStateOf(0.0) }
    var perimeter by remember { mutableStateOf(0.0) }
    var myLocationOverlay by remember { mutableStateOf<MyLocationNewOverlay?>(null) }
    var polygonOverlay by remember { mutableStateOf<Polygon?>(null) }
    var isSaving by remember { mutableStateOf(false) }

    // Permission Handling
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true || 
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
            myLocationOverlay?.enableMyLocation()
            myLocationOverlay?.enableFollowLocation()
        }
    }

    // Lifecycle Observer for Map
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> map?.onResume()
                Lifecycle.Event.ON_PAUSE -> map?.onPause()
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            map?.onDetach()
        }
    }

    Scaffold(
        topBar = {
             TopAppBar(
                 title = { Text("GPS Walk Boundary", fontWeight = FontWeight.Bold, color = primaryGreen) },
                 navigationIcon = {
                     IconButton(onClick = { navController.popBackStack() }) { 
                         Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = primaryGreen) 
                     }
                 },
                 actions = {
                    IconButton(onClick = {
                        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                            myLocationOverlay?.enableFollowLocation()
                            val location = myLocationOverlay?.myLocation
                            location?.let { map?.controller?.animateTo(it) }
                        } else {
                            permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION))
                        }
                    }) {
                        Icon(Icons.Default.MyLocation, "My Location", tint = primaryGreen)
                    }
                 },
                 colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
             )
        },
        bottomBar = {
            Surface(Modifier.fillMaxWidth(), shadowElevation = 8.dp) {
                Column(Modifier.padding(16.dp)) {
                    if (boundaryPoints.isNotEmpty()) {
                         Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly) {
                             InfoChip("Points", "${boundaryPoints.size}", primaryGreen)
                             InfoChip("Area", "${String.format("%.2f", area)} ha", primaryGreen)
                             InfoChip("Perimeter", "${String.format("%.1f", perimeter)} m", primaryGreen)
                         }
                         Spacer(Modifier.height(8.dp))
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = { 
                                val location = myLocationOverlay?.myLocation
                                if (location != null) {
                                    val newPoint = GeoPoint(location.latitude, location.longitude)
                                    val newPoints = boundaryPoints + newPoint
                                    boundaryPoints = newPoints
                                    
                                    // Update visual markers
                                    val marker = Marker(map)
                                    marker.position = newPoint
                                    marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                                    marker.title = "Point ${boundaryPoints.size}"
                                    map?.overlays?.add(marker)
                                    
                                    // Update polygon
                                    if (boundaryPoints.size >= 2) {
                                        if (polygonOverlay != null) map?.overlays?.remove(polygonOverlay)
                                        
                                        val poly = Polygon()
                                        // Close the loop for visualization (first point added to end effectively)
                                        val displayPoints = ArrayList(boundaryPoints)
                                        displayPoints.add(boundaryPoints[0]) 
                                        
                                        poly.points = displayPoints
                                        poly.fillPaint.color = android.graphics.Color.parseColor("#4D2E7D32") // Semi-transparent green
                                        poly.outlinePaint.color = android.graphics.Color.parseColor("#2E7D32")
                                        poly.outlinePaint.strokeWidth = 5f
                                        
                                        map?.overlays?.add(poly)
                                        polygonOverlay = poly
                                    }
                                    
                                    map?.invalidate()
                                    
                                    if (boundaryPoints.size >= 3) {
                                         calculateAreaAndPerimeterGeo(boundaryPoints) { a, p -> area = a; perimeter = p }
                                    }
                                } else {
                                    AppUtil.showtoast(context, "Waiting for GPS location...")
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                        ) {
                            Icon(Icons.Default.AddLocation, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Mark Corner")
                        }
                        
                         Button(
                            onClick = { 
                                boundaryPoints = emptyList()
                                area = 0.0
                                perimeter = 0.0
                                if (polygonOverlay != null) map?.overlays?.remove(polygonOverlay)
                                // Remove all markers (keep location overlay)
                                map?.overlays?.removeAll { it is Marker }
                                polygonOverlay = null
                                map?.invalidate()
                            },
                             colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                             enabled = boundaryPoints.isNotEmpty()
                        ) {
                            Icon(Icons.Default.Delete, null)
                        }

                        Button(
                            onClick = {
                                if (area > 0) {
                                    isSaving = true
                                    val pointsMap = boundaryPoints.map { mapOf("lat" to it.latitude, "lng" to it.longitude) }
                                    viewModel.updateBoundaryData(area, perimeter, pointsMap)
                                    
                                    // Determine destination based on land type (heuristic)
                                    val currentType = viewModel.draftLand.value.type
                                    val isCoastal = currentType in listOf("Mangrove", "Seagrass", "Salt Marsh")
                                    
                                    if (isCoastal) {
                                         viewModel.saveCoastalLand { success, error, landId ->
                                            isSaving = false
                                            if (success && landId != null) {
                                                AppUtil.showtoast(context, "Coastal Project Registered! Now identify your plants.")
                                                navController.navigate("PlantIdentification/$landId/${area}/coastalLands")
                                            } else {
                                                AppUtil.showtoast(context, error ?: "Failed to save")
                                            }
                                        }
                                    } else {
                                        viewModel.saveLand { success, error, landId ->
                                            isSaving = false
                                            if (success && landId != null) {
                                                AppUtil.showtoast(context, "Land Registered! Now identify your plants.")
                                                navController.navigate("PlantIdentification/$landId/${area}/lands")
                                            } else {
                                                AppUtil.showtoast(context, error ?: "Failed to save")
                                            }
                                        }
                                    }
                                }
                            },
                            enabled = area > 0 && !isSaving,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
                        ) {
                            if (isSaving) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                            } else {
                                Text("Submit")
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            AndroidView(
                factory = { ctx ->
                    MapView(ctx).apply {
                        setTileSource(TileSourceFactory.MAPNIK)
                        setMultiTouchControls(true)
                        controller.setZoom(18.0)
                        
                        val locationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(ctx), this)
                        locationOverlay.enableMyLocation()
                        locationOverlay.enableFollowLocation()
                        locationOverlay.runOnFirstFix {
                            (context as? android.app.Activity)?.runOnUiThread {
                                controller.animateTo(locationOverlay.myLocation)
                            }
                        }
                        overlays.add(locationOverlay)
                        myLocationOverlay = locationOverlay
                        
                        map = this
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
            
            if (boundaryPoints.isEmpty()) {
                 Box(Modifier.align(Alignment.TopCenter).padding(top = 16.dp).background(Color.White.copy(alpha=0.9f), RoundedCornerShape(8.dp)).padding(10.dp)) {
                    Text("Stand at a corner and click 'Mark Corner'", fontWeight = FontWeight.Bold, color = Color.Black)
                }
            }
        }
    }
}


fun calculateAreaAndPerimeterGeo(
    points: List<GeoPoint>,
    onResult: (Double, Double) -> Unit
) {
    if (points.size < 3) {
        onResult(0.0, 0.0)
        return
    }

    var area = 0.0
    var perimeter = 0.0
    val R = 6371000.0 // Earth radius in meters

    for (i in points.indices) {
        val j = (i + 1) % points.size
        val p1 = points[i]
        val p2 = points[j]
        
        val dLat = Math.toRadians(p2.latitude - p1.latitude)
        val dLon = Math.toRadians(p2.longitude - p1.longitude)
        val a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(p1.latitude)) * Math.cos(Math.toRadians(p2.latitude)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        val distance = R * c
        perimeter += distance
        
        area += (dLon * (2 + Math.sin(Math.toRadians(p1.latitude)) + Math.sin(Math.toRadians(p2.latitude)))) / 2
    }

    area = Math.abs(area) * R * R / 10000.0 // Convert to Hectares
    onResult(area, perimeter)
}
