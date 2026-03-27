package com.example.jaldrishti



import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController


@Composable
fun JalDrishtiProfessionalCover(navController: NavController) {
    val blue = Color(0xFF1565C0)
    val white = Color.White

    Box(modifier = Modifier.fillMaxSize().background(white)) {
        // Diagonal blue background
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            val pathBlue = Path().apply {
                moveTo(0f, 0f)
                lineTo(w, 0f)
                lineTo(w, h * 0.44f)
                lineTo(0f, h * 0.7f)
                close()
            }
            drawPath(pathBlue, blue, style = Fill)
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp , vertical = 30.dp)
                .padding(top = 12.dp, bottom = 18.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top-right globe
            Row(Modifier.fillMaxWidth(), Arrangement.End) {
                Icon(
                    imageVector = Icons.Default.Language,
                    contentDescription = "Language",
                    tint = white,
                    modifier = Modifier.size(26.dp)
                )
            }
            Spacer(Modifier.height(102.dp))

            // Title
            Text(
                "ECOTRACE",
                color = white,
                fontSize = 62.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp,
                modifier = Modifier
                    .padding(top = 7.dp)
                    .fillMaxWidth(),
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(22.dp))
            Text(
                "Track Your Carbon Impact",
                color = white.copy(alpha = 0.95f),
                fontWeight = FontWeight.SemiBold,
                fontSize = 17.sp,
                letterSpacing = 0.6.sp,
                modifier = Modifier
                    .fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(108.dp))

            // Centered Image in Card
            Card(
                modifier = Modifier
                    .size(115.dp)
                    .align(Alignment.CenterHorizontally),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(white),
                elevation = CardDefaults.cardElevation(8.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.firstpage),
                    contentDescription = "Rainwater drop",
                    modifier = Modifier
                        .size(154.dp)
                        .align(Alignment.CenterHorizontally)
                        .padding(8.dp)
                )
            }
            Spacer(Modifier.height(64.dp))

            // Tagline
            Text(
                "Green Carbon & Blue Carbon\nTracking for a Sustainable Future",
                color = Color(0xFF1B2631),
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                letterSpacing = 0.2.sp,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.weight(1f))

            // Button
            Button(
                onClick = {navController.navigate("CarbonSelection") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .align(Alignment.CenterHorizontally),
                colors = ButtonDefaults.buttonColors(containerColor = blue),
                shape = RoundedCornerShape(12.dp),
                elevation = ButtonDefaults.buttonElevation(6.dp)
            ) {
                Text(
                    text = "Get Started ->",
                    color = white,
                    fontWeight = FontWeight.Bold,
                    fontSize = 19.sp
                )
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
