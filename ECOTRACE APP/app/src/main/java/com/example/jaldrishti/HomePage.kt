
package com.example.jaldrishti

import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable

import androidx.compose.ui.layout.ContentScale
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material.icons.outlined.Vrpano
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import android.util.Log
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.text.KeyboardOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.PaintingStyle.Companion.Stroke
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.input.KeyboardType
import java.time.format.TextStyle

@Composable
fun JalDrishtiApp(navController: NavController) {
    var selectedTab by remember { mutableStateOf(0) }
    Scaffold(
        bottomBar = {
            CompactBottomBar(selectedTab) { selectedTab = it }
        },
        containerColor = Color.White
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedTab) {
                0 -> HomePage(
                    navController = navController,
                    onCardClick = { card ->
                        when (card.routeTag) {
                            "feasibility" -> {
                                navController.navigate("FeasiblePage")
                            }
                            "dashboard" -> {
                                navController.navigate("dashboard")
                            }
                            "armeasurement" -> {
                                navController.navigate("ARMeasurementScreen")
                            }
                            "maintenance" -> {
                                navController.navigate("Notify")
                            }
                            "installer" -> {
                                navController.navigate("vendor")
                            }
                            "awareness" -> {
                                navController.navigate("AwarenessScreen")
                            }
                            else -> {
                                Log.d("ECOTRACE", "Clicked on: ${card.routeTag}")
                            }
                        }
                    }
                )
                1 -> AnalysisScreen(navController)
                2 -> NewsPage()
                3 -> AccountPage(navController)
            }
        }
    }
}

@Composable
fun HomePage(
    navController: NavController,
    onCardClick: (ProjectFeatureCardData) -> Unit
) {
    val primaryBlue = Color(0xFF1565C0)
    val cards = listOf(
        ProjectFeatureCardData("May 30, 2022", "Feasibility", "", 50, Icons.Default.PhoneAndroid, "feasibility"),
        ProjectFeatureCardData("May 30, 2022", "Dashboard", "", 80, Icons.Default.Dashboard, "dashboard"),
        ProjectFeatureCardData("June 02, 2022", "AR Estimation", "", 40, Icons.Outlined.ViewInAr, "ar"),
        ProjectFeatureCardData("June 04, 2022", "Maintenance", "", 92, Icons.Default.Settings, "maintenance"),
        ProjectFeatureCardData("June 10, 2022", "Contact Installer", "", 70, Icons.Default.Person, "installer"),
        ProjectFeatureCardData("June 15, 2022", "Awareness", "", 40, Icons.Default.Info, "awareness")
    )

    var selectedCardIndex by remember { mutableStateOf(-1) }

    Column(
        Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(24.dp)
    ) {
        TopBar(primaryBlue, navController)
        Spacer(Modifier.height(16.dp))
        GreetingText(primaryBlue)
        Spacer(Modifier.height(18.dp))
        SearchBar(primaryBlue)
        Spacer(Modifier.height(16.dp))
        WelcomeCard(primaryBlue)
        Spacer(Modifier.height(24.dp))
        SectionHeader("Features", "view all", primaryBlue)
        Spacer(Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier
        ) {
            itemsIndexed(cards.chunked(2)) { rowIndex, pair ->
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    pair.forEachIndexed { colIndex, card ->
                        FeatureCardSelectable(
                            card = card,
                            isSelected = selectedCardIndex == rowIndex * 2 + colIndex,
                            onClick = {
                                selectedCardIndex = rowIndex * 2 + colIndex
                                onCardClick(card)
                            },
                            highlightColor = primaryBlue,
                            fontSize = 16.sp,
                            iconSize = 30.dp,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (pair.size < 2) Spacer(Modifier.weight(1f))
                }
            }
        }
        Spacer(Modifier.height(18.dp))
    }
}

@Composable
fun TopBar(primaryBlue: Color, navController: NavController) {
    Row(
        Modifier
            .fillMaxWidth()
            .height(60.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = R.drawable.abhi),
            contentDescription = "App Logo",
            modifier = Modifier
                .size(46.dp)
                .align(Alignment.CenterVertically)
        )
        Text(
            "ECOTRACE",
            fontWeight = FontWeight.ExtraBold,
            fontSize = 32.sp,
            color = primaryBlue,
            modifier = Modifier.align(Alignment.CenterVertically)
        )
        IconButton(onClick = { navController.navigate("Notify") }) {
            Icon(
                Icons.Default.Notifications,
                "Notifications",
                tint = primaryBlue,
                modifier = Modifier
                    .size(36.dp)
                    .align(Alignment.CenterVertically)
            )
        }
    }
}

