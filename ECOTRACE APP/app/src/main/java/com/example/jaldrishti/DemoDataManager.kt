package com.example.jaldrishti

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

object DemoDataManager {
    // We use the same structure as the Firestore documents
    private val _localLands = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val localLands = _localLands.asStateFlow()

    private val _localCoastalLands = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val localCoastalLands = _localCoastalLands.asStateFlow()

    fun addLand(landData: Map<String, Any>): String {
        val landId = "demo_${System.currentTimeMillis()}"
        val landWithId = landData.toMutableMap()
        landWithId["id"] = landId
        _localLands.update { it + landWithId }
        return landId
    }

    fun addCoastalLand(landData: Map<String, Any>): String {
        val landId = "demo_coastal_${System.currentTimeMillis()}"
        val landWithId = landData.toMutableMap()
        landWithId["id"] = landId
        _localCoastalLands.update { it + landWithId }
        return landId
    }
    
    fun updateLandWithPlantData(landId: String, plantData: Map<String, Any>) {
        _localLands.update { lands ->
            lands.map { land ->
                if (land["id"] == landId) {
                    land.toMutableMap().apply {
                        putAll(plantData)
                        put("needsPlantIdentification", false)
                    }
                } else {
                    land
                }
            }
        }
    }
    
    fun getLandById(landId: String): Map<String, Any>? {
        return _localLands.value.find { it["id"] == landId }
    }
}
