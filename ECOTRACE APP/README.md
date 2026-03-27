# 🌱 JalDrishti - Carbon Credit Ecosystem App

A comprehensive Android application that enables farmers and NGOs to register land, identify plants using AI, and calculate carbon credits for sustainable farming practices in India.

## 📱 Features

### 🌿 Green Carbon (For Farmers)
- **Land Registration**: Register agricultural land using GPS boundary marking
- **AI Plant Identification**: Upload photos to identify crops/trees using OpenAI Vision API
- **Carbon Credit Calculation**: Automatic calculation based on plant type and land area
- **Economic Projections**: View estimated income from carbon credits
- **Multi-language Support**: Hindi, Marathi, Tamil, Telugu, and more
- **Voice Assistant**: AI-powered assistant for guidance and support

### 🌊 Blue Carbon (For NGOs)
- **Coastal Land Management**: Register and manage coastal restoration projects
- **Progress Tracking**: Monitor restoration progress and carbon sequestration
- **Analytics Dashboard**: Comprehensive analytics for coastal projects

### 🤖 AI-Powered Features
- **Plant Identification**: OpenAI Vision API for accurate plant species identification
- **Voice Assistant**: Real-time speech recognition with dual AI support (Gemini/OpenAI)
- **Text-to-Speech**: Multi-language audio feedback using ElevenLabs
- **Smart Calculations**: Scientific carbon credit calculations based on plant types
- **AI Provider Choice**: Switch between Google Gemini and OpenAI for chat responses

## 🏗️ Architecture

### Tech Stack
- **Platform**: Android (Kotlin)
- **UI Framework**: Jetpack Compose
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Maps**: OpenStreetMap (OSMDroid)
- **AR**: ARCore for boundary marking
- **AI Services**:
  - Google Gemini AI (Primary chat assistant)
  - OpenAI GPT-4o (Plant identification & fallback chat)
  - ElevenLabs (Text-to-speech)
  - Android Speech Recognition (Voice input)

### Project Structure
```
app/src/main/java/com/example/jaldrishti/
├── ai/                          # AI service clients
│   ├── GeminiClient.kt         # Google Gemini AI integration
│   ├── OpenAIClient.kt         # OpenAI API integration
│   ├── PlantIdentificationClient.kt # Plant identification logic
│   ├── CarbonCreditCalculator.kt    # Carbon credit calculations
│   ├── ElevenLabsClient.kt     # Text-to-speech service
│   └── AIAssistantManager.kt   # AI assistant coordination
├── screens/                     # UI screens
│   ├── PlantIdentificationScreen.kt
│   ├── GreenCarbonDashboard.kt
│   ├── MapBoundaryScreen.kt
│   └── AIAssistantScreen.kt
├── viewmodels/
│   └── LandViewModel.kt        # Land data management
└── utils/
    ├── Navigation.kt           # App navigation
    └── DemoDataManager.kt      # Local data storage
```

## 🚀 Getting Started

### Prerequisites
- **Android Studio**: Arctic Fox or later
- **JDK**: 11 or higher
- **Android SDK**: API level 24+ (Android 7.0)
- **Device Requirements**: 
  - Camera for plant photos
  - GPS for location services
  - Microphone for voice assistant