@Composable
fun CompactBottomBar(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    val tabs = listOf(
        "Home" to Icons.Default.Home,
        "Dashboard" to Icons.Default.Dashboard,
        "News" to Icons.Default.Notifications,
        "Account" to Icons.Default.Person
    )
    Surface(
        color = Color.White,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            tabs.forEachIndexed { index, pair ->
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onTabSelected(index) }
                        .padding(vertical = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = pair.second,
                        contentDescription = pair.first,
                        tint = if (selectedTab == index) Color(0xFF1565C0) else Color.Gray,
                        modifier = Modifier.size(28.dp)
                    )
                    Text(
                        text = pair.first,
                        fontSize = 12.sp,
                        color = if (selectedTab == index) Color(0xFF1565C0) else Color.Gray,
                        fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

@Composable
fun FeatureCardSelectable(
    card: ProjectFeatureCardData,
    isSelected: Boolean,
    onClick: () -> Unit,
    highlightColor: Color,
    fontSize: androidx.compose.ui.unit.TextUnit,
    iconSize: androidx.compose.ui.unit.Dp,
    modifier: Modifier = Modifier
) {
    val cardBackground = if (isSelected) highlightColor else Color.White
    val iconAndTitleColor = if (isSelected) Color.White else Color(0xFF1565C0)
    val otherTextColor = if (isSelected) Color.White else Color.Black

    Card(
        modifier = modifier.height(140.dp).clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(cardBackground),
        elevation = CardDefaults.cardElevation(6.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(card.date, color = otherTextColor.copy(alpha = 0.8f), fontSize = 12.sp)
                Icon(
                    Icons.Default.MoreVert,
                    contentDescription = "More options",
                    tint = otherTextColor.copy(alpha = 0.5f),
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(Modifier.height(8.dp))
            Icon(card.icon, contentDescription = null, modifier = Modifier.size(iconSize), tint = iconAndTitleColor)
            Spacer(Modifier.height(8.dp))
            Text(card.title, color = iconAndTitleColor, fontWeight = FontWeight.Bold, fontSize = fontSize, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(card.subtitle, color = otherTextColor, fontSize = fontSize * 0.75f, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.weight(1f))
            Text("Progress", color = otherTextColor, fontSize = 12.sp)
            LinearProgressIndicator(
                progress = { card.progress / 100f },
                color = if (isSelected) Color.White else highlightColor,
                trackColor = Color.Gray.copy(alpha = 0.18f),
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp))
            )
            Spacer(Modifier.height(4.dp))
            Text("${card.progress}%", color = otherTextColor, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun GreetingText(primaryBlue: Color) {
    var userName by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        val uid = FirebaseAuth.getInstance().currentUser?.uid
        if (uid != null) {
            FirebaseFirestore.getInstance().collection("users")
                .document(uid)
                .get()
                .addOnSuccessListener { document ->
                    userName = document.getString("name") ?: "User"
                }
        }
    }

    Text(
        text = "Hi ${if (userName.isNotEmpty()) userName else "User"}!",
        fontWeight = FontWeight.Bold,
        color = primaryBlue,
        fontSize = 22.sp
    )
    Text("Good morning.", fontSize = 15.sp, color = Color.Gray)
}


@Composable
fun SearchBar(primaryBlue: Color) {
    OutlinedTextField(
        value = "",
        onValueChange = {},
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = null, tint = primaryBlue, modifier = Modifier.size(24.dp))
        },
        placeholder = { Text("Search", color = Color.Gray, fontSize = 16.sp) },
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth().height(52.dp),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedBorderColor = Color(0xFFF0F2F5),
            focusedBorderColor = Color(0xFFF0F2F5),
            unfocusedContainerColor = Color(0xFFF8F9FF),
            focusedContainerColor = Color(0xFFF8F9FF)
        ),
        textStyle = LocalTextStyle.current.copy(fontSize = 16.sp)
    )
}

@Composable
fun WelcomeCard(primaryBlue: Color) {
    Card(
        Modifier.fillMaxWidth().height(120.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Row(Modifier.fillMaxSize().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Welcome!", color = primaryBlue, fontWeight = FontWeight.Bold, fontSize = 36.sp)
                Text("Raindrops today,\nresources tomorrow", fontSize = 14.sp,color = Color.Gray)
            }
            Image(
                painter = painterResource(id = R.drawable.nam),
                contentDescription = "Rainwater drop",
                modifier = Modifier
                    .size(84.dp)
                    .padding(8.dp)
            )
        }
    }
}

@Composable
fun SectionHeader(title: String, actionText: String, primaryBlue: Color) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(title, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = primaryBlue)
        Text(actionText, fontSize = 15.sp, color = Color.Gray)
    }
}

@Composable
fun DashboardPage() = Box(
    Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
) {


    Text("Dashboard Page Coming Soon!", fontSize = 24.sp, fontWeight = FontWeight.Bold)


}


data class NewsItem(
    val imageRes: Int,
    val body: String
)

@Composable
fun NewsPage() {
    // Replace R.drawable.image326 with each unique image if available
    val newsData = listOf(
        NewsItem(R.drawable.nw11, "Advanced materials: Standing seam metal roofs are gaining popularity for their high collection efficiency and ease of cleaning, making them an ideal choice for new rainwater harvesting installations."),
        NewsItem(R.drawable.nw12, "Integration with greywater systems: Combining rooftop rainwater harvesting with greywater recycling systems (which treat water from sinks, showers, and laundry) is a trending method to maximize water conservation and significantly reduce overall water usage."),
        NewsItem(R.drawable.nw13, "Mandates and public building adoption: Governments are increasingly mandating rooftop rainwater harvesting in government buildings to meet water conservation goals, as seen in a large-scale initiative in Uttar Pradesh, India."),
        NewsItem(R.drawable.nw14, "Green roof systems: Incorporating vegetation into the rooftop design for rainwater harvesting is becoming more popular, especially in urban areas. This approach provides multiple benefits, including better building insulation and an effective way to collect water."),
        NewsItem(R.drawable.nw15, "Self-maintaining systems: A new trend in system design focuses on making the system \"self-cleaning\" and \"self-maintaining\" by carefully sizing the storage tank and implementing proper overflow provisions, improving long-term functionality and reducing maintenance needs.")
    )

    Column(
        Modifier
            .fillMaxSize()
            .background(Color(0xFFF5FAFF))
    ) {
        Spacer(Modifier.height(20.dp))
        Text(
            text = "News",
            color = Color(0xFF1565C0),
            fontWeight = FontWeight.Bold,
            fontSize = 34.sp,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
        Spacer(Modifier.height(16.dp))
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 14.dp)
        ) {
            items(newsData) { news ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    shape = RoundedCornerShape(18.dp),
                    elevation = CardDefaults.cardElevation(5.dp)
                ) {
                    Column(
                        Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Image(
                            painter = painterResource(id = news.imageRes),
                            contentDescription = null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(190.dp),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            text = news.body,
                            color = Color(0xFF222429),
                            fontSize = 15.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
        }
    }
}


data class AwarenessItem(
    val imageRes: Int,
    val body: String
)

@Composable
fun AwarenessPage() {
    val content = listOf(
        AwarenessItem(R.drawable.aw11, "Community and Government Initiatives: Mentioning nationwide campaigns (like the \"Jal Shakti Abhiyan: Catch the Rain\" program in India) can instill a sense of collective purpose and social responsibility."),
        AwarenessItem(R.drawable.aw12, "Improved Water Quality for Specific Uses: Note that rainwater is naturally soft and free from the salts, minerals, and treatment chemicals found in tap water, making it better for plants and potentially increasing the lifespan of appliances."),
        AwarenessItem(R.drawable.aw13, "Ease of Use with Technology: Position the app as a simple, modern tool that simplifies the process, offering guidance on installation, maintenance schedules, and monitoring of water levels or quality, thus removing the perception that RWH is complicated."),
        AwarenessItem(R.drawable.aw14, "Environmental Responsibility: Stress the positive environmental impact, such as reducing stormwater runoff, minimizing soil erosion, and lessening the strain on natural water bodies like rivers and lakes."),
        AwarenessItem(R.drawable.aw15, "Self-Sufficiency and Drought Resilience: Promote the ability to have an independent, alternative water source during droughts or water shortages, ensuring a reliable supply for non-potable uses like gardening, washing clothes, and flushing toilets."),
        AwarenessItem(R.drawable.aw16, "Combat Water Scarcity: Emphasize that groundwater levels are rapidly depleting, and rainwater harvesting is a vital solution to conserve water and recharge local aquifers."),
    )

    Column(
        Modifier
            .fillMaxSize()
            .background(Color(0xFFF5FAFF))
    ) {
        Spacer(Modifier.height(30.dp))
        Text(
            text = "Awareness",
            color = Color(0xFF1565C0),
            fontWeight = FontWeight.Bold,
            fontSize = 34.sp,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
        Spacer(Modifier.height(16.dp))
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 14.dp)
        ) {
            items(content) { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    shape = RoundedCornerShape(18.dp),
                    elevation = CardDefaults.cardElevation(5.dp)
                ) {
                    Column(
                        Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Image(
                            painter = painterResource(id = item.imageRes),
                            contentDescription = null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(190.dp),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            text = item.body,
                            color = Color(0xFF222429),
                            fontSize = 15.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
        }
    }
}


data class ProjectFeatureCardData(
    val date: String,
    val title: String,
    val subtitle: String,
    val progress: Int,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val routeTag: String
)





data class Vendor(
    val name: String,
    val location: String,
    val phone: String
)

val vendorList = listOf(
    Vendor("AquaPure Solutions", "Kurukshetra", "+91 98123 45678"),
    Vendor("RainSmart Tech", "Thanesar", "+91 99984 32100"),
    Vendor("EcoHarvest Systems", "Yamunanagar", "+91 98765 43210"),
    Vendor("BlueDrop Installers", "Panchkula", "+91 99887 66554"),
    Vendor("GreenFlow Vendors", "Chandigarh", "+91 97654 32123") ,
    Vendor("RainSmart Tech", "Thanesar", "+91 99984 32100"),
    Vendor("EcoHarvest Systems", "Yamunanagar", "+91 98765 43210"),
    Vendor("BlueDrop Installers", "Panchkula", "+91 99887 66554"),
    Vendor("GreenFlow Vendors", "Chandigarh", "+91 97654 32123")
)

@Composable
fun vendor(navController: NavController) {
    val blue = Color(0xFF1565C0)
    val lightBlue = Color(0xFFF5FAFF)
    val cardBg = Color(0xFFE3F6FF)
    var searchQuery by remember { mutableStateOf("") }
    val filteredList = vendorList.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
                it.location.contains(searchQuery, ignoreCase = true) ||
                it.phone.contains(searchQuery, ignoreCase = true)
    }

    Surface(color = lightBlue, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Spacer(Modifier.height(40.dp))
            Text(
                "Vendors Marketplace",
                color = blue,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 2.dp, bottom = 6.dp)
            )
            Spacer(Modifier.height(20.dp))


            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                label = { Text("Search vendors by name, location or phone", fontSize = 14.sp, color = blue) },
                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = blue) },
                textStyle = LocalTextStyle.current.copy(fontSize = 15.sp),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = blue,
                    unfocusedBorderColor = Color(0xFFB0BEC5)
                )
            )
            Spacer(Modifier.height(24.dp))


            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(filteredList.size) { idx ->
                    VendorCardProfessional(filteredList[idx], blue, cardBg)
                    if (idx < filteredList.size - 1) {
                        HorizontalDivider(
                            thickness = 1.dp,
                            modifier = Modifier.padding(start = 8.dp, end = 8.dp)
                                .background(lightBlue)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun VendorCardProfessional(vendor: Vendor, blue: Color, bg: Color) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier
            .fillMaxWidth()
            .background(bg),
        colors = CardDefaults.cardColors(containerColor = bg)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 14.dp)
        ) {
            Text(
                vendor.name,
                color = blue,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            )
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = blue, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(7.dp))
                Text(
                    vendor.location,
                    color = Color(0xFF2874A6),
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp
                )
            }
            Spacer(Modifier.height(5.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Phone, contentDescription = null, tint = blue, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(7.dp))
                Text(
                    vendor.phone,
                    color = Color(0xFF1565C0),
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp
                )
            }
        }
    }
}




