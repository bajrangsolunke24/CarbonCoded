package com.example.jaldrishti

import android.Manifest
import android.content.SharedPreferences
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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
import org.osmdroid.views.overlay.Polygon
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import kotlin.math.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapBoundaryScreen(navController: NavController, viewModel: LandViewModel) {
    val primaryGreen = Color(0xFF2E7D32)
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    // Initialize OSMDroid Configuration
    LaunchedEffect(Unit) {
        val prefs: SharedPreferences = context.getSharedPreferences("osmdroid", android.content.Context.MODE_PRIVATE)
        Configuration.getInstance().load(context, prefs)
        Configuration.getInstance().userAgentValue = context.packageName
    }

    var map by remember { mutableStateOf<MapView?>(null) }
    var points by remember { mutableStateOf<List<GeoPoint>>(emptyList()) }
    var polygonOverlay by remember { mutableStateOf<Polygon?>(null) }
    var isDrawing by remember { mutableStateOf(false) }
    var area by remember { mutableStateOf(0.0) }
    var perimeter by remember { mutableStateOf(0.0) }
    var myLocationOverlay by remember { mutableStateOf<MyLocationNewOverlay?>(null) }
    var isSaving by remember { mutableStateOf(false) }
    
     // Permission Launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        ) {
            myLocationOverlay?.enableMyLocation()
            myLocationOverlay?.enableFollowLocation()
        }
    }

    // Lifecycle
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
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Map Boundary (OSM)", fontWeight = FontWeight.Bold, color = primaryGreen) },
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
                            if (location != null) {
                                map?.controller?.animateTo(location)
                            }
                        } else {
                            permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                        }
                    }) {
                        Icon(Icons.Default.MyLocation, "My Location", tint = primaryGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            if (isDrawing || points.isNotEmpty()) {
                Surface(modifier = Modifier.fillMaxWidth(), shadowElevation = 8.dp) {
                    Column(Modifier.padding(16.dp)) {
                        if (points.size >= 3) {
                            Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly) {
                                InfoChip("Area", "${String.format("%.2f", area)} ha", primaryGreen)
                                InfoChip("Perimeter", "${String.format("%.0f", perimeter)} m", primaryGreen)
                            }
                            Spacer(Modifier.height(8.dp))
                        }
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                             Button(
                                onClick = {
                                    if (map != null && polygonOverlay != null) {
                                        map!!.overlays.remove(polygonOverlay)
                                        map!!.invalidate()
                                    }
                                    points = emptyList()
                                    polygonOverlay = null
                                    area = 0.0
                                    perimeter = 0.0
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Delete, null)
                                Spacer(Modifier.width(4.dp))
                                Text("Clear")
                            }
                            
                            Button(
                                onClick = {
                                    if (area > 0) {
                                        isSaving = true
                                        val pointsMap = points.map { mapOf("lat" to it.latitude, "lng" to it.longitude) }
                                        viewModel.updateBoundaryData(area, perimeter, pointsMap)
                                        
                                        val currentType = viewModel.draftLand.value.type
                                        val isCoastal = currentType in listOf("Mangrove", "Seagrass", "Salt Marsh")
                                        
                                        if (isCoastal) {
                                            viewModel.saveCoastalLand { success, error, landId ->
                                                isSaving = false
                                                if (success && landId != null) {
                                                    navController.navigate("PlantIdentification/$landId/$area/coastalLands")
                                                } else {
                                                    AppUtil.showtoast(context, error ?: "Failed to save")
                                                }
                                            }
                                        } else {
                                            viewModel.saveLand { success, error, landId ->
                                                isSaving = false
                                                if (success && landId != null) {
                                                    navController.navigate("PlantIdentification/$landId/$area/lands")
                                                } else {
                                                    AppUtil.showtoast(context, error ?: "Failed to save")
                                                }
                                            }
                                        }
                                    }
                                },
                                enabled = area > 0 && !isSaving,
                                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                                modifier = Modifier.weight(1f)
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
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isDrawing = !isDrawing },
                containerColor = if (isDrawing) Color.Red else primaryGreen,
                contentColor = Color.White
            ) {
                Icon(if (isDrawing) Icons.Default.Edit else Icons.Default.Edit, "Draw")
            }
        }
    ) { padding ->
        Box(Modifier.padding(padding)) {
            AndroidView(
                factory = { ctx ->
                    MapView(ctx).apply {
                        map = this
                        setTileSource(TileSourceFactory.MAPNIK)
                        setMultiTouchControls(true)
                        controller.setZoom(18.0) 
                        
                        // Setup MyLocation
                        val locationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(ctx), this)
                        locationOverlay.enableMyLocation()
                        locationOverlay.enableFollowLocation()
                        overlays.add(locationOverlay)
                        myLocationOverlay = locationOverlay

                        // Check permissions
                         if (ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                            permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                        }

                        // Add click listener
                        val receive = object : MapEventsReceiver {
                            override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                                if (isDrawing && p != null) {
                                    val newPoints = points + p
                                    points = newPoints
                                    
                                    if (polygonOverlay != null) {
                                        overlays.remove(polygonOverlay)
                                    }
                                    
                                    if (newPoints.size >= 2) {
                                        val poly = Polygon()
                                        poly.points = newPoints
                                        poly.fillColor = android.graphics.Color.parseColor("#4D4CAF50")
                                        poly.strokeColor = android.graphics.Color.GREEN
                                        poly.strokeWidth = 5f
                                        overlays.add(poly)
                                        polygonOverlay = poly
                                        
                                        if (newPoints.size >= 3) {
                                            area = calculateAreaOSM(newPoints)
                                            perimeter = calculatePerimeterOSM(newPoints)
                                        }
                                    }
                                    
                                    invalidate()
                                    return true
                                }
                                return false
                            }
                            override fun longPressHelper(p: GeoPoint?): Boolean = false
                        }
                        overlays.add(MapEventsOverlay(receive))
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
            
            if (isDrawing && points.isEmpty()) {
                Card(
                    modifier = Modifier.align(Alignment.TopCenter).padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.9f))
                ) {
                    Text("Tap map to mark points", Modifier.padding(12.dp))
                }
            }
        }
    }
}

// Calculation Logic
fun calculateAreaOSM(points: List<GeoPoint>): Double {
    if (points.size < 3) return 0.0
    val earthRadius = 6371000.0 // meters
    var area = 0.0

    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]

        val dLon = Math.toRadians(p2.longitude - p1.longitude)
        val lat1 = Math.toRadians(p1.latitude)
        val lat2 = Math.toRadians(p2.latitude)

        area += dLon * (2 + sin(lat1) + sin(lat2))
    }
    
    area = abs(area * earthRadius * earthRadius / 2.0)
    return area / 10000.0 // Convert sqm to hectares
}

fun calculatePerimeterOSM(points: List<GeoPoint>): Double {
    if (points.size < 2) return 0.0
    var perimeter = 0.0
    for (i in 0 until points.size - 1) {
        perimeter += points[i].distanceToAsDouble(points[i+1])
    }
    perimeter += points.last().distanceToAsDouble(points.first())
    return perimeter
}