### API Keys Required
1. **Google Gemini API Key** (recommended for chat assistant)
   - Get from: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **OpenAI API Key** (for plant identification and fallback chat)
   - Get from: [OpenRouter](https://openrouter.ai/) or [OpenAI](https://platform.openai.com/)
3. **ElevenLabs API Key** (for text-to-speech)
   - Get from: [ElevenLabs](https://elevenlabs.io/)
4. **Firebase Project** (for backend services)
   - Create at: [Firebase Console](https://console.firebase.google.com/)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/jaldrishti.git
   cd jaldrishti
   ```

2. **Configure API Keys**
   
   Edit `gradle.properties` file:
   ```properties
   # API Keys
   GEMINI_API_KEY=your_gemini_api_key_here      # Primary AI assistant
   OPENAI_API_KEY=your_openai_or_openrouter_api_key_here  # Plant ID & fallback
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication
   - Download `google-services.json`
   - Place it in `app/` directory

4. **Build and Run**
   ```bash
   # Set JAVA_HOME (Windows)
   set JAVA_HOME=C:\Program Files\Java\jdk-11
   
   # Build the project
   ./gradlew assembleDebug
   
   # Install on device
   ./gradlew installDebug
   ```

## 🌍 Usage Guide

### For Farmers (Green Carbon)

1. **Register Land**
   - Select "Green Carbon" from home screen
   - Fill in land details (name, type, address)
   - Choose boundary marking method:
     - **Map Drawing**: Draw boundary on map
     - **AR Walking**: Walk the boundary with AR guidance

2. **Plant Identification**
   - After land registration, you'll be prompted to identify plants
   - Take a clear photo of your main crop/tree
   - AI will identify the plant and calculate carbon credits
   - View estimated annual income from carbon credits

3. **Dashboard**
   - View all registered lands
   - See plant information and carbon credit projections
   - Track total carbon credits and estimated earnings

### For NGOs (Blue Carbon)

1. **NGO Registration**
   - Select "Blue Carbon" from home screen
   - Complete NGO verification process
   - Register coastal restoration projects

2. **Project Management**
   - Add coastal land areas
   - Track restoration progress
   - Monitor carbon sequestration

### AI Assistant

- **Voice Commands**: Tap "Speak" and ask questions about carbon credits
- **Text Chat**: Type questions for instant AI responses
- **AI Provider**: Choose between Google Gemini (default) or OpenAI
- **Multi-language**: Supports Hindi, Marathi, Tamil, Telugu, and more
- **Smart Fallback**: Automatically switches AI providers if one fails

## 🧮 Carbon Credit Calculations

The app uses scientific formulas to calculate carbon credits:

### Plant Types & Rates
- **Trees**: 10-50 kg CO₂/year → 1-5 credits/hectare/year
- **Crops**: 5-20 kg CO₂/year → 0.5-2 credits/hectare/year
- **Shrubs**: 2-10 kg CO₂/year → 0.2-1 credits/hectare/year
- **Bamboo**: 20-60 kg CO₂/year → 2-6 credits/hectare/year

### Factors Considered
- Plant type and species
- Land area (hectares)
- Soil quality (poor/medium/good)
- Irrigation type (rainfed/irrigated/drip)
- Regional climate conditions

### Economic Projections
- Current market rate: ~$15 per ton CO₂
- 5-year and 10-year projections included
- Growth factors applied for maturing plants

## 🔧 Configuration

### Customizing Plant Database
Edit `PlantIdentificationClient.kt` to modify:
- Plant identification prompts
- Carbon absorption rates
- Credit calculation formulas

### Adding Languages
Update language mappings in:
- `AIAssistantManager.kt` (speech recognition)
- `ElevenLabsTTS.kt` (text-to-speech voices)

### Adjusting Carbon Rates
Modify `CarbonCreditCalculator.kt`:
- Update `PLANT_TYPE_MULTIPLIERS`
- Adjust `CREDIT_PRICE_PER_TON_USD`
- Change regional multipliers

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clean and rebuild
   ./gradlew clean
   ./gradlew assembleDebug
   ```

2. **API Key Issues**
   - Verify keys are correctly set in `gradle.properties`
   - Check API key permissions and quotas
   - Ensure no extra spaces in key values

3. **Plant Identification Not Working**
   - Check internet connection
   - Verify OpenAI/OpenRouter API key
   - Try with different image (clear, well-lit plant photos work best)

4. **Voice Assistant Issues**
   - Grant microphone permissions
   - Check device audio settings
   - Ensure internet connection for AI responses

5. **GPS/Location Issues**
   - Enable location permissions
   - Use device outdoors for better GPS signal
   - Check location services are enabled

### Debug Logs
Enable detailed logging by checking Android Studio Logcat for:
- `PlantIdentification`: Plant ID process
- `CarbonCalculator`: Credit calculations
- `AIAssistant`: Voice and chat features
- `OpenAIClient`: API communications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Kotlin coding conventions
- Use Jetpack Compose for UI components
- Add comprehensive logging for debugging
- Test on multiple device sizes and Android versions
- Ensure offline functionality where possible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o Vision API
- **ElevenLabs** for text-to-speech services
- **Firebase** for backend infrastructure
- **OpenStreetMap** for mapping services
- **ARCore** for augmented reality features

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@jaldrishti.com
- Documentation: [Wiki](https://github.com/your-username/jaldrishti/wiki)

---

**Made with 🌱 for sustainable farming in India**