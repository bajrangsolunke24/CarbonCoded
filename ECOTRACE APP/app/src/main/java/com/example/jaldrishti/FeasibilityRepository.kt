package com.example.jaldrishti


import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class FeasibilityRepository {

    private val api = Retrofit.Builder()
        .baseUrl("https://mausam.imd.gov.in/api/") // IMD’s public rainfall API
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(FeasibilityApi::class.java)

    suspend fun checkFeasibility(districtId: String): String = withContext(Dispatchers.IO) {
        try {
            val response = api.getRainfall(districtId)
            val record = response.firstOrNull() ?: return@withContext "No Data"
            val actual = record.CumulativeActual?.toDoubleOrNull() ?: 0.0
            val normal = record.CumulativeNormal?.toDoubleOrNull() ?: 1.0
            val ratio = actual / normal

            // Simple suitability logic
            return@withContext when {
                ratio >= 1.0 -> "Highly Suitable"
                ratio >= 0.7 -> "Moderately Suitable"
                else -> "Low Suitable"
            }
        } catch (e: Exception) {
            return@withContext "Error"
        }
    }
}
