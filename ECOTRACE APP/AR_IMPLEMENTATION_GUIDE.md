# AR Implementation Guide for ECOTRACE

## What is AR and Why Do You Need It?

**AR (Augmented Reality)** allows users to see the real world through their phone's camera with digital overlays. In ECOTRACE, AR is used to:

1. **Walk around land boundaries**: Users physically walk around their land while the app tracks their path
2. **Mark boundary coordinates**: As users walk, the app automatically marks GPS coordinates
3. **Calculate area and perimeter**: The app calculates the land area and perimeter from the path walked

## Current Status

The AR functionality is currently a **placeholder**. The file `ARBoundaryScreen.kt` has been created with the structure, but needs a full ARCore implementation.

## What You Need to Do

### Option 1: Use ARCore (Recommended - Google's AR Framework)

**Requirements:**
- Device must support ARCore (most modern Android phones)
- Camera permission
- ARCore installed on device

**Steps:**

1. **Add ARCore dependency** (already added in `build.gradle.kts`):
   ```kotlin
   implementation("com.google.ar:core:1.42.0")
   ```

2. **Implement AR Session** in `ARBoundaryScreen.kt`:
   - Create an AR Session
   - Track device position as user walks
   - Mark GPS coordinates at regular intervals
   - Draw the boundary path in AR view

3. **Key Components Needed:**
   - `ArSession` - Manages AR tracking
   - `Camera` - Access device camera
   - `Location tracking` - GPS coordinates
   - `Path visualization` - Show boundary line in AR

### Option 2: Use SceneView Library (Easier Integration)

SceneView provides easier AR integration with Compose:

```kotlin
implementation("io.github.sceneview:arsceneview:2.0.0")
```

Then use `ArSceneView` composable directly.

### Option 3: Simplified GPS-Only Approach (No AR Visual)

If ARCore is too complex, you can:
- Use GPS tracking only
- Let users walk around and mark points manually
- Calculate area from GPS coordinates
- No AR visualization needed

## Implementation Steps

### Step 1: Check AR Availability

```kotlin
val availability = ArCoreApk.getInstance().checkAvailability(context)
if (availability.isSupported) {
    // AR is available
} else {
    // Fallback to map or GPS-only mode
}
```

### Step 2: Request Permissions

```kotlin
// Camera permission (already in manifest)
ActivityCompat.requestPermissions(
    activity,
    arrayOf(Manifest.permission.CAMERA),
    CAMERA_PERMISSION_CODE
)
```

### Step 3: Create AR Session

```kotlin
val session = Session(context)
session.resume() // Start AR session
```

### Step 4: Track User Movement

```kotlin
// In AR frame update callback
session.update().apply {
    // Get camera pose
    val cameraPose = camera.displayOrientedPose
    
    // Get GPS location
    val location = getCurrentLocation()
    
    // Add to boundary points
    boundaryPoints.add(location)
}
```

### Step 5: Calculate Area and Perimeter

The `calculateAreaAndPerimeter()` function is already implemented in `ARBoundaryScreen.kt`.

## Testing AR

1. **Test on a real device** - AR doesn't work in emulators
2. **Ensure good lighting** - AR needs good visibility
3. **Test outdoors** - Better GPS accuracy
4. **Check ARCore support** - Not all devices support ARCore

## Fallback Options

If AR is not available:
- Redirect to Map boundary marking (already implemented)
- Use GPS-only tracking
- Manual coordinate entry

## Resources

- [ARCore Documentation](https://developers.google.com/ar/develop)
- [ARCore Samples](https://github.com/google-ar/arcore-android-sdk)
- [SceneView Library](https://github.com/SceneView/sceneview-android)

## Current Implementation Status

✅ AR screen structure created
✅ Permission handling added
✅ Area/perimeter calculation implemented
✅ Fallback to map option available
❌ Full ARCore session implementation needed
❌ GPS tracking during walk needed
❌ AR visualization of boundary path needed

## Next Steps

1. Choose your AR approach (ARCore, SceneView, or GPS-only)
2. Implement AR session management
3. Add GPS tracking during walk
4. Visualize boundary path in AR
5. Test on real devices
6. Handle edge cases (poor GPS, ARCore unavailable, etc.)

