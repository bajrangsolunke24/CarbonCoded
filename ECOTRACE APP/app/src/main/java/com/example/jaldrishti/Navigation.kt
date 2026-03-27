package com.example.jaldrishti

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.google.firebase.auth.FirebaseAuth

@Composable
fun Navigation(authViewModel: AuthViewModel) {
    val navController = rememberNavController()
    val landViewModel: LandViewModel = androidx.lifecycle.viewmodel.compose.viewModel()

    // Check Firebase login state
    val currentUser = FirebaseAuth.getInstance().currentUser
    val startDestination = if (currentUser != null) {
        "CarbonSelection"
    } else {
        "CarbonSelection"
    }

    NavHost(navController, startDestination = startDestination) {

        // Initial Selection Screen
        composable("CarbonSelection") {
            CarbonSelectionScreen(navController)
        }

        // Green Carbon Flow
        composable("GreenCarbonSignUp") {
            SignUpScreen(navController, authViewModel)
        }

        composable("GreenCarbonSignIn") {
            LoginScreen(navController, authViewModel)
        }

        composable("RegisterLand") {
            RegisterLandScreen(navController, landViewModel)
        }

        composable("BoundaryMarking") {
            BoundaryMarkingScreen(navController, landViewModel)
        }

        composable("ARBoundary") {
            ARBoundaryScreen(navController, landViewModel)
        }
        
        composable("MapBoundary") {
            MapBoundaryScreen(navController, landViewModel)
        }

        composable("GreenCarbonDashboard") {
            GreenCarbonDashboard(navController)
        }

        composable("LandDetails/{landId}/{type}") { backStackEntry ->
            val landId = backStackEntry.arguments?.getString("landId") ?: ""
            val type = backStackEntry.arguments?.getString("type") ?: "green"
            LandDetailsScreen(navController, landId, type)
        }

        // Blue Carbon Flow
        composable("BlueCarbonSignIn") {
            BlueCarbonSignInScreen(navController, authViewModel)
        }

        composable("BlueCarbonSignUp") {
            SignUpScreen(navController, authViewModel) // Reuse signup, but mark as NGO
        }

        composable("NgoVerificationCheck") {
            NgoVerificationScreen(navController)
        }

        composable("NgoVerification") {
            NgoVerificationScreen(navController)
        }

        composable("BlueCarbonDashboard") {
            BlueCarbonDashboard(navController)
        }

        composable("AnalyticsScreen/{type}/{area}") { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "green"
            val area = backStackEntry.arguments?.getString("area")?.toFloatOrNull() ?: 10f
            AnalyticsScreen(navController, type, area)
        }

        // AI Assistant
        composable("AIAssistant") {
            AIAssistantScreen(navController)
        }
        
        // Plant Identification
        composable("PlantIdentification/{landId}/{area}/{type}") { backStackEntry ->
            val landId = backStackEntry.arguments?.getString("landId") ?: ""
            val area = backStackEntry.arguments?.getString("area")?.toDoubleOrNull() ?: 0.0
            val type = backStackEntry.arguments?.getString("type") ?: "lands"
            PlantIdentificationScreen(navController, landId, area, type)
        }
    }
}
