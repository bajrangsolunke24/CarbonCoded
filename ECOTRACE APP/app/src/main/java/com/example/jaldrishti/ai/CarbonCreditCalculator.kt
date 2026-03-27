package com.example.jaldrishti.ai

import android.util.Log
import kotlin.math.roundToInt

/**
 * Carbon Credit Calculator based on plant type, area, and other factors
 */
class CarbonCreditCalculator {
    
    data class CarbonCreditResult(
        val totalCreditsPerYear: Double,
        val creditsPerHectare: Double,
        val totalCO2AbsorptionKg: Double,
        val estimatedValue: Double, // in USD
        val breakdown: String,
        val projectedCredits5Years: Double,
        val projectedCredits10Years: Double
    )
    
    companion object {
        // Carbon credit price per ton CO2 (approximate market rate)
        private const val CREDIT_PRICE_PER_TON_USD = 15.0
        
        // Plant type multipliers for different conditions
        private val PLANT_TYPE_MULTIPLIERS = mapOf(
            "tree" to 1.0,
            "crop" to 0.7,
            "shrub" to 0.5,
            "grass" to 0.3,
            "bamboo" to 1.2,
            "palm" to 0.9,
            "fruit_tree" to 1.1,
            "medicinal_plant" to 0.6
        )
        
        // Regional multipliers for India
        private val REGIONAL_MULTIPLIERS = mapOf(
            "tropical" to 1.2,
            "subtropical" to 1.0,
            "temperate" to 0.8,
            "arid" to 0.6,
            "coastal" to 1.1
        )
    }
    
    fun calculateCarbonCredits(
        plantResult: PlantIdentificationClient.PlantIdentificationResult,
        areaInHectares: Double,
        region: String = "subtropical", // Default for most of India
        soilQuality: String = "medium", // "poor", "medium", "good"
        irrigationType: String = "rainfed" // "rainfed", "irrigated", "drip"
    ): CarbonCreditResult {
        
        Log.d("CarbonCalculator", "Calculating credits for ${plantResult.plantName}")
        Log.d("CarbonCalculator", "Area: $areaInHectares hectares, Type: ${plantResult.plantType}")
        
        // Base carbon absorption from plant identification
        val baseCarbonAbsorption = plantResult.carbonAbsorptionRate
        val baseCreditsPerHectare = plantResult.carbonCreditsPerHectare
        
        // Apply multipliers
        val plantTypeMultiplier = PLANT_TYPE_MULTIPLIERS[plantResult.plantType.lowercase()] ?: 1.0
        val regionalMultiplier = REGIONAL_MULTIPLIERS[region.lowercase()] ?: 1.0
        val soilMultiplier = when (soilQuality.lowercase()) {
            "poor" -> 0.7
            "medium" -> 1.0
            "good" -> 1.3
            else -> 1.0
        }
        val irrigationMultiplier = when (irrigationType.lowercase()) {
            "rainfed" -> 1.0
            "irrigated" -> 1.2
            "drip" -> 1.4
            else -> 1.0
        }
        
        // Calculate adjusted values
        val adjustedCarbonAbsorption = baseCarbonAbsorption * 
            plantTypeMultiplier * 
            regionalMultiplier * 
            soilMultiplier * 
            irrigationMultiplier
            
        val adjustedCreditsPerHectare = baseCreditsPerHectare * 
            plantTypeMultiplier * 
            regionalMultiplier * 
            soilMultiplier * 
            irrigationMultiplier
        
        // Calculate total values
        val totalCO2AbsorptionKg = adjustedCarbonAbsorption * areaInHectares
        val totalCreditsPerYear = adjustedCreditsPerHectare * areaInHectares
        
        // Calculate monetary value (convert kg to tons)
        val totalCO2AbsorptionTons = totalCO2AbsorptionKg / 1000.0
        val estimatedValueUSD = totalCO2AbsorptionTons * CREDIT_PRICE_PER_TON_USD
        
        // Project future credits (assuming growth and maturity)
        val growthFactor5Years = when (plantResult.plantType.lowercase()) {
            "tree" -> 1.5 // Trees grow and absorb more over time
            "crop" -> 1.1 // Crops improve with better practices
            "shrub" -> 1.3
            "bamboo" -> 2.0 // Bamboo grows very fast
            else -> 1.2
        }
        val growthFactor10Years = growthFactor5Years * 1.3
        
        val projectedCredits5Years = totalCreditsPerYear * growthFactor5Years * 5
        val projectedCredits10Years = totalCreditsPerYear * growthFactor10Years * 10
        
        // Create breakdown explanation
        val breakdown = buildString {
            appendLine("Carbon Credit Calculation Breakdown:")
            appendLine("• Plant: ${plantResult.plantName}")
            appendLine("• Type: ${plantResult.plantType}")
            appendLine("• Area: ${String.format("%.2f", areaInHectares)} hectares")
            appendLine("• Base CO₂ absorption: ${String.format("%.1f", baseCarbonAbsorption)} kg/year")
            appendLine("• Adjusted CO₂ absorption: ${String.format("%.1f", adjustedCarbonAbsorption)} kg/year")
            appendLine("• Total CO₂ absorption: ${String.format("%.1f", totalCO2AbsorptionKg)} kg/year")
            appendLine("• Credits per hectare: ${String.format("%.2f", adjustedCreditsPerHectare)}")
            appendLine("• Total credits per year: ${String.format("%.2f", totalCreditsPerYear)}")
            appendLine("• Estimated value: $${String.format("%.2f", estimatedValueUSD)} USD/year")
            appendLine("")
            appendLine("Multipliers applied:")
            appendLine("• Plant type: ${String.format("%.1f", plantTypeMultiplier)}x")
            appendLine("• Region ($region): ${String.format("%.1f", regionalMultiplier)}x")
            appendLine("• Soil quality ($soilQuality): ${String.format("%.1f", soilMultiplier)}x")
            appendLine("• Irrigation ($irrigationType): ${String.format("%.1f", irrigationMultiplier)}x")
        }
        
        Log.d("CarbonCalculator", "Calculated ${String.format("%.2f", totalCreditsPerYear)} credits/year")
        
        return CarbonCreditResult(
            totalCreditsPerYear = totalCreditsPerYear,
            creditsPerHectare = adjustedCreditsPerHectare,
            totalCO2AbsorptionKg = totalCO2AbsorptionKg,
            estimatedValue = estimatedValueUSD,
            breakdown = breakdown,
            projectedCredits5Years = projectedCredits5Years,
            projectedCredits10Years = projectedCredits10Years
        )
    }
    
