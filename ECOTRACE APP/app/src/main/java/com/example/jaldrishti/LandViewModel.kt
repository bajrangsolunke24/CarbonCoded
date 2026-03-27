package com.example.jaldrishti

import androidx.lifecycle.ViewModel
import com.example.jaldrishti.ai.CarbonCreditCalculator
import com.example.jaldrishti.ai.PlantIdentificationClient
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.firestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class DraftLand(
    var name: String = "",
    var type: String = "",
    var address: String = "",
    var description: String = "",
    var latitude: Double = 0.0,
    var longitude: Double = 0.0,
    var area: Double = 0.0,
    var perimeter: Double = 0.0,
    var boundaryPoints: List<Map<String, Double>> = emptyList(),
    var carbonCredits: Double = 0.0,
    // Plant identification data
    var plantName: String = "",
    var plantType: String = "",
    var plantDescription: String = "",
    var carbonAbsorptionRate: Double = 0.0,
    var estimatedValue: Double = 0.0,
    var projectedCredits5Years: Double = 0.0,
    var projectedCredits10Years: Double = 0.0
)

class LandViewModel : ViewModel() {
    private val _draftLand = MutableStateFlow(DraftLand())
    val draftLand = _draftLand.asStateFlow()

    fun updateBasicDetails(
        name: String,
        type: String,
        address: String,
        description: String,
        lat: Double,
        lng: Double
    ) {
        _draftLand.update { 
            it.copy(
                name = name,
                type = type,
                address = address,
                description = description,
                latitude = lat,
                longitude = lng
            )
        }
    }

    fun updateBoundaryData(area: Double, perimeter: Double, points: List<Map<String, Double>>) {
        val credits = area * 1.5 // Basic calculation, will be updated with plant data
        _draftLand.update {
            it.copy(
                area = area,
                perimeter = perimeter,
                boundaryPoints = points,
                carbonCredits = credits
            )
        }
    }
    
    fun updatePlantData(
        plantResult: PlantIdentificationClient.PlantIdentificationResult,
        carbonResult: CarbonCreditCalculator.CarbonCreditResult
    ) {
        _draftLand.update {
            it.copy(
                plantName = plantResult.plantName,
                plantType = plantResult.plantType,
                plantDescription = plantResult.description,
                carbonAbsorptionRate = plantResult.carbonAbsorptionRate,
                carbonCredits = carbonResult.totalCreditsPerYear,
                estimatedValue = carbonResult.estimatedValue,
                projectedCredits5Years = carbonResult.projectedCredits5Years,
                projectedCredits10Years = carbonResult.projectedCredits10Years
            )
        }
    }
    
    fun updateLandWithPlantData(
        landId: String,
        plantResult: PlantIdentificationClient.PlantIdentificationResult,
        carbonResult: CarbonCreditCalculator.CarbonCreditResult,
        collectionPath: String = "lands",
        onResult: (Boolean) -> Unit
    ) {
        val uid = Firebase.auth.currentUser?.uid
        if (uid == null) {
            onResult(false)
            return
        }
        
        val plantData = hashMapOf(
            "plantName" to plantResult.plantName,
            "plantType" to plantResult.plantType,
            "plantDescription" to plantResult.description,
            "carbonAbsorptionRate" to plantResult.carbonAbsorptionRate,
            "carbonCredits" to carbonResult.totalCreditsPerYear,
            "estimatedValue" to carbonResult.estimatedValue,
            "projectedCredits5Years" to carbonResult.projectedCredits5Years,
            "projectedCredits10Years" to carbonResult.projectedCredits10Years,
            "carbonCalculationBreakdown" to carbonResult.breakdown,
            "plantIdentificationDate" to com.google.firebase.Timestamp.now()
        )
        
        Firebase.firestore.collection(collectionPath)
            .document(landId)
            .update(plantData as Map<String, Any>)
            .addOnSuccessListener {
                onResult(true)
            }
            .addOnFailureListener { e ->
                if (e is com.google.firebase.firestore.FirebaseFirestoreException && 
                    e.code == com.google.firebase.firestore.FirebaseFirestoreException.Code.PERMISSION_DENIED) {
                    
                    // FALLBACK TO DEMO MODE
                    DemoDataManager.updateLandWithPlantData(landId, plantData)
                    onResult(true)
                } else {
                    onResult(false)
                }
            }
    }

