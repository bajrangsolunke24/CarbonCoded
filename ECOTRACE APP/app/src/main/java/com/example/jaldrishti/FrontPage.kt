//package com.example.jaldrishti
//
//import androidx.compose.foundation.BorderStroke
//import androidx.compose.foundation.background
//import androidx.compose.foundation.layout.*
//import androidx.compose.foundation.shape.CircleShape
//import androidx.compose.foundation.shape.RoundedCornerShape
//import androidx.compose.material.icons.Icons
//import androidx.compose.material.icons.filled.AccountCircle
//import androidx.compose.material.icons.filled.Language
//import androidx.compose.material.icons.filled.WaterDrop
//import androidx.compose.material.icons.filled.Home
//import androidx.compose.material.icons.filled.Star
//import androidx.compose.material.icons.filled.CloudQueue
//import androidx.compose.material.icons.filled.Info
//import androidx.compose.material.icons.filled.Build
//import androidx.compose.material.icons.filled.Eco
//import androidx.compose.material3.*
//import androidx.compose.runtime.Composable
//import androidx.compose.ui.Alignment
//import androidx.compose.ui.Modifier
//import androidx.compose.ui.graphics.Color
//import androidx.compose.ui.text.font.FontWeight
//import androidx.compose.ui.text.style.TextAlign
//import androidx.compose.ui.unit.dp
//import androidx.compose.ui.unit.sp
//
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiFrontPage() {
//    val blue = Color(0xFF1565C0)
//    val white = Color.White
//    val gridIcons = listOf(
//        Icons.Default.WaterDrop,
//        Icons.Default.CloudQueue,
//        Icons.Default.AccountCircle,
//        Icons.Default.Eco,
//        Icons.Default.Home,
//        Icons.Default.Star,
//        Icons.Default.Build,
//        Icons.Default.Info
//    )
//    val gridLabels = listOf(
//        "Harvest",
//        "Rain",
//        "Profile",
//        "Eco",
//        "Home",
//        "Rewards",
//        "Setup",
//        "Info"
//    )
//
//    Scaffold(
//        topBar = {
//            TopAppBar(
//                title = {
//                    Row(
//                        modifier = Modifier.fillMaxWidth(),
//                        verticalAlignment = Alignment.CenterVertically,
//                        horizontalArrangement = Arrangement.Center
//                    ) {
//                        Text("JalDrishti", color = white, fontWeight = FontWeight.ExtraBold, fontSize = 22.sp)
//                    }
//                },
//                colors = TopAppBarDefaults.topAppBarColors(containerColor = blue),
//                actions = {
//                    IconButton(onClick = { /* Language Action */ }) {
//                        Icon(Icons.Default.Language, contentDescription = "Language", tint = white)
//                    }
//                }
//            )
//        },
//        containerColor = white
//    ) { padding ->
//        Column(
//            modifier = Modifier
//                .fillMaxSize()
//                .background(white)
//                .padding(padding)
//                .padding(horizontal = 12.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Spacer(Modifier.height(38.dp))
//            Text(
//                "\"CARE BEFORE IT BECOMES RARE\"",
//                color = blue,
//                fontWeight = FontWeight.Bold,
//                fontSize = 17.sp,
//                textAlign = TextAlign.Center
//            )
//            Spacer(Modifier.height(38.dp))
//            // 2x4 Feature grid
//            for (row in 0..1) {
//                Row(
//                    Modifier.fillMaxWidth(),
//                    horizontalArrangement = Arrangement.SpaceBetween
//                ) {
//                    for (col in 0..3) {
//                        val idx = row * 4 + col
//                        if (idx < gridIcons.size) {
//                            Column(
//                                horizontalAlignment = Alignment.CenterHorizontally,
//                                modifier = Modifier.weight(1f)
//                            ) {
//                                Surface(
//                                    modifier = Modifier
//                                        .size(58.dp),
//                                    shape = CircleShape,
//                                    color = blue.copy(alpha = 0.10f)
//                                ) {
//                                    Icon(
//                                        gridIcons[idx],
//                                        contentDescription = gridLabels[idx],
//                                        tint = blue,
//                                        modifier = Modifier.padding(12.dp).fillMaxSize()
//                                    )
//                                }
//                                Spacer(Modifier.height(4.dp))
//                                Text(
//                                    gridLabels[idx],
//                                    fontSize = 12.sp,
//                                    color = Color.Black,
//                                    fontWeight = FontWeight.Medium,
//                                    textAlign = TextAlign.Center
//                                )
//                            }
//                        }
//                    }
//                }
//                Spacer(Modifier.height(7.dp))
//            }
//            Spacer(Modifier.height(28.dp))
//
//            Text(
//                "Save water, Recharge groundwater.\nStart with your roof.",
//                color = Color.Black,
//                fontWeight = FontWeight.Medium,
//                fontSize = 15.sp,
//                textAlign = TextAlign.Center
//            )
//            Spacer(Modifier.height(60.dp))
//
//            // Sign up and Login buttons
//            Button(
//                onClick = { /* Sign up action */ },
//                colors = ButtonDefaults.buttonColors(containerColor = blue),
//                shape = RoundedCornerShape(12.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(50.dp)
//            ) {
//                Text("Sign up", color = white, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//            }
//            Spacer(Modifier.height(14.dp))
//            OutlinedButton(
//                onClick = { /* Login action */ },
//                border = BorderStroke(1.5.dp, blue),
//                shape = RoundedCornerShape(12.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(50.dp)
//            ) {
//                Text("Login", color = blue, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//            }
//        }
//    }
//}
//package com.example.jaldrishti
//
//import androidx.compose.foundation.BorderStroke
//import androidx.compose.foundation.Image
//import androidx.compose.foundation.background
//import androidx.compose.foundation.layout.*
//import androidx.compose.foundation.shape.RoundedCornerShape
//import androidx.compose.material.icons.Icons
//import androidx.compose.material.icons.filled.Language
//import androidx.compose.material3.*
//import androidx.compose.runtime.Composable
//import androidx.compose.ui.Alignment
//import androidx.compose.ui.Modifier
//import androidx.compose.ui.graphics.Brush
//import androidx.compose.ui.graphics.Color
//import androidx.compose.ui.layout.ContentScale
//import androidx.compose.ui.res.painterResource
//import androidx.compose.ui.text.font.FontStyle
//import androidx.compose.ui.text.font.FontWeight
//import androidx.compose.ui.text.style.TextAlign
//import androidx.compose.ui.unit.dp
//import androidx.compose.ui.unit.sp
//
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiSplashPage() {
//    val blue = Color(0xFF1565C0)
//    val overlay = Brush.verticalGradient(listOf(Color.Black.copy(alpha = 0.75f), Color.Transparent, Color.Black.copy(alpha = 0.8f)))
//
//    Box(modifier = Modifier
//        .fillMaxSize()) {
//        // Background image
//        Image(
//            painter = painterResource(R.drawable.bg_rainwater), // Replace with your rain image resource
//            contentDescription = "Rainwater Harvesting",
//            contentScale = ContentScale.Crop,
//            modifier = Modifier.fillMaxSize()
//        )
//        // Overlay for readability
//        Box(
//            modifier = Modifier
//                .fillMaxSize()
//                .background(overlay)
//        )
//
//        // Foreground content
//        Column(
//            modifier = Modifier
//                .fillMaxSize()
//                .padding(horizontal = 32.dp),
//            horizontalAlignment = Alignment.CenterHorizontally,
//            verticalArrangement = Arrangement.SpaceBetween
//        ) {
//            Row(
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .padding(top = 24.dp),
//                horizontalArrangement = Arrangement.End
//            ) {
//                IconButton(onClick = { /* Language Picker */ }) {
//                    Icon(Icons.Default.Language, contentDescription = "Language", tint = Color.White)
//                }
//            }
//
//            Column(
//                modifier = Modifier.fillMaxWidth(),
//                horizontalAlignment = Alignment.CenterHorizontally
//            ) {
//                Text(
//                    "JalDrishti",
//                    color = Color.White,
//                    fontWeight = FontWeight.ExtraBold,
//                    fontSize = 36.sp,
//                    letterSpacing = 2.sp
//                )
//                Spacer(modifier = Modifier.height(14.dp))
//                Text(
//                    "Care before it becomes rare",
//                    color = Color(0xFF90CAF9),
//                    fontWeight = FontWeight.SemiBold,
//                    fontSize = 15.sp,
//                    textAlign = TextAlign.Center
//                )
//                Spacer(modifier = Modifier.height(24.dp))
//                Text(
//                    "Save water, Recharge groundwater.\nStart with your roof.",
//                    color = Color.White,
//                    fontWeight = FontWeight.Medium,
//                    fontSize = 16.sp,
//                    textAlign = TextAlign.Center
//                )
//            }
//
//            Column(
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .padding(bottom = 36.dp),
//                horizontalAlignment = Alignment.CenterHorizontally
//            ) {
//                Button(
//                    onClick = { /* Sign up */ },
//                    colors = ButtonDefaults.buttonColors(containerColor = blue),
//                    shape = RoundedCornerShape(14.dp),
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .height(50.dp)
//                ) {
//                    Text("Sign up", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//                }
//                Spacer(modifier = Modifier.height(10.dp))
//                OutlinedButton(
//                    onClick = { /* Login */ },
//                    border = BorderStroke(2.dp, blue),
//                    shape = RoundedCornerShape(14.dp),
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .height(50.dp)
//                ) {
//                    Text("Login", color = blue, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//                }
//            }
//        }
//    }
//}
//
//package com.example.jaldrishti
//
//import androidx.compose.foundation.BorderStroke
//import androidx.compose.foundation.Image
//import androidx.compose.foundation.background
//import androidx.compose.foundation.layout.*
//import androidx.compose.foundation.shape.RoundedCornerShape
//import androidx.compose.material.icons.Icons
//import androidx.compose.material.icons.filled.Language
//import androidx.compose.material3.*
//import androidx.compose.runtime.Composable
//import androidx.compose.ui.Alignment
//import androidx.compose.ui.Modifier
//import androidx.compose.ui.graphics.Brush
//import androidx.compose.ui.graphics.Color
//import androidx.compose.ui.graphics.Shadow
//import androidx.compose.ui.layout.ContentScale
//import androidx.compose.ui.res.painterResource
//import androidx.compose.ui.text.TextStyle
//import androidx.compose.ui.text.font.FontStyle
//import androidx.compose.ui.text.font.FontWeight
//import androidx.compose.ui.text.style.TextAlign
//import androidx.compose.ui.unit.TextUnit
//import androidx.compose.ui.unit.dp
//import androidx.compose.ui.unit.sp
//
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiSplashPage() {
//    val blue = Color(0xFF1565C0)
//    val accent = Color(0xFF4FC3F7) // accent blue for styling
//
//    val overlay = Brush.verticalGradient(
//        listOf(Color.Black.copy(alpha = 0.82f), Color.Transparent, Color.Black.copy(alpha = 0.82f))
//    )
//
//    Box(
//        modifier = Modifier
//            .fillMaxSize()
//    ) {
//        // Background image
//        Image(
//            painter = painterResource(R.drawable.bg_rainwater), // <-- use your asset here
//            contentDescription = "Rainwater Harvesting",
//            contentScale = ContentScale.Crop,
//            modifier = Modifier.fillMaxSize()
//        )
//
//        // Overlay for readability
//        Box(
//            modifier = Modifier
//                .fillMaxSize()
//                .background(overlay)
//        )
//
//        // Foreground content
//        Box(
//            modifier = Modifier
//                .fillMaxSize()
//                .padding(horizontal = 28.dp),
//        ) {
//            // Language button top right
//            IconButton(
//                onClick = { /* Language Picker */ },
//                modifier = Modifier.align(Alignment.TopEnd).padding(top = 22.dp)
//            ) {
//                Icon(Icons.Default.Language, contentDescription = "Language", tint = Color.White)
//            }
//
//            // Main content
//            Column(
//                modifier = Modifier
//                    .align(Alignment.Center)
//                    .fillMaxWidth(),
//                horizontalAlignment = Alignment.CenterHorizontally,
//            ) {
//                // App branding, stylized
//                Row(
//                    verticalAlignment = Alignment.CenterVertically,
//                    horizontalArrangement = Arrangement.Center,
//                    modifier = Modifier.fillMaxWidth()
//                ) {
//                    Text(
//                        "JAL",
//                        fontWeight = FontWeight.ExtraBold,
//                        fontSize = 42.sp,
//                        color = Color.White,
//                        letterSpacing = 2.sp,
//                        style = TextStyle(
//                            shadow = Shadow(Color.Black, blurRadius = 7f)
//                        )
//                    )
//                    Spacer(Modifier.width(7.dp))
//                    Text(
//                        "DRISHTI",
//                        fontWeight = FontWeight.ExtraBold,
//                        fontSize = 42.sp,
//                        color = blue,
//                        letterSpacing = 2.sp,
//                        style = TextStyle(
//                            shadow = Shadow(Color.Black, blurRadius = 7f)
//                        )
//                    )
//                }
//                Spacer(modifier = Modifier.height(8.dp))
//                Text(
//                    "Care before it becomes rare",
//                    color = accent,
//                    fontWeight = FontWeight.W600,
//                    fontSize = 17.sp,
//                    fontStyle = FontStyle.Italic,
//                    letterSpacing = 1.sp,
//                    textAlign = TextAlign.Center
//                )
//                Spacer(modifier = Modifier.height(8.dp))
//                Row(verticalAlignment = Alignment.CenterVertically) {
//                    // Accent arrows like branding
//                    Icon(
//                        painter = painterResource(R.drawable.baseline_home_24), // Use right chevron/double arrow asset
//                        contentDescription = null,
//                        tint = accent,
//                        modifier = Modifier.size(28.dp)
//                    )
//                    Icon(
//                        painter = painterResource(R.drawable.bg_rainwater),
//                        contentDescription = null,
//                        tint = accent,
//                        modifier = Modifier.size(28.dp)
//                    )
//                }
//                Spacer(modifier = Modifier.height(28.dp))
//                Text(
//                    "Save water, Recharge groundwater.\nStart with your roof.",
//                    color = Color.White,
//                    fontWeight = FontWeight.Medium,
//                    fontSize = 15.5.sp,
//                    textAlign = TextAlign.Center,
//                    style = TextStyle(
//                        shadow = Shadow(Color.Black, blurRadius = 4f)
//                    )
//                )
//            }
//
//            // CTA buttons at bottom
//            Column(
//                modifier = Modifier
//                    .align(Alignment.BottomCenter)
//                    .fillMaxWidth()
//                    .padding(bottom = 36.dp),
//                horizontalAlignment = Alignment.CenterHorizontally
//            ) {
//                Button(
//                    onClick = { /* Sign up */ },
//                    colors = ButtonDefaults.buttonColors(containerColor = blue),
//                    shape = RoundedCornerShape(16.dp),
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .height(54.dp)
//                ) {
//                    Text("Sign up", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
//                }
//                Spacer(modifier = Modifier.height(12.dp))
//                OutlinedButton(
//                    onClick = { /* Login */ },
//                    border = BorderStroke(2.dp, blue),
//                    shape = RoundedCornerShape(16.dp),
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .height(54.dp)
//                ) {
//                    Text("Login", color = blue, fontWeight = FontWeight.Bold, fontSize = 18.sp)
//                }
//            }
//        }
//    }
//}
//package com.example.jaldrishti

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background


import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiSketchSplash() {
//    val blue = Color(0xFF1565C0)
//    val accent = Color(0xFF4FC3F7)
//    // Background photo asset
//    val backgroundImageRes = R.drawable.bg_rainwater // use your image resource here
//
//    Box(
//        modifier = Modifier
//            .fillMaxSize()
//    ) {
//        Image(
//            painter = painterResource(backgroundImageRes),
//            contentDescription = "Background",
//            modifier = Modifier.fillMaxSize(),
//            contentScale = ContentScale.Crop
//        )
//        // Semi-transparent overlay for readability
//        Box(
//            Modifier
//                .fillMaxSize()
//                .background(
//                    Brush.verticalGradient(
//                        listOf(Color(0xCC09131F), Color.Transparent, Color(0xCC09131F))
//                    )
//                )
//        )
//
//        // LOGO (top left) and Language (top right)
//        Row(
//            Modifier
//                .fillMaxWidth()
//                .padding(top = 20.dp, start = 16.dp, end = 16.dp),
//            horizontalArrangement = Arrangement.SpaceBetween,
//            verticalAlignment = Alignment.Top
//        ) {
//            Surface(
//                shape = CircleShape,
//                color = blue.copy(alpha = 0.13f),
//                modifier = Modifier.size(38.dp)
//            ) {
//                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
//                    Text("Logo", color = blue, fontWeight = FontWeight.Bold, fontSize = 13.sp)
//                }
//            }
//            IconButton(onClick = { /* Language picker */ }) {
//                Icon(Icons.Default.Language, contentDescription = "Language", tint = Color.White)
//            }
//        }
//
//        // Center Section with title and tagline
//        Column(
//            Modifier
//                .fillMaxSize()
//                .padding(horizontal = 32.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Spacer(Modifier.height(90.dp))
//            Text(
//                "Jal Drishti",
//                modifier = Modifier.fillMaxWidth(),
//                color = blue,
//                fontWeight = FontWeight.ExtraBold,
//                fontSize = 30.sp,
//                textAlign = TextAlign.Center
//            )
//            Spacer(Modifier.height(6.dp))
//            Text(
//                "care before it becomes rare",
//                modifier = Modifier.fillMaxWidth(),
//                color = accent,
//                fontWeight = FontWeight.Medium,
//                fontSize = 15.sp,
//                fontStyle = FontStyle.Italic,
//                textAlign = TextAlign.Center
//            )
//            Spacer(Modifier.height(54.dp))
//            Text(
//                "Save water, Recharge gw.\nstart with your roof",
//                modifier = Modifier.fillMaxWidth(),
//                color = Color.White,
//                fontWeight = FontWeight.Medium,
//                fontSize = 17.sp,
//                textAlign = TextAlign.Center
//            )
//        }
//
//        // Signup/Login buttons fixed near the bottom
//        Column(
//            Modifier
//                .fillMaxWidth()
//                .align(Alignment.BottomCenter)
//                .padding(bottom = 38.dp, start = 28.dp, end = 28.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Button(
//                onClick = { /* Signup */ },
//                colors = ButtonDefaults.buttonColors(containerColor = blue),
//                shape = RoundedCornerShape(14.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(48.dp)
//            ) {
//                Text("Signup", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//            }
//            Spacer(Modifier.height(13.dp))
//            OutlinedButton(
//                onClick = { /* Login */ },
//                border = BorderStroke(1.7.dp, blue),
//                shape = RoundedCornerShape(14.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(48.dp)
//            ) {
//                Text("Login", color = blue, fontWeight = FontWeight.Bold, fontSize = 17.sp)
//            }
//        }
//    }
//}
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiSketchSplash() {
//    val blue = Color(0xFF1565C0)
//    val accent = Color(0xFF4FC3F7)
//    val backgroundImageRes = R.drawable.bg_rainwater
//
//    Box(
//        modifier = Modifier
//            .fillMaxSize()
//    ) {
//        Image(
//            painter = painterResource(backgroundImageRes),
//            contentDescription = "Background",
//            modifier = Modifier.fillMaxSize(),
//            contentScale = ContentScale.Crop
//        )
//        Box(
//            Modifier
//                .fillMaxSize()
//                .background(
//                    Brush.verticalGradient(
//                        listOf(Color(0xCC09131F), Color.Transparent, Color(0xCC09131F))
//                    )
//                )
//        )
//
//        Row(
//            Modifier
//                .fillMaxWidth()
//                .padding(top = 20.dp, start = 16.dp, end = 16.dp),
//            horizontalArrangement = Arrangement.SpaceBetween,
//            verticalAlignment = Alignment.Top
//        ) {
//            Surface(
//                shape = CircleShape,
//                color = blue.copy(alpha = 0.13f),
//                modifier = Modifier.size(44.dp)
//            ) {
//                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
//                    Text(
//                        "Logo",
//                        color = blue,
//                        fontWeight = FontWeight.ExtraBold,
//                        fontSize = 16.sp,
//                        letterSpacing = 1.5.sp
//                    )
//                }
//            }
//            IconButton(onClick = { /* Language picker */ }) {
//                Icon(Icons.Default.Language, contentDescription = "Language", tint = Color.White)
//            }
//        }
//
//        Column(
//            Modifier
//                .fillMaxSize()
//                .padding(horizontal = 32.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Spacer(Modifier.height(110.dp))
//            Text(
//                "Jal Drishti",
//                modifier = Modifier.fillMaxWidth(),
//                color = blue,
//                fontWeight = FontWeight.Black,
//                fontSize = 42.sp,
//                letterSpacing = 2.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 48.sp,
//            )
//            Spacer(Modifier.height(10.dp))
//            Text(
//                "Care before it becomes rare",
//                modifier = Modifier.fillMaxWidth(),
//                color = accent,
//                fontWeight = FontWeight.SemiBold,
//                fontSize = 20.sp,
//                fontStyle = FontStyle.Italic,
//                letterSpacing = 1.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 24.sp
//            )
//            Spacer(Modifier.height(70.dp))
//            Text(
//                "Save water, Recharge groundwater.\nStart with your roof.",
//                modifier = Modifier.fillMaxWidth(),
//                color = Color.White,
//                fontWeight = FontWeight.Medium,
//                fontSize = 19.sp,
//                letterSpacing = 0.5.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 24.sp
//            )
//        }
//
//        Column(
//            Modifier
//                .fillMaxWidth()
//                .align(Alignment.BottomCenter)
//                .padding(bottom = 38.dp, start = 28.dp, end = 28.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Button(
//                onClick = { /* Signup */ },
//                colors = ButtonDefaults.buttonColors(containerColor = blue),
//                shape = RoundedCornerShape(18.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(52.dp)
//            ) {
//                Text(
//                    "Signup",
//                    color = Color.White,
//                    fontWeight = FontWeight.Bold,
//                    fontSize = 18.sp,
//                    letterSpacing = 1.sp
//                )
//            }
//            Spacer(Modifier.height(14.dp))
//            OutlinedButton(
//                onClick = { /* Login */ },
//                border = BorderStroke(2.dp, blue),
//                shape = RoundedCornerShape(18.dp),
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .height(52.dp)
//            ) {
//                Text(
//                    "Login",
//                    color = blue,
//                    fontWeight = FontWeight.Bold,
//                    fontSize = 18.sp,
//                    letterSpacing = 1.sp
//                )
//            }
//        }
//    }
//}


//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun JalDrishtiSketchSplash(navController: NavController) {
//    val blue = Color(0xFF1565C0)
//    val accent = Color(0xFF4FC3F7)
//    val backgroundImageRes = R.drawable.bg_rainwater
//
//    Box(
//        modifier = Modifier.fillMaxSize()
//    ) {
//        Image(
//            painter = painterResource(backgroundImageRes),
//            contentDescription = "Background",
//            modifier = Modifier.fillMaxSize(),
//            contentScale = ContentScale.Crop
//        )
//        Box(
//            Modifier.fillMaxSize().background(
//                Brush.verticalGradient(
//                    listOf(Color(0xCC09131F), Color.Transparent, Color(0xCC09131F))
//                )
//            )
//        )
//
//        // Top row: logo and language
//        Row(
//            Modifier.fillMaxWidth().padding(top = 20.dp, start = 16.dp, end = 16.dp),
//            horizontalArrangement = Arrangement.SpaceBetween,
//            verticalAlignment = Alignment.Top
//        ) {
//            Surface(
//                shape = CircleShape,
//                color = blue.copy(alpha = 0.13f),
//                modifier = Modifier.size(44.dp)
//            ) {
//                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
//                    Text(
//                        "Logo",
//                        color = blue,
//                        fontWeight = FontWeight.ExtraBold,
//                        fontSize = 16.sp,
//                        letterSpacing = 1.5.sp
//                    )
//                }
//            }
//            IconButton(onClick = { /* Language picker */ }) {
//                Icon(Icons.Default.Language, contentDescription = "Language", tint = Color.White)
//            }
//        }
//
//        // Center column: title, tagline, and main text
//        Column(
//            Modifier.fillMaxSize().padding(horizontal = 32.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Spacer(Modifier.height(110.dp))
//            Text(
//                "Jal Drishti",
//                modifier = Modifier.fillMaxWidth(),
//                color = blue,
//                fontWeight = FontWeight.Black,
//                fontSize = 42.sp,
//                letterSpacing = 2.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 48.sp,
//            )
//            Spacer(Modifier.height(10.dp))
//            Text(
//                "Care before it becomes rare",
//                modifier = Modifier.fillMaxWidth(),
//                color = accent,
//                fontWeight = FontWeight.SemiBold,
//                fontSize = 20.sp,
//                fontStyle = FontStyle.Italic,
//                letterSpacing = 1.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 24.sp,
//            )
//            Spacer(Modifier.height(70.dp))
//            Text(
//                "Save Water. Recharge Groundwater.\nBegin with Your Roof.",
//                modifier = Modifier.fillMaxWidth(),
//                color = Color.White,
//                fontWeight = FontWeight.SemiBold,
//                fontSize = 20.sp,
//                letterSpacing = 1.sp,
//                textAlign = TextAlign.Center,
//                lineHeight = 26.sp,
//                style = TextStyle(
//                    shadow = Shadow(
//                        color = Color.Black.copy(alpha = 0.6f),
//                        offset = Offset(2f, 2f),
//                        blurRadius = 4f
//                    )
//                )
//            )
//        }
//
//        // Bottom buttons: Signup and Login
//        Column(
//            Modifier.fillMaxWidth()
//                .align(Alignment.BottomCenter)
//                .padding(bottom = 38.dp, start = 28.dp, end = 28.dp),
//            horizontalAlignment = Alignment.CenterHorizontally
//        ) {
//            Button(
//                onClick = {navController.navigate("SignUpPage") },
//                colors = ButtonDefaults.buttonColors(containerColor = blue),
//                shape = RoundedCornerShape(18.dp),
//                modifier = Modifier.fillMaxWidth().height(52.dp)
//            ) {
//                Text(
//                    "Signup",
//                    color = Color.White,
//                    fontWeight = FontWeight.Bold,
//                    fontSize = 18.sp,
//                    letterSpacing = 1.sp
//                )
//            }
//            Spacer(Modifier.height(14.dp))
//            OutlinedButton(
//                onClick = { navController.navigate("LoginScreenPage")},
//                border = BorderStroke(2.dp, blue),
//                shape = RoundedCornerShape(18.dp),
//                modifier = Modifier.fillMaxWidth().height(52.dp)
//            ) {
//                Text(
//                    "Login",
//                    color = blue,
//                    fontWeight = FontWeight.Bold,
//                    fontSize = 18.sp,
//                    letterSpacing = 1.sp
//                )
//            }
//        }
//    }
//}

import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape

import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.draw.clip

//@Composable
//fun JalDrishtiCoverPage() {
//    val backgroundBlue = Color(0xFF1565C0)
//    val white = Color.White
//
//    Scaffold(
//        modifier = Modifier.fillMaxSize(),
//        containerColor = backgroundBlue
//    ) { padding ->
//        Box(
//            modifier = Modifier
//                .fillMaxSize()
//                .background(backgroundBlue)
//                .padding(padding)
//        ) {
//            Column(
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .align(Alignment.TopCenter)
//                    .padding(vertical = 48.dp, horizontal = 24.dp),
//                horizontalAlignment = Alignment.CenterHorizontally
//            ) {
//                Icon(
//                    imageVector = Icons.Default.Language,
//                    contentDescription = "Select Language",
//                    tint = white,
//                    modifier = Modifier.align(Alignment.End)
//                )
//                Spacer(modifier = Modifier.height(24.dp))
//                Text(
//                    text = "Jal Drishti",
//                    color = white,
//                    style = MaterialTheme.typography.headlineLarge,
//                    modifier = Modifier.align(Alignment.CenterHorizontally)
//                )
//                Text(
//                    text = "Care Before it Becomes Rare",
//                    color = white.copy(alpha = 0.85f),
//                    style = MaterialTheme.typography.titleMedium,
//                    modifier = Modifier.align(Alignment.CenterHorizontally)
//                )
//                Spacer(modifier = Modifier.height(32.dp))
//                Card(
//                    modifier = Modifier.size(100.dp),
//                    colors = CardDefaults.cardColors(containerColor = white),
//                    shape = RoundedCornerShape(20.dp),
//                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
//                ) {
//                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
////                        Icon(
////                            painter = painterResource(id = R.style.), // Replace with your icon resource
////                            contentDescription = "Water Conservation",
////                            tint = backgroundBlue,
////                            modifier = Modifier.size(60.dp)
////                        )
//                    }
//                }
//                Spacer(modifier = Modifier.height(24.dp))
//                Text(
//                    text = "Save Water, Recharge Groundwater,\nStart with your roof",
//                    color = backgroundBlue,
//                    style = MaterialTheme.typography.bodyLarge,
//                    textAlign = TextAlign.Center,
//                    modifier = Modifier.padding(vertical = 12.dp)
//                )
//                Spacer(modifier = Modifier.height(36.dp))
//                Button(
//                    onClick = { /* TODO: Navigate to registration/login */ },
//                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3)),
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .height(56.dp),
//                    shape = RoundedCornerShape(16.dp)
//                ) {
//                    Text("Get Started ->", color = white, style = MaterialTheme.typography.titleMedium)
//                }
//            }
//        }
//    }
//}
