package com.bteb.routineinfo.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
import com.bteb.routineinfo.data.model.RoutineEntity
import com.bteb.routineinfo.ui.theme.Emerald600

@Composable
fun ClassDetailsDialog(
    routine: RoutineEntity,
    onDismiss: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = Emerald600)
            }
        },
        dismissButton = {
            Row {
                TextButton(onClick = {
                    onDismiss()
                    onEdit()
                }) {
                    Text("Edit")
                }
                TextButton(onClick = {
                    onDismiss()
                    onDelete()
                }) {
                    Text("Delete", color = Color.Red)
                }
            }
        },
        title = {
            Column {
                Text(
                    text = routine.subjectName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                if (routine.code.isNotBlank()) {
                    Text(
                        text = "Subject Code: ${routine.code}",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                DetailRow(icon = Icons.Default.CalendarToday, label = "Day", value = routine.day)
                DetailRow(
                    icon = Icons.Default.Schedule,
                    label = "Time",
                    value = "${routine.startTime} – ${routine.endTime}"
                )
                if (routine.room.isNotBlank()) {
                    DetailRow(icon = Icons.Default.LocationOn, label = "Room", value = routine.room)
                }
                if (routine.shift != null) {
                    DetailRow(icon = Icons.Default.WbSunny, label = "Shift", value = routine.shift)
                }
                if (!routine.teacherName.isBlank()) {
                    DetailRow(icon = Icons.Default.Person, label = "Teacher", value = routine.teacherName)
                }
                routine.teacherPhone?.let { phone ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp), tint = Emerald600)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Phone: ", fontSize = 13.sp, color = Color.Gray)
                            Text(
                                text = phone,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald600,
                                modifier = Modifier.clickable {
                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
                                    context.startActivity(intent)
                                }
                            )
                        }
                        IconButton(onClick = {
                            clipboardManager.setText(AnnotatedString(phone))
                            Toast.makeText(context, "Copied phone number", Toast.LENGTH_SHORT).show()
                        }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(14.dp))
                        }
                    }
                }
            }
        },
        shape = RoundedCornerShape(20.dp)
    )
}

@Composable
private fun DetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.Gray)
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "$label: ", fontSize = 13.sp, color = Color.Gray)
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}
