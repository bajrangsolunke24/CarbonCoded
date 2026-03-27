package com.example.jaldrishti

data class UserModel(
    val name: String = "",
    val email: String = "",
    val uid: String = "",
    val phone: String = "",
    val address: String = "",
    val latitude: Double? = null,
    val longitude: Double? = null
)
