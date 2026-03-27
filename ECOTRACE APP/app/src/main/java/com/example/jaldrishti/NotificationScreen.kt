package com.example.jaldrishti

import android.R
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.res.colorResource

data class NotificationItem(
    val icon: ImageVector,
    val iconTint: Color,
    val title: String,
    val tag: String,
    val message: String,
    val details: String,
    val time: String,
    val buttonText: String,
    val buttonColor: Color,
    val textColor: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationScreen() {
    val white = Color.White
    val blue = Color(0xFF1565C0)
    val urgentRed = Color(0xFFD32F2F)
    val maintenanceColor = Color(0xFF0288D1)

    val notifications = listOf(
        NotificationItem(
            icon = Icons.Default.Warning,
            iconTint = urgentRed,
            title = "First Flush Required",
            tag = "Urgent",
            message = "Heavy rainfall detected. Divert the first 2mm of rainwater to prevent contamination of your tank.",
            details = "",
            time = "2 min ago",
            buttonText = "Mark as Done",
            buttonColor = urgentRed,
            textColor = colorResource(R.color.black)
        ),
        NotificationItem(
            icon = Icons.Default.Build,
            iconTint = maintenanceColor,
            title = "Filter Maintenance Due",
            tag = "Maintenance",
            message = "Your sediment filter needs cleaning. Last cleaned 6 months ago.",
            details = "",
            time = "1 hour ago",
            buttonText = "Schedule Maintenance",
            buttonColor = maintenanceColor,
            textColor = colorResource(R.color.black)
        ),
        NotificationItem(
            icon = Icons.Default.Warning,
            iconTint = urgentRed,
            title = "Gutter Cleaning Alert",
            tag = "Urgent",
            message = "Waste detected in gutters. Clean to ensure optimal water collection.",
            details = "Gutter Cleaning Alert (Urgent)\nWaste detected in gutters. Clean to ensure optimal water collection.",
            time = "",
            buttonText = "Mark as Cleaned",
            buttonColor = urgentRed,
            textColor =  colorResource(R.color.black)
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifications Icon",
                            tint = blue,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("System Notifications", color = blue, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = white),
                actions = {
                    IconButton(onClick = { /* Mark all as read */ }) {
                        Icon(Icons.Default.DoneAll, contentDescription = "Mark All Read", tint = blue)
                    }
                }
            )
        },
        containerColor = white
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {

            OutlinedTextField(
                value = "",
                onValueChange = {},
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null, tint = blue  , modifier = Modifier.size(24.dp))
                },
                placeholder = { Text("Search", color = Color.Gray, fontSize = 16.sp) },
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = Color(0xFFF0F2F5),
                    focusedBorderColor = Color(0xFFF0F2F5),
                    unfocusedContainerColor = Color(0xFFF8F9FF),
                    focusedContainerColor = Color(0xFFF8F9FF)
                ),
                textStyle = LocalTextStyle.current.copy(fontSize = 16.sp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(notifications) { notification ->
                    NotificationCardLazy(notification)
                }
            }
        }
    }
}

@Composable
fun NotificationCardLazy(notification: NotificationItem) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(6.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = notification.icon,
                    contentDescription = notification.title,
                    tint = notification.iconTint,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = notification.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = notification.textColor,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                    color = notification.buttonColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = notification.tag,
                        color = notification.buttonColor,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 12.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = notification.message, fontSize = 14.sp, color = notification.textColor)
            if(notification.details.isNotEmpty()){
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = notification.details, fontSize = 13.sp, color = notification.textColor)
            }
            if(notification.time.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = notification.time, fontSize = 11.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = { },
                colors = ButtonDefaults.buttonColors(containerColor = notification.buttonColor),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text(notification.buttonText, color = Color.White)
            }
        }
    }
}
