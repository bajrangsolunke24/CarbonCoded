package com.example.jaldrishti

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
@Composable
fun ForgotPasswordScreen() {
    var email by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(start = 24.dp, end = 24.dp, top = 34.dp),
        horizontalAlignment = Alignment.Start
    ) {

        TextButton(
            onClick = { },
            contentPadding = PaddingValues(0.dp)
        ) {
            Text("<-  Back", color = Color.Gray, fontSize = 18.sp)
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Title
        Text(
            text = "Forgot",
            fontSize = 38.sp,
            color = Color(0xFF1976D2),
            fontWeight = FontWeight.Bold,
            lineHeight = 32.sp
        )
        Text(
            text = "password?",
            fontSize = 38.sp,
            color = Color(0xFF1976D2),
            fontWeight = FontWeight.Bold,
            lineHeight = 32.sp
        )

        Spacer(modifier = Modifier.height(26.dp))

        Text(
            text = "Enter your email for the verification process,\nwe will send code to your email",
            fontSize = 14.sp,
            color = Color(0xFF505050)
        )

        Spacer(modifier = Modifier.height(28.dp))

        Text(
            text = "Email",
            fontSize = 14.sp,
            color = Color.Gray,
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            placeholder = { Text("Enter your Email...") },
            singleLine = true
        )

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = {  },
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2))
        ) {
            Text("Continue", color = Color.White, fontSize = 16.sp)
        }
    }
}