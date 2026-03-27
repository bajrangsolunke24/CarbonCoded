package com.example.jaldrishti

import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Forest
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    navController: NavController, authViewModel: AuthViewModel
) {
    val primaryGreen = Color(0xFF2E7D32)
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
                        Icons.Default.Forest,
                        contentDescription = "Green Carbon",
                        tint = primaryGreen,
                        modifier = Modifier.size(94.dp)
                    )
                }
                Spacer(Modifier.height(8.dp))

                Text(
                    text = "Green Carbon Sign In",
                    fontWeight = FontWeight.Black,
                    fontSize = 28.sp,
                    color = Color.Black
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Sign in to manage land and carbon credits",
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
                        Icon(Icons.Default.Email, contentDescription = "Email Icon", tint = primaryGreen)
                    },
                    placeholder = { Text("Email") },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = "Password Icon", tint = primaryGreen)
                    },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide" else "Show",
                                tint = primaryGreen
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
                        unfocusedContainerColor = Color.White
                    )
                )
                Spacer(Modifier.height(6.dp))
                TextButton(onClick = {
                    // TODO: Implement forgot password
                }) {
                    Text(
                        "Forgot Password?",
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.End,
                        color = primaryGreen
                    )
                }

                Spacer(Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (email.isBlank() || password.isBlank()) {
                            AppUtil.showtoast(context, "Please enter both email and password")
                        } else {
                            authViewModel.login(email, password) { success, errorMessage ->
                                if (success) {
                                    navController.navigate("GreenCarbonDashboard") { // Navigate to Green Dashboard
                                        popUpTo(0) { inclusive = true }
                                    }
                                } else {
                                    AppUtil.showtoast(context, errorMessage ?: "Something went wrong")
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
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
                    TextButton(onClick = { navController.navigate("GreenCarbonSignUp") }) {
                        Text("Sign Up", color = primaryGreen, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

