package com.example.jaldrishti

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BlueCarbonSignInScreen(navController: NavController, authViewModel: AuthViewModel) {
    val primaryBlue = Color(0xFF1565C0)
    val lightBlue = Color(0xFFE3F2FD)
    val context = LocalContext.current

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF3F5F9))
    ) {
        Card(
            shape = RoundedCornerShape(28.dp),
            elevation = CardDefaults.cardElevation(6.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.93f)
                .align(Alignment.Center)
                .padding(horizontal = 10.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 28.dp, vertical = 18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier.size(104.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.WaterDrop,
                        contentDescription = "Blue Carbon",
                        tint = primaryBlue,
                        modifier = Modifier.size(94.dp)
                    )
                }
                Spacer(Modifier.height(8.dp))

                Text(
                    text = "NGO Sign In",
                    fontWeight = FontWeight.Black,
                    fontSize = 28.sp,
                    color = Color.Black
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Sign in to manage coastal carbon projects",
                    color = Color.Gray,
                    fontSize = 16.sp
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Icon(Icons.Default.Email, contentDescription = "Email Icon", tint = primaryBlue)
                    },
                    placeholder = { Text("Email") },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        cursorColor = primaryBlue,
                        focusedBorderColor = primaryBlue,
                        unfocusedBorderColor = Color.Gray
                    )
                )
                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = "Password Icon", tint = primaryBlue)
                    },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide" else "Show",
                                tint = primaryBlue
                            )
                        }
                    },
                    placeholder = { Text("Password") },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    shape = RoundedCornerShape(14.dp),
                     colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        cursorColor = primaryBlue,
                        focusedBorderColor = primaryBlue,
                        unfocusedBorderColor = Color.Gray
                    )
                )
                Spacer(Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (email.isBlank() || password.isBlank()) {
                            AppUtil.showtoast(context, "Please enter both email and password")
                        } else {
                            authViewModel.login(email, password) { success, errorMessage ->
                                if (success) {
                                    // Check if user is NGO
                                    navController.navigate("NgoVerificationCheck")
                                } else {
                                    AppUtil.showtoast(context, errorMessage ?: "Something went wrong")
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryBlue),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    Text("Sign In", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }

                Spacer(Modifier.height(6.dp))

                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Don't have an account? ",
                        color = Color.Gray,
                        fontSize = 14.sp
                    )
                    TextButton(onClick = { navController.navigate("BlueCarbonSignUp") }) {
                        Text("Sign Up", color = primaryBlue, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