@Composable
fun AnalysisScreen(navController: NavController) {
    val blue = Color(0xFF1565C0)
    val lightBlue = Color(0xFFF5FAFF)
    val cardBg = Color(0xFFEDF6FF)
    val orange = Color(0xFFFF8C3E)

    Surface(color = lightBlue, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp)
        ) {
            Spacer(Modifier.height(18.dp))
            Text(
                "Dashboard",
                fontSize = 27.sp,
                fontWeight = FontWeight.Bold,
                color = blue,
                modifier = Modifier.padding(vertical = 8.dp)
            )

            // Range selector row (monthly/yearly)
            Row(
                Modifier.padding(bottom = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = { },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(37.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = blue)
                ) { Icon(Icons.Default.DateRange, null, Modifier.size(19.dp)); Spacer(Modifier.width(5.dp)); Text("Month", fontSize = 13.sp) }
                OutlinedButton(
                    onClick = { },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(37.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = blue)
                ) { Icon(Icons.Default.BarChart, null, Modifier.size(19.dp)); Spacer(Modifier.width(5.dp)); Text("Year", fontSize = 13.sp) }
            }

            // Main improved Graph Card
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(15.dp)) {
                    Text("Rainwater Collection Trend", color = blue, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(Modifier.height(7.dp))
                    FullDashboardGraph()
                }
            }

            Spacer(Modifier.height(19.dp))

            // Info cards row (3 cards)
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(13.dp)
            ) {
                DashboardCard(
                    title = "Annual Water Saving",
                    value = "96,000 L",
                    description = "Liters saved per year",
                    bg = cardBg,
                    textColor = blue
                )
                DashboardCard(
                    title = "Payback Period",
                    value = "3.2 years",
                    description = "Investment return time",
                    bg = cardBg,
                    textColor = orange
                )
                DashboardCard(
                    title = "Tank Level",
                    value = "3,200 L",
                    description = "Current tank status",
                    bg = cardBg,
                    textColor = blue
                )
            }

            Spacer(Modifier.height(13.dp))

            // Tank level progress
            Card(
                shape = RoundedCornerShape(13.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.WaterDrop, contentDescription = null, tint = blue, modifier = Modifier.size(30.dp))
                    Spacer(Modifier.width(13.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Fill Level", color = blue, fontWeight = FontWeight.Medium, fontSize = 15.sp)
                        LinearProgressIndicator(
                            progress = { 0.40f },
                            color = blue,
                            trackColor = Color(0xFFD6E7FB),
                            modifier = Modifier
                                .height(9.dp)
                                .fillMaxWidth()
                        )
                        Spacer(Modifier.height(2.dp))
                        Text("Last filled 5 days ago", fontSize = 12.sp, color = Color.Gray)
                    }
                }
            }

            Spacer(Modifier.height(13.dp))

            // Vendor Connection stat
            Card(
                shape = RoundedCornerShape(11.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
            )
            {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.People, contentDescription = null, tint = orange, modifier = Modifier.size(28.dp))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Nearby Vendors Available", fontWeight = FontWeight.Bold, color = blue)
                        Spacer(Modifier.height(4.dp))
                        Text("5 rainwater vendors matched in dashboard area", fontSize = 13.sp, color = Color(0xFF1976D2))
                    }
                }


            }


            Card(
                shape = RoundedCornerShape(11.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
            )
            {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.WaterDrop, // Or another relevant icon if you have one
                        contentDescription = null,
                        tint = blue,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            "Water Quality Status",
                            fontWeight = FontWeight.Bold,
                            color = blue
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "pH: 7.2 (Optimal)\nTDS: 145 ppm (Safe)",
                            fontSize = 13.sp,
                            color = Color(0xFF388E3C),
                            maxLines = 2
                        )
                    }
                }
            }



        }
    }
}

