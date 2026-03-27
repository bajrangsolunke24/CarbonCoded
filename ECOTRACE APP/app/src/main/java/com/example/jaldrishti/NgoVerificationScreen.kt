package com.example.jaldrishti

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*

import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.firestore
import com.google.firebase.storage.FirebaseStorage
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NgoVerificationScreen(navController: NavController) {
    val context = LocalContext.current
    val primaryBlue = Color(0xFF1565C0)
    val lightBlue = Color(0xFFE3F2FD)
    val storage = FirebaseStorage.getInstance()
    val firestore = Firebase.firestore
    val uid = Firebase.auth.currentUser?.uid

    var ngoName by remember { mutableStateOf("") }
    var registrationNumber by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var contactPerson by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }

    var registrationDocUri by remember { mutableStateOf<Uri?>(null) }
    var taxExemptDocUri by remember { mutableStateOf<Uri?>(null) }
    var bankStatementUri by remember { mutableStateOf<Uri?>(null) }

    var isUploading by remember { mutableStateOf(false) }
    var isVerified by remember { mutableStateOf(false) }

    // Check verification status
    LaunchedEffect(Unit) {
        if (uid != null) {
            firestore.collection("ngos")
                .document(uid)
                .get()
                .addOnSuccessListener { doc ->
                    if (doc.exists()) {
                        isVerified = doc.getBoolean("isVerified") ?: false
                        if (isVerified) {
                            navController.navigate("BlueCarbonDashboard") {
                                popUpTo(0) { inclusive = true }
                            }
                        } else {
                            ngoName = doc.getString("name") ?: ""
                            registrationNumber = doc.getString("registrationNumber") ?: ""
                            address = doc.getString("address") ?: ""
                            contactPerson = doc.getString("contactPerson") ?: ""
                            phoneNumber = doc.getString("phoneNumber") ?: ""
                            email = doc.getString("email") ?: ""
                        }
                    }
                }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "NGO Verification",
                        fontWeight = FontWeight.Bold,
                        color = primaryBlue
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                ),
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = primaryBlue)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = lightBlue),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        tint = primaryBlue,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Text(
                        "Upload all required documents for verification. Your account will be reviewed and approved.",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // NGO Information
            Text(
                "NGO Information",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            OutlinedTextField(
                value = ngoName,
                onValueChange = { ngoName = it },
                label = { Text("NGO Name *") },
                leadingIcon = {
                    Icon(Icons.Default.Business, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            OutlinedTextField(
                value = registrationNumber,
                onValueChange = { registrationNumber = it },
                label = { Text("Registration Number *") },
                leadingIcon = {
                    Icon(Icons.Default.Badge, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Address *") },
                leadingIcon = {
                    Icon(Icons.Default.LocationOn, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            OutlinedTextField(
                value = contactPerson,
                onValueChange = { contactPerson = it },
                label = { Text("Contact Person *") },
                leadingIcon = {
                    Icon(Icons.Default.Person, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it },
                label = { Text("Phone Number *") },
                leadingIcon = {
                    Icon(Icons.Default.Phone, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email *") },
                leadingIcon = {
                    Icon(Icons.Default.Email, null, tint = primaryBlue)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black.copy(alpha = 0.7f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            Spacer(Modifier.height(8.dp))

            // Documents Section
            Text(
                "Required Documents",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            DocumentUploadCard(
                title = "Registration Certificate",
                documentUri = registrationDocUri,
                onDocumentSelected = { registrationDocUri = it },
                icon = Icons.Default.Description,
                color = primaryBlue
            )

            DocumentUploadCard(
                title = "Tax Exempt Certificate",
                documentUri = taxExemptDocUri,
                onDocumentSelected = { taxExemptDocUri = it },
                icon = Icons.Default.Receipt,
                color = primaryBlue
            )

            DocumentUploadCard(
                title = "Bank Statement",
                documentUri = bankStatementUri,
                onDocumentSelected = { bankStatementUri = it },
                icon = Icons.Default.AccountBalance,
                color = primaryBlue
            )

            Spacer(Modifier.height(8.dp))

            // Submit Button
            Button(
                onClick = {
                    if (ngoName.isNotEmpty() && registrationNumber.isNotEmpty() &&
                        address.isNotEmpty() && contactPerson.isNotEmpty() &&
                        phoneNumber.isNotEmpty() && email.isNotEmpty() &&
                        registrationDocUri != null && taxExemptDocUri != null &&
                        bankStatementUri != null
                    ) {
                        isUploading = true
                        // Save NGO data directly without uploading documents
                        val ngoData = HashMap<String, Any>().apply {
                            put("name", ngoName)
                            put("registrationNumber", registrationNumber)
                            put("address", address)
                            put("contactPerson", contactPerson)
                            put("phoneNumber", phoneNumber)
                            put("email", email)
                            put("isVerified", false)
                            put("userId", uid ?: "")
                            put("createdAt", com.google.firebase.Timestamp.now())
                        }

                        // Use merge to avoid overwriting existing data
                        firestore.collection("ngos")
                            .document(uid ?: "")
                            .set(ngoData, com.google.firebase.firestore.SetOptions.merge())
                            .addOnSuccessListener {
                                isUploading = false
                                // Navigate directly to dashboard
                                navController.navigate("BlueCarbonDashboard") {
                                    popUpTo(0) { inclusive = false }
                                }
                            }
                            .addOnFailureListener { e ->
                                isUploading = false
                                // Try to navigate anyway - data might be saved
                                navController.navigate("BlueCarbonDashboard") {
                                    popUpTo(0) { inclusive = false }
                                }
                                // Show error but don't block navigation
                                AppUtil.showtoast(context, "Note: ${e.message}")
                            }
                    } else {
                        AppUtil.showtoast(context, "Please fill all fields and upload all documents")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = primaryBlue),
                shape = RoundedCornerShape(16.dp),
                enabled = !isUploading && ngoName.isNotEmpty() && registrationNumber.isNotEmpty() &&
                        address.isNotEmpty() && contactPerson.isNotEmpty() &&
                        phoneNumber.isNotEmpty() && email.isNotEmpty() &&
                        registrationDocUri != null && taxExemptDocUri != null &&
                        bankStatementUri != null
            ) {
                if (isUploading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text(
                        "Submit for Verification",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun DocumentUploadCard(
    title: String,
    documentUri: Uri?,
    onDocumentSelected: (Uri) -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    val context = LocalContext.current
    val launcher = androidx.activity.compose.rememberLauncherForActivityResult(
        contract = androidx.activity.result.contract.ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { onDocumentSelected(it) }
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = color, modifier = Modifier.size(32.dp))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                if (documentUri != null) {
                    Text(
                        "Document uploaded",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2E7D32) // Dark Green for visibility
                    )
                }
            }
            OutlinedButton(
                onClick = {
                    launcher.launch("*/*") // Allow all file types, or specific like "application/pdf"
                }
            ) {
                Text(if (documentUri != null) "Change" else "Upload")
            }
        }
    }
}



fun uploadNgoDocuments(
    context: android.content.Context,
    uid: String,
    ngoName: String,
    registrationNumber: String,
    address: String,
    contactPerson: String,
    phoneNumber: String,
    email: String,
    registrationDoc: Uri,
    taxExemptDoc: Uri,
    bankStatement: Uri,
    onComplete: () -> Unit
) {
    val storage = FirebaseStorage.getInstance()
    val firestore = Firebase.firestore

    CoroutineScope(Dispatchers.Main).launch {
        // Compress images
        val regBytes = ImageUtils.compressImage(context, registrationDoc)
        val taxBytes = ImageUtils.compressImage(context, taxExemptDoc)
        val bankBytes = ImageUtils.compressImage(context, bankStatement)

        if (regBytes == null || taxBytes == null || bankBytes == null) {
            AppUtil.showtoast(context, "Failed to process documents")
            return@launch
        }

        // Upload documents in parallel
        val registrationRef = storage.reference.child("ngos/$uid/registration.jpg")
        val taxExemptRef = storage.reference.child("ngos/$uid/tax_exempt.jpg")
        val bankStatementRef = storage.reference.child("ngos/$uid/bank_statement.jpg")

        val task1 = registrationRef.putBytes(regBytes)
        val task2 = taxExemptRef.putBytes(taxBytes)
        val task3 = bankStatementRef.putBytes(bankBytes)

        Tasks.whenAll(task1, task2, task3)
            .addOnSuccessListener {
                // All uploads successful, save NGO data
                val ngoData = hashMapOf<String, Any>(
                    "name" to ngoName,
                    "registrationNumber" to registrationNumber,
                    "address" to address,
                    "contactPerson" to contactPerson,
                    "phoneNumber" to phoneNumber,
                    "email" to email,
                    "isVerified" to false,
                    "userId" to uid,
                    "createdAt" to com.google.firebase.Timestamp.now()
                )

                firestore.collection("ngos")
                    .document(uid)
                    .set(ngoData)
                    .addOnSuccessListener {
                        onComplete()
                    }
                    .addOnFailureListener {
                        AppUtil.showtoast(context, "Failed to save data: ${it.message}")
                    }
            }
            .addOnFailureListener {
                AppUtil.showtoast(context, "Upload failed: ${it.message}")
            }
    }
}

