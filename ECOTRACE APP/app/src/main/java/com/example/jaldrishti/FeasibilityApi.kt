package com.example.jaldrishti


import retrofit2.http.GET
import retrofit2.http.Query

data class RainfallResponseItem(
    val District: String?,
    val State: String?,
    val CumulativeActual: String?,
    val CumulativeNormal: String?,
    val CumulativeCategory: String?
)

interface FeasibilityApi {
    // IMD rainfall API (open endpoint)
    @GET("districtwise_rainfall_api.php")
    suspend fun getRainfall(
        @Query("id") id: String
    ): List<RainfallResponseItem>
}
