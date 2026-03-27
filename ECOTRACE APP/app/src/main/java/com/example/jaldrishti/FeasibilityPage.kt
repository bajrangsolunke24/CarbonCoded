
import android.content.Context
import android.content.Intent
import android.graphics.pdf.PdfDocument
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner

import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.PolygonOptions
import java.io.File
import java.io.FileOutputStream
import java.lang.Math.toRadians
import kotlin.math.abs
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RainwaterFeasibilityScreen(navController: androidx.navigation.NavController) {
    val blue = Color(0xFF1565C0)
    val white = Color.White
    val lightBlueBg = Color(0xFFF5FAFF)
    val gray = Color(0xFF727272)
    val labelStyle = TextStyle(color = blue, fontWeight = FontWeight.Bold)
    val valueStyle = TextStyle(color = Color.Black)
    val buttonShape = RoundedCornerShape(12.dp)

    val stateRainfallMap = mapOf(
        "Andhra Pradesh" to 900f, "Arunachal Pradesh" to 2100f, "Assam" to 2500f, "Bihar" to 1100f,
        "Chhattisgarh" to 1300f, "Goa" to 3000f, "Gujarat" to 800f, "Haryana" to 450f,
        "Himachal Pradesh" to 1250f, "Jharkhand" to 1400f, "Karnataka" to 1250f, "Kerala" to 3000f,
        "Madhya Pradesh" to 1100f, "Maharashtra" to 900f, "Manipur" to 1500f, "Meghalaya" to 2700f,
        "Mizoram" to 2500f, "Nagaland" to 2100f, "Odisha" to 1500f, "Punjab" to 600f, "Rajasthan" to 500f,
        "Sikkim" to 2800f, "Tamil Nadu" to 945f, "Telangana" to 900f, "Tripura" to 2300f,
        "Uttar Pradesh" to 750f, "Uttarakhand" to 1500f, "West Bengal" to 2000f, "Delhi" to 650f
    )
    val statesList = stateRainfallMap.keys.sorted()
    val roofTypes = listOf("Concrete", "Metal", "Tiled", "Thatched")
    val runoffCoefficients = mapOf(
        "Concrete" to 0.9f, "Metal" to 0.8f, "Tiled" to 0.75f, "Thatched" to 0.65f
    )

    var location by remember { mutableStateOf("") }
    var selectedState by remember { mutableStateOf(statesList[7]) }
    var annualRainfall by remember { mutableStateOf(stateRainfallMap[selectedState] ?: 900f) }
    var roofArea by remember { mutableStateOf("") }
    var selectedRoofType by remember { mutableStateOf(roofTypes[0]) }
    var dwellers by remember { mutableStateOf("") }
    var openSpace by remember { mutableStateOf("") }

    var showResult by remember { mutableStateOf(false) }
    var calculatedVolume by remember { mutableStateOf(0f) }
    var pitVolumeLiters by remember { mutableStateOf(0f) }

    // Dropdown states
    var expandedState by remember { mutableStateOf(false) }
    var expandedRoof by remember { mutableStateOf(false) }

    // Google Maps dialog state
    var showGoogleMapDialog by remember { mutableStateOf(false) }
    var polygonPoints by remember { mutableStateOf(listOf<LatLng>()) }

    val context = LocalContext.current

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFFF3F6FC)
    ) {
        Column(
            Modifier.fillMaxSize()
        ) {
            Spacer(Modifier.height(52.dp))
            Text(
                "Rainwater Harvesting Feasibility",
                color = blue,
                fontSize = 27.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp)
            )
            if (!showResult) {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 18.dp, top = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(13.dp),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)
                ) {
                    item {
                        OutlinedTextField(
                            value = location,
                            onValueChange = { location = it },
                            label = { Text("Location (District/City)", color = gray) },
                            leadingIcon = { Icon(Icons.Default.Place, contentDescription = null, tint = blue) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = buttonShape,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = blue, unfocusedBorderColor = gray
                            )
                        )
                    }
                    item {
                        ExposedDropdownMenuBox(
                            expanded = expandedState,
                            onExpandedChange = { expandedState = !expandedState }
                        ) {
                            OutlinedTextField(
                                value = selectedState,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Select State", color = gray) },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expandedState) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = blue, unfocusedBorderColor = gray
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                            ExposedDropdownMenu(
                                expanded = expandedState,
                                onDismissRequest = { expandedState = false }
                            ) {
                                statesList.forEach { stateOption ->
                                    DropdownMenuItem(
                                        text = { Text(stateOption, color = blue) },
                                        onClick = {
                                            selectedState = stateOption
                                            annualRainfall = stateRainfallMap[stateOption] ?: 900f
                                            expandedState = false
                                        }
                                    )
                                }
                            }
                        }
                        Text("Annual Rainfall: $annualRainfall mm", color = blue, fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(start = 6.dp, top = 3.dp))
                    }
                    item {
                        OutlinedTextField(
                            value = roofArea,
                            onValueChange = { roofArea = it },
                            label = { Text("Roof Area (sq.m)", color = gray) },
                            leadingIcon = { Icon(Icons.Default.Home, contentDescription = null, tint = blue) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = buttonShape,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = blue, unfocusedBorderColor = gray
                            )
                        )
                    }
                    item {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(13.dp)
                        ) {
                            Button(
                                onClick = { showGoogleMapDialog = true },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = blue),
                                shape = buttonShape
                            ) {
                                Text("Use Satellite Vision", color = Color.White, fontSize = 14.sp)
                            }
                            Button(
                                onClick = { /* TODO: Launch AR measurement flow here */ },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = blue),
                                shape = buttonShape
                            ) {
                                Text("Use AR Camera", color = Color.White, fontSize = 14.sp)
                            }
                        }
                    }
                    item {
                        ExposedDropdownMenuBox(
                            expanded = expandedRoof,
                            onExpandedChange = { expandedRoof = !expandedRoof }
                        ) {
                            OutlinedTextField(
                                value = selectedRoofType,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Roof Type", color = gray) },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expandedRoof) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = blue, unfocusedBorderColor = gray
                                ),
                                modifier = Modifier.fillMaxWidth().menuAnchor(androidx.compose.material3.MenuAnchorType.PrimaryNotEditable)
                            )
                            ExposedDropdownMenu(
                                expanded = expandedRoof,
                                onDismissRequest = { expandedRoof = false }
                            ) {
                                roofTypes.forEach { roof ->
                                    DropdownMenuItem(
                                        text = { Text(roof, color = blue) },
                                        onClick = {
                                            selectedRoofType = roof
                                            expandedRoof = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = dwellers,
                            onValueChange = { dwellers = it },
                            label = { Text("No. of Dwellers", color = gray) },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = blue) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = buttonShape,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = blue, unfocusedBorderColor = gray
                            )
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = openSpace,
                            onValueChange = { openSpace = it },
                            label = { Text("Available Open Space", color = gray) },
                            leadingIcon = { Icon(Icons.Default.Landscape, contentDescription = null, tint = blue) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = buttonShape,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = blue, unfocusedBorderColor = gray
                            )
                        )
                    }
                    item {
                        Spacer(Modifier.height(10.dp))
                        Button(
                            onClick = {
                                val roofAreaFloat = roofArea.toFloatOrNull() ?: 0f
                                val runoffCoeff = runoffCoefficients[selectedRoofType] ?: 0.75f
                                val rainfallMeters = annualRainfall / 1000f
                                calculatedVolume = roofAreaFloat * rainfallMeters * runoffCoeff
                                pitVolumeLiters = (calculatedVolume * 1.2f * 1000f)
                                showResult = true
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = blue),
                            shape = buttonShape
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = white)
                            Spacer(Modifier.width(7.dp))
                            Text("Calculate Feasibility", color = Color.White, fontSize = 17.sp)
                        }
                    }
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxSize().background(lightBlueBg).padding(horizontal = 14.dp, vertical = 0.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {

                    Spacer(modifier = Modifier.height(1.dp))

                    Card(
                        modifier = Modifier.padding(vertical = 20.dp),
                        shape = RoundedCornerShape(15.dp),
                        elevation = CardDefaults.cardElevation(10.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(18.dp).fillMaxWidth()
                        ) {

                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                "Rainwater Harvesting Feasibility Results",
                                style = labelStyle, fontSize = 18.sp
                            )
                            Spacer(Modifier.height(13.dp))
                            Text("Location:", style = labelStyle)
                            Text(location, style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Roof Area:", style = labelStyle)
                            Text("$roofArea sq.m", style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Roof Type:", style = labelStyle)
                            Text(selectedRoofType, style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Estimated Annual Water Collection:", style = labelStyle)
                            Text("Approx. ${"%.0f".format(calculatedVolume * 1000f)} liters/year", style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Recommended Pit Size:", style = labelStyle)
                            Text("Pit volume approx. ${"%.0f".format(pitVolumeLiters)} liters", style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Suggested Filtration Method:", style = labelStyle)
                            Text("First Flush Diverter and Sand Filter", style = valueStyle)
                            Spacer(Modifier.height(5.dp))
                            Text("Estimated Installation Cost:", style = labelStyle)
                            Text("₹15,000 - ₹20,000 (including pit excavation, piping & filtration)", style = valueStyle)
                            Spacer(Modifier.height(12.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = blue)
                                Spacer(Modifier.width(7.dp))
                                Text(
                                    "Feasibility: Suitable for rainwater harvesting system",
                                    color = blue,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = { /* TODO: VR Preview Functionality */ },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = blue),
                            shape = buttonShape
                        ) { Text("VR Preview", color = Color.White, fontWeight = FontWeight.Bold) }
                        Spacer(Modifier.height(11.dp))
                        Button(
                            onClick = {
                                val pdfFile = createRainwaterReportPdf(
                                    context,
                                    location,
                                    roofArea,
                                    selectedRoofType,
                                    annualRainfall,
                                    calculatedVolume,
                                    pitVolumeLiters
                                )
                                sharePdf(context, pdfFile)
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = blue),
                            shape = buttonShape
                        ) { Text("Detail Report", color = Color.White, fontWeight = FontWeight.Bold) }
                        Spacer(Modifier.height(11.dp))
                        Button(
                            onClick = { showResult = false },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = blue),
                            shape = buttonShape
                        ) { Text("Back to Form", color = Color.White, fontWeight = FontWeight.Bold) }
                        Spacer(Modifier.height(24.dp))
                    }
                }
            }
        }
    }
    // Google Maps Dialog composable
    if (showGoogleMapDialog) {
        PolygonGoogleMapDialog(
            polygonPoints = polygonPoints,
            setPolygonPoints = { polygonPoints = it },
            onAreaSelected = { areaSqMeters ->
                roofArea = "%.1f".format(areaSqMeters)
                showGoogleMapDialog = false
                polygonPoints = listOf()
            },
            onDismiss = {
                showGoogleMapDialog = false
                polygonPoints = listOf()
            }
        )
    }
}


@Composable
fun PolygonGoogleMapDialog(
    polygonPoints: List<LatLng>,
    setPolygonPoints: (List<LatLng>) -> Unit,
    onAreaSelected: (Double) -> Unit,
    onDismiss: () -> Unit
) {
    val mapView = rememberMapViewWithLifecycle()
    var localPolygonPoints by remember { mutableStateOf(polygonPoints) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Mark Roof Corners on Satellite Map") },
        text = {
            Column {
                Box(Modifier.fillMaxWidth().height(320.dp)) {
                    AndroidView(
                        factory = { mapView },
                        update = {
                            mapView.getMapAsync { map ->
                                map.mapType = GoogleMap.MAP_TYPE_SATELLITE
                                map.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(28.6, 77.2), 18f))
                                map.uiSettings.isZoomControlsEnabled = true

                                map.setOnMapClickListener { latLng ->
                                    localPolygonPoints = localPolygonPoints + latLng
                                    setPolygonPoints(localPolygonPoints)

                                    map.clear()
                                    if (localPolygonPoints.size > 2) {
                                        map.addPolygon(
                                            PolygonOptions()
                                                .addAll(localPolygonPoints)
                                                .strokeColor(0xFF1565C0.toInt())
                                                .fillColor(0x441565C0)
                                        )
                                    }
                                    localPolygonPoints.forEach {
                                        map.addMarker(MarkerOptions().position(it))
                                    }
                                }
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text("Points Selected: ${localPolygonPoints.size}\nTap roof corners to add. Minimum 3 points required.")
            }
        },
        confirmButton = {
            TextButton(
                enabled = polygonPoints.size > 2,
                onClick = {
                    val area = computePolygonAreaManual(polygonPoints)
                    onAreaSelected(area)
                }
            ) {
                Text("Use Area")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// Calculate polygon area on Earth's surface (in square meters) manually using spherical excess formula
fun computePolygonAreaManual(points: List<LatLng>): Double {
    if (points.size < 3) return 0.0
    val radius = 6371009.0 // Earth radius in meters
    var area = 0.0
    val size = points.size
    for (i in 0 until size) {
        val p1 = points[i]
        val p2 = points[(i + 1) % size]
        area += toRadians(p2.longitude - p1.longitude) * (2 + sin(toRadians(p1.latitude)) + sin(toRadians(p2.latitude)))
    }
    area = area * radius * radius / 2.0
    return abs(area)
}

@Composable
fun rememberMapViewWithLifecycle(): MapView {
    val context = LocalContext.current
    val mapView = remember { MapView(context) }
    val lifecycle = LocalLifecycleOwner.current.lifecycle

    DisposableEffect(lifecycle, mapView) {
        val observer = object : DefaultLifecycleObserver {
            override fun onCreate(owner: LifecycleOwner) = mapView.onCreate(null)
            override fun onStart(owner: LifecycleOwner) = mapView.onStart()
            override fun onResume(owner: LifecycleOwner) = mapView.onResume()
            override fun onPause(owner: LifecycleOwner) = mapView.onPause()
            override fun onStop(owner: LifecycleOwner) = mapView.onStop()
            override fun onDestroy(owner: LifecycleOwner) = mapView.onDestroy()
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer) }
    }
    return mapView
}

// Helper function to create PDF report
fun createRainwaterReportPdf(
    context: Context,
    location: String,
    roofArea: String,
    roofType: String,
    annualRainfall: Float,
    calculatedVolume: Float,
    pitVolumeLiters: Float
): File {
    val pdfDocument = PdfDocument()
    val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
    val page = pdfDocument.startPage(pageInfo)
    val canvas = page.canvas
    val paint = android.graphics.Paint()
    paint.textSize = 14f

    var yPosition = 50
    val lineHeight = 23

    val reportLines = listOf(
        "Rainwater Harvesting Feasibility Report",
        "",
        "Location: $location",
        "Roof Area: $roofArea sq.m",
        "Roof Type: $roofType",
        "Annual Rainfall: $annualRainfall mm",
        "Estimated Annual Water Collection: Approx. ${"%.0f".format(calculatedVolume * 1000f)} liters/year",
        "Recommended Pit Size: Pit volume approx. ${"%.0f".format(pitVolumeLiters)} liters",
        "Suggested Filtration Method: First Flush Diverter and Sand Filter",
        "Estimated Installation Cost: ₹15,000 - ₹20,000",
        "Feasibility: Suitable for rainwater harvesting system"
    )
    for (line in reportLines) {
        canvas.drawText(line, 42f, yPosition.toFloat(), paint)
        yPosition += lineHeight
    }
    pdfDocument.finishPage(page)

    val file = File(context.cacheDir, "Rainwater_Report.pdf")
    FileOutputStream(file).use { outputStream ->
        pdfDocument.writeTo(outputStream)
    }
    pdfDocument.close()
    return file
}

// Helper function to share PDF via intent using FileProvider
fun sharePdf(context: Context, file: File) {
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(shareIntent, "Share Rainwater Report"))
}


