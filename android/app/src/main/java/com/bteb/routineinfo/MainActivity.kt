package com.bteb.routineinfo

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.bteb.routineinfo.data.model.RoutineEntity
import com.bteb.routineinfo.ui.screens.*
import com.bteb.routineinfo.ui.theme.RoutineinfoTheme
import com.bteb.routineinfo.ui.viewmodel.RoutineViewModel
import java.util.UUID

class MainActivity : AppCompatActivity() {

    private val viewModel: RoutineViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()

        // Check intent for routineId if opened via notification click
        val notificationRoutineId = intent.getStringExtra("routineId")

        setContent {
            val userSettings by viewModel.userSettings.collectAsState()
            val notifications by viewModel.notifications.collectAsState()
            val routines by viewModel.routines.collectAsState()
            val selectedDay by viewModel.selectedDay.collectAsState()

            val isDarkTheme = when (userSettings.themeMode) {
                "dark" -> true
                "light" -> false
                else -> isSystemInDarkTheme()
            }

            var isAddEditOpen by remember { mutableStateOf(false) }
            var editingRoutine by remember { mutableStateOf<RoutineEntity?>(null) }
            var detailsRoutine by remember { mutableStateOf<RoutineEntity?>(null) }
            var isSettingsOpen by remember { mutableStateOf(false) }
            var isNotificationsOpen by remember { mutableStateOf(false) }
            var isBtebHubOpen by remember { mutableStateOf(false) }

            // Handle notification routine click
            LaunchedEffect(notificationRoutineId, routines) {
                if (!notificationRoutineId.isNull_orEmpty() && routines.isNotEmpty()) {
                    val found = routines.find { it.id == notificationRoutineId }
                    if (found != null) {
                        detailsRoutine = found
                    }
                }
            }

            RoutineinfoTheme(darkTheme = isDarkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HomeScreen(
                        viewModel = viewModel,
                        onOpenAddRoutine = {
                            editingRoutine = null
                            isAddEditOpen = true
                        },
                        onOpenEditRoutine = { routine ->
                            editingRoutine = routine
                            isAddEditOpen = true
                        },
                        onOpenDetails = { routine ->
                            detailsRoutine = routine
                        },
                        onOpenSettings = { isSettingsOpen = true },
                        onOpenNotifications = { isNotificationsOpen = true },
                        onOpenBtebHub = { isBtebHubOpen = true }
                    )

                    if (isAddEditOpen) {
                        RoutineAddEditDialog(
                            editingRoutine = editingRoutine,
                            defaultDay = selectedDay,
                            onDismiss = { isAddEditOpen = false },
                            onSave = { savedRoutine ->
                                viewModel.saveRoutine(savedRoutine)
                            }
                        )
                    }

                    detailsRoutine?.let { routine ->
                        ClassDetailsDialog(
                            routine = routine,
                            onDismiss = { detailsRoutine = null },
                            onEdit = {
                                editingRoutine = routine
                                isAddEditOpen = true
                            },
                            onDelete = {
                                viewModel.deleteRoutine(routine.id)
                            }
                        )
                    }

                    if (isSettingsOpen) {
                        SettingsDialog(
                            userSettings = userSettings,
                            viewModel = viewModel,
                            onDismiss = { isSettingsOpen = false }
                        )
                    }

                    if (isNotificationsOpen) {
                        NotificationHistoryDialog(
                            notifications = notifications,
                            onDismiss = { isNotificationsOpen = false },
                            onClearHistory = { viewModel.clearNotificationHistory() }
                        )
                    }

                    if (isBtebHubOpen) {
                        BtebBooklistDialog(
                            onDismiss = { isBtebHubOpen = false },
                            onSelectBook = { book ->
                                editingRoutine = RoutineEntity(
                                    id = UUID.randomUUID().toString(),
                                    subjectName = book.name,
                                    code = book.code,
                                    day = selectedDay,
                                    startTime = "08:00 AM",
                                    endTime = "08:45 AM",
                                    room = "Lab 101"
                                )
                                isAddEditOpen = true
                            }
                        )
                    }
                }
            }
        }
    }
}

private fun String?.isNull_orEmpty(): Boolean = this == null || this.isEmpty()
