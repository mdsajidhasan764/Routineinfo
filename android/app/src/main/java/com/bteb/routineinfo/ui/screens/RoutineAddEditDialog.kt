package com.bteb.routineinfo.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bteb.routineinfo.data.model.RoutineEntity
import com.bteb.routineinfo.ui.theme.Emerald600
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoutineAddEditDialog(
    editingRoutine: RoutineEntity?,
    defaultDay: String,
    onDismiss: () -> Unit,
    onSave: (RoutineEntity) -> Unit
) {
    var subjectName by remember { mutableStateOf(editingRoutine?.subjectName ?: "") }
    var code by remember { mutableStateOf(editingRoutine?.code ?: "") }
    var day by remember { mutableStateOf(editingRoutine?.day ?: defaultDay) }
    var startTime by remember { mutableStateOf(editingRoutine?.startTime ?: "08:00 AM") }
    var endTime by remember { mutableStateOf(editingRoutine?.endTime ?: "08:45 AM") }
    var room by remember { mutableStateOf(editingRoutine?.room ?: "") }
    var teacherName by remember { mutableStateOf(editingRoutine?.teacherName ?: "") }
    var teacherPhone by remember { mutableStateOf(editingRoutine?.teacherPhone ?: "") }
    var shift by remember { mutableStateOf(editingRoutine?.shift ?: "Morning Shift") }
    var group by remember { mutableStateOf(editingRoutine?.group ?: "") }

    val scrollState = rememberScrollState()

    fun applyPreset(minutesToAdd: Int) {
        val (h, m, period) = parseTimeComponents(startTime)
        var totalMin = h * 60 + m + minutesToAdd
        val newH24 = (totalMin / 60) % 24
        val newM = totalMin % 60
        val newPeriod = if (newH24 >= 12) "PM" else "AM"
        val newH12 = if (newH24 % 12 == 0) 12 else newH24 % 12
        endTime = String.format("%02d:%02d %s", newH12, newM, newPeriod)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    if (subjectName.isNotBlank()) {
                        val routine = RoutineEntity(
                            id = editingRoutine?.id ?: UUID.randomUUID().toString(),
                            subjectName = subjectName.trim(),
                            code = code.trim(),
                            day = day,
                            startTime = startTime.trim(),
                            endTime = endTime.trim(),
                            room = room.trim(),
                            teacherName = teacherName.trim(),
                            teacherPhone = teacherPhone.trim().ifEmpty { null },
                            shift = shift,
                            group = group.trim().ifEmpty { null }
                        )
                        onSave(routine)
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
            ) {
                Text("Save Class", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = {
            Text(
                text = if (editingRoutine != null) "Edit Class Routine" else "Add Class Routine",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .verticalScroll(scrollState)
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = subjectName,
                    onValueChange = { subjectName = it },
                    label = { Text("Subject Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = code,
                        onValueChange = { code = it },
                        label = { Text("Subject Code") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = room,
                        onValueChange = { room = it },
                        label = { Text("Room / Lab") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                // Presets buttons for auto-calculating theory vs lab end time
                Text(text = "End Time Presets:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(
                        onClick = { applyPreset(40) },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text("Th (+40m)", fontSize = 10.sp)
                    }
                    OutlinedButton(
                        onClick = { applyPreset(45) },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text("Th (+45m)", fontSize = 10.sp)
                    }
                    OutlinedButton(
                        onClick = { applyPreset(120) },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text("Lab (2h)", fontSize = 10.sp)
                    }
                    OutlinedButton(
                        onClick = { applyPreset(135) },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text("Lab (2h15m)", fontSize = 10.sp)
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = startTime,
                        onValueChange = { startTime = it },
                        label = { Text("Start Time") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = endTime,
                        onValueChange = { endTime = it },
                        label = { Text("End Time") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = teacherName,
                    onValueChange = { teacherName = it },
                    label = { Text("Teacher Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = teacherPhone,
                    onValueChange = { teacherPhone = it },
                    label = { Text("Teacher Phone Number") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = shift,
                        onValueChange = { shift = it },
                        label = { Text("Shift") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = group,
                        onValueChange = { group = it },
                        label = { Text("Group (A/B)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        shape = RoundedCornerShape(20.dp)
    )
}

private fun parseTimeComponents(timeStr: String): Triple<Int, Int, String> {
    return try {
        val cleaned = timeStr.trim().uppercase()
        val isPm = cleaned.contains("PM")
        val period = if (isPm) "PM" else "AM"
        val digits = cleaned.replace("AM", "").replace("PM", "").trim()
        val parts = digits.split(":")
        var h = parts[0].trim().toInt()
        val m = parts[1].trim().toInt()
        if (isPm && h < 12) h += 12
        if (!isPm && h == 12) h = 0
        Triple(h, m, period)
    } catch (e: Exception) {
        Triple(8, 0, "AM")
    }
}