// Improved graph with more realistic (multi-point/curve)
@Composable
fun FullDashboardGraph() {
    Box(modifier = Modifier.height(100.dp).fillMaxWidth()) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val points = listOf(0.7f, 0.35f, 0.6f, 0.3f, 0.5f, 0.4f, 0.8f)
            val baseY = size.height
            val step = size.width / (points.size - 1)
            val path = androidx.compose.ui.graphics.Path()
            points.forEachIndexed { idx, pt ->
                val px = idx * step
                val py = baseY * pt
                if (idx == 0) path.moveTo(px, py)
                else path.lineTo(px, py)
            }
            path.lineTo(size.width, baseY)
            path.lineTo(0f, baseY)
            path.close()
            drawPath(path, color = Color(0xFF1565C0), alpha = 0.28f)
            drawPath(path, color = Color(0xFF1565C0), style = Stroke(width = 4f))
        }
        // X-axis months labels
        val months = listOf("Jan","Feb","Mar","Apr","May","Jun","Jul")
        Row(modifier = Modifier
            .align(Alignment.BottomCenter)
            .padding(horizontal = 6.dp)
            .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween) {
            months.forEach { m ->
                Text(m, fontSize = 10.sp, color = Color(0xFF1565C0))
            }
        }
    }
}

@Composable
fun DashboardCard(title: String, value: String, description: String, bg: Color, textColor: Color) {
    Card(
        shape = RoundedCornerShape(13.dp),
        colors = CardDefaults.cardColors(containerColor = bg),
        modifier = Modifier
            .height(90.dp)
    ) {
        Column(
            Modifier.padding(horizontal = 11.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(title, color = textColor, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Text(value, color = Color.Black, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Text(description, fontSize = 11.sp, color = Color.Gray)
        }
    }
}

@Composable
fun Arpage(navController: NavController){
    // Redirect to the new AR Boundary Screen
    navController.navigate("ARBoundary")
}
