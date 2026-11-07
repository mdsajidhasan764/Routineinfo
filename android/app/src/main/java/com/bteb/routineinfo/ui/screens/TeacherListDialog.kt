package com.bteb.routineinfo.ui.screens

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.view.WindowManager
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.SecureFlagPolicy
import com.bteb.routineinfo.ui.theme.Emerald600

data class NativeTeacherItem(
    val name: String,
    val department: String,
    val designation: String,
    val phone: String,
    val email: String,
    val gender: String = "Sir"
)

val JPI_SAMPLE_TEACHERS = listOf(
    NativeTeacherItem("Sheikh Mustafizur Rahman", "Administration & Principal Office", "Vice Principal & Principal (Addl. Duty)", "01711061390", "jashorepoly1964@gmail.com", "Sir"),
    NativeTeacherItem("Md. Rabiul Alam", "Mechanical Technology", "Chief Instructor & Academic In-Charge", "01712061391", "eng.rabiul91@gmail.com", "Sir"),
    NativeTeacherItem("Engr. Md. Abdul Alim", "Civil Technology", "Chief Instructor (Civil)", "01713061392", "abdulalim@gmail.com", "Sir"),
    NativeTeacherItem("Engr. Md. Waliar Rahman", "Electrical Technology", "Chief Instructor (Electrical)", "01714061393", "waliar@gmail.com", "Sir"),
    NativeTeacherItem("Roksana Khatun", "Computer Science & Technology", "Chief Instructor (Computer)", "01715061394", "roksana@gmail.com", "Ma'am"),
    NativeTeacherItem("Md. Mahbubur Rahman", "Power Technology", "Chief Instructor (Power)", "01716061395", "mahbubur@gmail.com", "Sir"),
    NativeTeacherItem("Engr. Sheikh Ahsan Kabir", "Electronics Technology", "Chief Instructor (Electronics)", "01717061396", "ahsankabir@gmail.com", "Sir"),
    NativeTeacherItem("Md. Faruk Hossain", "Telecommunication Technology", "Chief Instructor (Telecom)", "01718061397", "faruk@gmail.com", "Sir"),
    NativeTeacherItem("Zebun Nahar Khan", "Non-Tech Department", "Instructor (English)", "01720061399", "zebun@gmail.com", "Ma'am"),
    NativeTeacherItem("Kaniz Fatima", "Non-Tech Department", "Instructor (Physics)", "01722061401", "kaniz@gmail.com", "Ma'am"),
    NativeTeacherItem("Chandan Basu", "Non-Tech / RAC Technology", "Junior Instructor (RAC & Thermal)", "01724061403", "chandan@gmail.com", "Sir"),
    NativeTeacherItem("Md. Maruf Hasan", "Non-Tech / RAC Technology", "Junior Instructor (RAC Lab)", "01725061404", "maruf@gmail.com", "Sir")
)

val DEPT_TABS = listOf("All", "Computer", "Civil", "Electrical", "Mechanical", "Power", "Electronics", "Telecom", "Non-Tech", "RAC", "Admin")

@Composable
fun TeacherListDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val activity = context as? Activity

    // Android Security Flag (FLAG_SECURE) ensures screenshots and screen recording are completely blocked by Android OS
    DisposableEffect(Unit) {
        activity?.window?.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
        onDispose {
            activity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }

    val filteredList = remember(searchQuery, selectedCategory) {
        val q = searchQuery.trim().lowercase()
        val cat = selectedCategory.lowercase()
        JPI_SAMPLE_TEACHERS.filter { t ->
            val matchesCategory = when (cat) {
                "all" -> true
                "non-tech" -> t.department.lowercase().contains("non-tech") || t.department.lowercase().contains("rac")
                "rac" -> t.department.lowercase().contains("rac") || t.department.lowercase().contains("mechanical")
                else -> t.department.lowercase().contains(cat)
            }
            val matchesSearch = q.isEmpty() ||
                t.name.lowercase().contains(q) ||
                t.department.lowercase().contains(q) ||
                t.designation.lowercase().contains(q) ||
                t.phone.contains(q)

            matchesCategory && matchesSearch
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            securePolicy = SecureFlagPolicy.SECURE_ON // Enforces Android OS FLAG_SECURE on Dialog window
        )
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.background,
            tonalElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header with Security Shield Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Teacher List",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Emerald600.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "🔒 Protected",
                                    color = Emerald600,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Source: jashore.polytech.gov.bd",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                // Android Security Notice
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color.Black.copy(alpha = 0.05f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Lock,
                            contentDescription = "Secure",
                            tint = Emerald600,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Screenshots and screen recording are blocked (FLAG_SECURE)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f)
                        )
                    }
                }

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search teacher name, department, phone...", fontSize = 12.sp) },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", modifier = Modifier.size(18.dp)) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    shape = RoundedCornerShape(12.dp)
                )

                // Category Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp)
                ) {
                    items(DEPT_TABS) { category ->
                        val isSelected = selectedCategory.equals(category, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedCategory = category },
                            label = { Text(category, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Emerald600,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                // Teachers Count
                Text(
                    text = "Showing ${filteredList.size} teachers",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                // Teachers List
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredList) { teacher ->
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = teacher.name,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = teacher.department,
                                            fontSize = 11.sp,
                                            color = Emerald600,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Text(
                                            text = teacher.designation,
                                            fontSize = 11.sp,
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                        )
                                    }

                                    Text(
                                        text = if (teacher.gender == "Sir") "👨‍🏫 Sir" else "👩‍🏫 Ma'am",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.Phone,
                                            contentDescription = "Phone",
                                            tint = Emerald600,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = teacher.phone,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }

                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        // Call Button
                                        Button(
                                            onClick = {
                                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${teacher.phone}"))
                                                context.startActivity(intent)
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.height(30.dp)
                                        ) {
                                            Text("Call", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }

                                        // Copy Button
                                        OutlinedButton(
                                            onClick = {
                                                clipboardManager.setText(AnnotatedString(teacher.phone))
                                                Toast.makeText(context, "Phone number copied", Toast.LENGTH_SHORT).show()
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            modifier = Modifier.height(30.dp)
                                        ) {
                                            Text("Copy", fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
