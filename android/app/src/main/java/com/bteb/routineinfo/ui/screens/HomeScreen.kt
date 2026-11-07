package com.bteb.routineinfo.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bteb.routineinfo.data.model.RoutineEntity
import com.bteb.routineinfo.ui.theme.Emerald500
import com.bteb.routineinfo.ui.theme.Emerald600
import com.bteb.routineinfo.ui.viewmodel.LiveRoutineStatus
import com.bteb.routineinfo.ui.viewmodel.RoutineViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

val DAYS = listOf("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: RoutineViewModel,
    onOpenAddRoutine: () -> Unit,
    onOpenEditRoutine: (RoutineEntity) -> Unit,
    onOpenDetails: (RoutineEntity) -> Unit,
    onOpenSettings: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenBtebHub: () -> Unit,
    onOpenTeacherList: () -> Unit
) {
    val routines by viewModel.routines.collectAsState()
    val liveStatus by viewModel.liveStatus.collectAsState()
    val selectedDay by viewModel.selectedDay.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val userSettings by viewModel.userSettings.collectAsState()

    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    var isSearchExpanded by remember { mutableStateOf(false) }

    val filteredRoutines = remember(routines, selectedDay, searchQuery) {
        val q = searchQuery.trim().lowercase()
        routines.filter { r ->
            if (q.isNotEmpty()) {
                r.subjectName.lowercase().contains(q) ||
                r.code.lowercase().contains(q) ||
                r.room.lowercase().contains(q) ||
                r.teacherName.lowercase().contains(q) ||
                r.day.lowercase().contains(q)
            } else {
                r.day.equals(selectedDay, ignoreCase = true)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    if (isSearchExpanded) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { viewModel.setSearchQuery(it) },
                            placeholder = { Text("Search class, code, room, teacher...", fontSize = 13.sp) },
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Emerald600,
                                unfocusedBorderColor = Color.Transparent
                            )
                        )
                    } else {
                        Column {
                            Text(
                                text = "Routineinfo",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                            Text(
                                text = "${userSettings.departmentName} · ${userSettings.semesterName}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = {
                        isSearchExpanded = !isSearchExpanded
                        if (!isSearchExpanded) viewModel.setSearchQuery("")
                    }) {
                        Icon(
                            imageVector = if (isSearchExpanded) Icons.Default.Close else Icons.Default.Search,
                            contentDescription = "Search"
                        )
                    }
                    IconButton(onClick = onOpenTeacherList) {
                        Icon(Icons.Default.Person, contentDescription = "Teacher List")
                    }
                    IconButton(onClick = onOpenNotifications) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onOpenAddRoutine,
                containerColor = Emerald600,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Routine")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 12.dp)
        ) {
            // Live Status Card matching attached screenshot design exactly
            LiveStatusCard(liveStatus = liveStatus, totalClassesToday = routines.count { it.day.equals(selectedDay, ignoreCase = true) })

            Spacer(modifier = Modifier.height(10.dp))

            // Day Selector Tabs
            if (searchQuery.isEmpty()) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(DAYS) { day ->
                        val count = routines.count { it.day.equals(day, ignoreCase = true) }
                        val isSelected = selectedDay.equals(day, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.setSelectedDay(day) },
                            label = {
                                Text(
                                    text = "${day.take(3)} ($count)",
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Emerald600,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            // Routine Cards Grid/List
            if (filteredRoutines.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.EventBusy,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (searchQuery.isNotEmpty()) "No matching classes found" else "No classes scheduled for $selectedDay",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredRoutines) { routine ->
                        RoutineCardItem(
                            routine = routine,
                            onCardClick = { onOpenDetails(routine) },
                            onEditClick = { onOpenEditRoutine(routine) },
                            onDeleteClick = { viewModel.deleteRoutine(routine.id) },
                            onCopyPhone = { phone ->
                                clipboardManager.setText(AnnotatedString(phone))
                                Toast.makeText(context, "Phone copied", Toast.LENGTH_SHORT).show()
                            },
                            onCallTeacher = { phone ->
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
                                context.startActivity(intent)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LiveStatusCard(liveStatus: LiveRoutineStatus, totalClassesToday: Int) {
    val currentClass = liveStatus.currentClass
    val nextClass = liveStatus.nextClass
    val timeFormat = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
    val formattedTime = timeFormat.format(Date())

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // Card Header Bar matching user screenshot
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Today · $totalClassesToday classes today",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    fontWeight = FontWeight.Medium
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = Emerald500, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = formattedTime,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            Column(modifier = Modifier.padding(14.dp)) {
                if (currentClass != null) {
                    // In-Session: EXACT match to screenshot layout
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Emerald500.copy(alpha = 0.15f)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Emerald500)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("In Session", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Emerald600)
                            }
                        }
                        if (currentClass.code.isNotBlank()) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "#${currentClass.code}", fontSize = 12.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "· ${liveStatus.minutesRemainingInClass}m remaining", fontSize = 12.sp, color = Color.Gray)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = currentClass.subjectName,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Normal,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "${currentClass.startTime} – ${currentClass.endTime}${if (currentClass.room.isNotBlank()) " · ${currentClass.room}" else ""}",
                        fontSize = 13.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color.Gray
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("${liveStatus.progressPercent}% completed", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                        Text("${liveStatus.minutesRemainingInClass}m remaining", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    LinearProgressIndicator(
                        progress = { liveStatus.progressPercent / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape),
                        color = Emerald500
                    )
                } else if (nextClass != null) {
                    Text(
                        text = "Upcoming Class in ${liveStatus.minutesUntilNextClass}m",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD97706)
                    )
                    Text(
                        text = "${nextClass.subjectName} (${nextClass.startTime})",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                } else if (liveStatus.allCompleted) {
                    Text(
                        text = "All classes for today completed 🎉",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Emerald600
                    )
                } else {
                    Text(
                        text = "No active classes right now",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
fun RoutineCardItem(
    routine: RoutineEntity,
    onCardClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onCopyPhone: (String) -> Unit,
    onCallTeacher: (String) -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCardClick() }
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFFFEF3C7)
                    ) {
                        Text(
                            text = routine.shift ?: "Morning",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFB45309),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    if (!routine.group.isNull_orBlank()) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Color(0xFFEFF6FF)
                        ) {
                            Text(
                                text = "Group ${routine.group}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1D4ED8),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                if (routine.room.isNotBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Color.Red,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(text = routine.room, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = routine.subjectName,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = Emerald600,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${routine.startTime} – ${routine.endTime}",
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Row {
                    IconButton(onClick = onEditClick, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDeleteClick, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red, modifier = Modifier.size(16.dp))
                    }
                }
            }

            if (!routine.teacherName.isBlank() || !routine.teacherPhone.isNull_orBlank()) {
                Divider(modifier = Modifier.padding(vertical = 6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = routine.teacherName.ifBlank { "Teacher" },
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    routine.teacherPhone?.let { phone ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = phone,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald600,
                                modifier = Modifier.clickable { onCallTeacher(phone) }
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copy",
                                tint = Color.Gray,
                                modifier = Modifier
                                    .size(14.dp)
                                    .clickable { onCopyPhone(phone) }
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun String?.isNull_orBlank(): Boolean = this == null || this.isBlank()
