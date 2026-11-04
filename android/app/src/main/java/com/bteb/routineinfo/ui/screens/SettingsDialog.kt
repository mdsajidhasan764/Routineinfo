package com.bteb.routineinfo.ui.screens

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bteb.routineinfo.data.preferences.UserSettings
import com.bteb.routineinfo.ui.theme.Emerald600
import com.bteb.routineinfo.ui.viewmodel.RoutineViewModel

@Composable
fun SettingsDialog(
    userSettings: UserSettings,
    viewModel: RoutineViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var departmentName by remember { mutableStateOf(userSettings.departmentName) }
    var semesterName by remember { mutableStateOf(userSettings.semesterName) }
    var shift by remember { mutableStateOf(userSettings.shift) }
    var notificationsEnabled by remember { mutableStateOf(userSettings.notificationsEnabled) }

    val exportJsonLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        uri?.let {
            context.contentResolver.openOutputStream(it)?.let { outputStream ->
                viewModel.exportBackupToJson(outputStream)
                Toast.makeText(context, "JSON Backup Exported Successfully!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    val importJsonLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            context.contentResolver.openInputStream(it)?.let { inputStream ->
                viewModel.importBackupFromJson(
                    inputStream = inputStream,
                    onSuccess = { Toast.makeText(context, "Backup Restored Successfully!", Toast.LENGTH_SHORT).show() },
                    onError = { Toast.makeText(context, "Failed to import JSON backup file", Toast.LENGTH_SHORT).show() }
                )
            }
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    viewModel.updateUserSettings(
                        deptName = departmentName.trim(),
                        semesterName = semesterName.trim(),
                        shift = shift.trim(),
                        notificationsEnabled = notificationsEnabled
                    )
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
            ) {
                Text("Save Settings", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = {
            Text("Settings & Customization", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = departmentName,
                    onValueChange = { departmentName = it },
                    label = { Text("Department Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = semesterName,
                    onValueChange = { semesterName = it },
                    label = { Text("Semester") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = shift,
                    onValueChange = { shift = it },
                    label = { Text("Shift (Morning Shift / Day Shift)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Push Notifications", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { notificationsEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = Emerald600)
                    )
                }

                Divider(modifier = Modifier.padding(vertical = 4.dp))

                Text("JSON Backup & Restore", fontSize = 14.sp, fontWeight = FontWeight.Bold)

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { exportJsonLauncher.launch("routineinfo_backup_${System.currentTimeMillis()}.json") },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Export JSON", fontSize = 11.sp)
                    }
                    OutlinedButton(
                        onClick = { importJsonLauncher.launch("application/json") },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Import JSON", fontSize = 11.sp)
                    }
                }

                Divider(modifier = Modifier.padding(vertical = 4.dp))

                Button(
                    onClick = {
                        viewModel.clearAllRoutines()
                        Toast.makeText(context, "All class routines cleared", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.85f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Clear All Class Routines", color = Color.White)
                }
            }
        },
        shape = RoundedCornerShape(20.dp)
    )
}
