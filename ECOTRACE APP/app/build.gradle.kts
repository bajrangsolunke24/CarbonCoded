plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.gms.google.services)
}

android {
    namespace = "com.example.jaldrishti"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.jaldrishti"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // BuildConfig for API keys
        buildConfigField("String", "OPENAI_API_KEY", "\"${project.findProperty("OPENAI_API_KEY") ?: ""}\"")
        buildConfigField("String", "ELEVENLABS_API_KEY", "\"${project.findProperty("ELEVENLABS_API_KEY") ?: ""}\"")
        buildConfigField("String", "GEMINI_API_KEY", "\"${project.findProperty("GEMINI_API_KEY") ?: ""}\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {


    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.navigation:navigation-compose:2.6.0")
// or latest stable version
    implementation("androidx.hilt:hilt-navigation-compose:1.0.0")

    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    implementation("com.tom-roush:pdfbox-android:2.0.27.0")
//    implementation("com.google.android.gms:play-services-maps:19.0.0")
//    implementation("com.google.maps.android:android-maps-utils:3.8.0")
//
    // Removed Google Maps - using Leaflet via WebView instead (free)
    // implementation("com.google.android.gms:play-services-maps:19.0.0")
    // implementation("com.google.maps.android:android-maps-utils:3.8.0")
//    implementation("org.locationtech.jts:jts-core:1.18.2")
////    implementation("com.mapbox.maps:android:10.13.0")
//    implementation("com.mapbox.turf:turf:6.3.0")

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.2")
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.foundation.android)
    implementation(libs.firebase.auth)
    implementation(libs.firebase.firestore)
    implementation("com.google.firebase:firebase-storage:21.0.0")
    implementation(libs.play.services.maps)
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("org.osmdroid:osmdroid-android:6.1.18")

    // ARCore for AR boundary marking
    implementation("com.google.ar:core:1.42.0")
    // SceneView for easier AR integration (optional - you can use ARCore directly)
    // implementation("io.github.sceneview:arsceneview:2.0.0")

    // AI Assistant Dependencies
    // OkHttp for OpenAI Whisper and 11Labs API calls
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // JSON parsing
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Media3 ExoPlayer for audio playback
    implementation("androidx.media3:media3-exoplayer:1.2.1")
    implementation("androidx.media3:media3-ui:1.2.1")
    
    // Google Gemini AI
    implementation("com.google.ai.client.generativeai:generativeai:0.7.0")

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}