    /**
     * Calculate credits for mixed vegetation (multiple plant types)
     */
    fun calculateMixedVegetationCredits(
        plantResults: List<Pair<PlantIdentificationClient.PlantIdentificationResult, Double>>, // plant result + area percentage
        totalAreaInHectares: Double,
        region: String = "subtropical",
        soilQuality: String = "medium",
        irrigationType: String = "rainfed"
    ): CarbonCreditResult {
        
        var totalCredits = 0.0
        var totalCO2Absorption = 0.0
        var weightedCreditsPerHectare = 0.0
        val breakdownBuilder = StringBuilder()
        
        breakdownBuilder.appendLine("Mixed Vegetation Carbon Credit Calculation:")
        breakdownBuilder.appendLine("Total Area: ${String.format("%.2f", totalAreaInHectares)} hectares")
        breakdownBuilder.appendLine("")
        
        plantResults.forEach { (plantResult, areaPercentage) ->
            val plantArea = totalAreaInHectares * (areaPercentage / 100.0)
            val plantCredits = calculateCarbonCredits(
                plantResult, plantArea, region, soilQuality, irrigationType
            )
            
            totalCredits += plantCredits.totalCreditsPerYear
            totalCO2Absorption += plantCredits.totalCO2AbsorptionKg
            weightedCreditsPerHectare += plantCredits.creditsPerHectare * (areaPercentage / 100.0)
            
            breakdownBuilder.appendLine("${plantResult.plantName}:")
            breakdownBuilder.appendLine("  • Coverage: ${String.format("%.1f", areaPercentage)}% (${String.format("%.2f", plantArea)} ha)")
            breakdownBuilder.appendLine("  • Credits: ${String.format("%.2f", plantCredits.totalCreditsPerYear)}/year")
            breakdownBuilder.appendLine("  • CO₂ absorption: ${String.format("%.1f", plantCredits.totalCO2AbsorptionKg)} kg/year")
            breakdownBuilder.appendLine("")
        }
        
        val estimatedValue = (totalCO2Absorption / 1000.0) * CREDIT_PRICE_PER_TON_USD
        
        breakdownBuilder.appendLine("Total Summary:")
        breakdownBuilder.appendLine("• Total credits per year: ${String.format("%.2f", totalCredits)}")
        breakdownBuilder.appendLine("• Total CO₂ absorption: ${String.format("%.1f", totalCO2Absorption)} kg/year")
        breakdownBuilder.appendLine("• Estimated value: $${String.format("%.2f", estimatedValue)} USD/year")
        
        return CarbonCreditResult(
            totalCreditsPerYear = totalCredits,
            creditsPerHectare = weightedCreditsPerHectare,
            totalCO2AbsorptionKg = totalCO2Absorption,
            estimatedValue = estimatedValue,
            breakdown = breakdownBuilder.toString(),
            projectedCredits5Years = totalCredits * 1.3 * 5, // Average growth factor
            projectedCredits10Years = totalCredits * 1.6 * 10
        )
    }
}