    fun saveLand(onResult: (Boolean, String?, String?) -> Unit) {
        val uid = Firebase.auth.currentUser?.uid
        if (uid == null) {
            onResult(false, "User not logged in", null)
            return
        }

        val landData = hashMapOf(
            "name" to _draftLand.value.name,
            "type" to _draftLand.value.type,
            "address" to _draftLand.value.address,
            "description" to _draftLand.value.description,
            "latitude" to _draftLand.value.latitude,
            "longitude" to _draftLand.value.longitude,
            "area" to _draftLand.value.area,
            "carbonCredits" to _draftLand.value.carbonCredits,
            "boundaryPoints" to _draftLand.value.boundaryPoints,
            "userId" to uid,
            "registeredDate" to com.google.firebase.Timestamp.now().toString(),
            // Plant data (will be empty initially, updated after plant identification)
            "plantName" to _draftLand.value.plantName,
            "plantType" to _draftLand.value.plantType,
            "plantDescription" to _draftLand.value.plantDescription,
            "carbonAbsorptionRate" to _draftLand.value.carbonAbsorptionRate,
            "estimatedValue" to _draftLand.value.estimatedValue,
            "projectedCredits5Years" to _draftLand.value.projectedCredits5Years,
            "projectedCredits10Years" to _draftLand.value.projectedCredits10Years,
            "needsPlantIdentification" to (_draftLand.value.plantName.isEmpty())
        )

        Firebase.firestore.collection("lands")
            .add(landData)
            .addOnSuccessListener { documentReference ->
                val landId = documentReference.id
                // Reset draft
                _draftLand.value = DraftLand()
                onResult(true, null, landId) 
            }
            .addOnFailureListener { e -> 
                if (e is com.google.firebase.firestore.FirebaseFirestoreException && 
                    e.code == com.google.firebase.firestore.FirebaseFirestoreException.Code.PERMISSION_DENIED) {
                    
                    // FALLBACK TO DEMO MODE
                    val landId = DemoDataManager.addLand(landData)
                    _draftLand.value = DraftLand()
                    onResult(true, "Authentication limited. Saved in Demo Mode.", landId)
                } else {
                    onResult(false, "Error: ${e.localizedMessage}", null)
                }
            }
    }

    fun saveCoastalLand(onResult: (Boolean, String?, String?) -> Unit) {
        val uid = Firebase.auth.currentUser?.uid
        if (uid == null) {
            onResult(false, "User not logged in as NGO", null)
            return
        }

        val coastalData = hashMapOf(
            "name" to _draftLand.value.name,
            "location" to _draftLand.value.address, // Using address as location
            "area" to _draftLand.value.area,
            "carbonCredits" to _draftLand.value.carbonCredits,
            "ngoId" to uid,
            "progress" to 0, // Initial progress
            "boundaryPoints" to _draftLand.value.boundaryPoints,
            "registeredDate" to com.google.firebase.Timestamp.now()
        )

        Firebase.firestore.collection("coastalLands")
            .add(coastalData)
            .addOnSuccessListener { documentReference ->
                val landId = documentReference.id
                _draftLand.value = DraftLand()
                onResult(true, null, landId)
            }
            .addOnFailureListener { e ->
                if (e is com.google.firebase.firestore.FirebaseFirestoreException && 
                    e.code == com.google.firebase.firestore.FirebaseFirestoreException.Code.PERMISSION_DENIED) {
                    
                    // FALLBACK TO DEMO MODE
                    val landId = DemoDataManager.addCoastalLand(coastalData)
                    _draftLand.value = DraftLand()
                    onResult(true, "Authentication limited. Saved in Demo Mode.", landId)
                } else {
                    onResult(false, "Error saving coastal land: ${e.message}", null)
                }
            }
    }
}
