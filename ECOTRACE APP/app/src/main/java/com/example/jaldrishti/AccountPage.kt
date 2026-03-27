package com.example.jaldrishti

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.automirrored.outlined.ShowChart
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.Firebase
import com.google.firebase.auth.auth

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountPage(navController: NavController) {
    val white = Color.White
    val blue = Color(0xFF1565C0)  // Blue used for headings and icons
    val divider = Color(0xFFDCE6F7)
    val subtitleBlue = Color(0xFF90CAF9)
    val avatarSize = 80.dp
    val blackText = Color.Black  // Black color for menu item text

    val menuItems = listOf(
        AccountMenuItem("My Groundwater Contribution", Icons.Outlined.WaterDrop),
        AccountMenuItem("My Recharge Plan", Icons.AutoMirrored.Filled.TrendingUp),
        AccountMenuItem("Water Saving Summary", Icons.AutoMirrored.Outlined.ShowChart),
        AccountMenuItem("Rainfall Alerts", Icons.Default.CloudQueue),
        AccountMenuItem("My Reports", Icons.Default.Description),
        AccountMenuItem("Community Settings", Icons.Default.Groups),
        AccountMenuItem("Help & Support", Icons.Outlined.SupportAgent),
        AccountMenuItem("About ECOTRACE", Icons.Outlined.Info),
        AccountMenuItem("Log Out", Icons.AutoMirrored.Outlined.Logout)
    )

    Scaffold(
        containerColor = white,
        topBar = {
            TopAppBar(
                title = { Text("Profile", color = blue, fontWeight = FontWeight.Bold, fontSize = 22.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = white),
                actions = {
                    IconButton(onClick = { /* Edit profile logic */ }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit Profile", tint = blue)
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(white)
                .padding(paddingValues)
        ) {

            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(avatarSize)
                            .clip(CircleShape)
                            .background(subtitleBlue)
                    ) {
                        Icon(
                            Icons.Filled.AccountCircle,
                            contentDescription = "User Avatar",
                            tint = blue,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            Firebase.auth.signOut()
                            navController.navigate("SignUpPage"){
                            popUpTo(0) { inclusive = true } }
                        } ,

                        modifier = Modifier
                            .height(55.dp)
                            .width(150.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colorResource(R.color.teal_200),
                            contentColor = Color.White
                        )) {
                        Text(
                            text = "logout",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        "+91 8950090370sss",
                        color = blue,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }


            items(menuItems) { item ->
                AccountMenuRow(item, iconColor = blue, textColor = blackText)
                HorizontalDivider(color = divider, thickness = 1.dp)
            }
        }
    }
}

data class AccountMenuItem(val label: String, val icon: ImageVector)

@Composable
fun AccountMenuRow(item: AccountMenuItem, iconColor: Color, textColor: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(horizontal = 24.dp)
            .clickable { /* Add menu item click logic here */ }
    ) {
        Icon(item.icon, contentDescription = item.label, tint = iconColor, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(18.dp))
        Text(
            text = item.label,
            fontSize = 16.sp,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}
