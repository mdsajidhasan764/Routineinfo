package com.bteb.routineinfo.ui.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bteb.routineinfo.RoutineApplication
import com.bteb.routineinfo.data.model.NotificationEntity
import com.bteb.routineinfo.data.model.RoutineEntity
import com.bteb.routineinfo.data.preferences.UserSettings
import com.bteb.routineinfo.notification.AlarmScheduler
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.InputStream
import java.io.OutputStream
import java.util.Calendar

data class LiveRoutineStatus(
    val currentClass: RoutineEntity? = null,
    val progressPercent: Int = 0,
    val minutesRemainingInClass: Int = 0,
    val nextClass: RoutineEntity? = null,
    val minutesUntilNextClass: Int = 0,
    val isWeekend: Boolean = false,
    val allCompleted: Boolean = false
)

class RoutineViewModel(application: Application) : AndroidViewModel(application) {

    private val app = getApplication<RoutineApplication>()
    private val routineDao = app.database.routineDao()
    private val notificationDao = app.database.notificationDao()
    private val userPrefs = app.userPreferencesRepository

    val routinesFlow: StateFlow<List<RoutineEntity>> = MutableStateFlow(emptyList())
    private val _routines = MutableStateFlow<List<RoutineEntity>>(emptyList())
    val routines = _routines.asStateFlow()

    private val _userSettings = MutableStateFlow(UserSettings())
    val userSettings = _userSettings.asStateFlow()

    private val _notifications = MutableStateFlow<List<NotificationEntity>>(emptyList())
    val notifications = _notifications.asStateFlow()

    private val _liveStatus = MutableStateFlow(LiveRoutineStatus())
    val liveStatus = _liveStatus.asStateFlow()

    private val _selectedDay = MutableStateFlow("Sunday")
    val selectedDay = _selectedDay.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    init {
        viewModelScope.launch {
            userPrefs.userSettingsFlow.collect { settings ->
                _userSettings.value = settings
                updateSelectedDayBasedOnShift(settings.shift)
            }
        }

        viewModelScope.launch {
            routineDao.getAllRoutines().collect { list ->
                _routines.value = list
                calculateLiveStatus(list)
                AlarmScheduler.scheduleAllRoutines(getApplication(), list)
            }
        }

        viewModelScope.launch {
            val sevenDaysAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000L)
            notificationDao.getRecentNotifications(sevenDaysAgo).collect { list ->
                _notifications.value = list
            }
        }
    }

    fun setSelectedDay(day: String) {
        _selectedDay.value = day
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun saveRoutine(routine: RoutineEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            routineDao.insertRoutine(routine)
        }
    }

    fun deleteRoutine(routineId: String) {
        viewModelScope.launch(Dispatchers.IO) {
            routineDao.deleteRoutineById(routineId)
        }
    }

    fun clearAllRoutines() {
        viewModelScope.launch(Dispatchers.IO) {
            routineDao.clearAll()
        }
    }

    fun updateUserSettings(
        deptSlug: String? = null,
        deptName: String? = null,
        semester: Int? = null,
        semesterName: String? = null,
        shift: String? = null,
        institute: String? = null,
        pinCode: String? = null,
        biometricEnabled: Boolean? = null,
        themeMode: String? = null,
        notificationsEnabled: Boolean? = null
    ) {
        viewModelScope.launch {
            userPrefs.updateSettings(
                departmentSlug = deptSlug,
                departmentName = deptName,
                semester = semester,
                semesterName = semesterName,
                shift = shift,
                instituteName = institute,
                pinCode = pinCode,
                isBiometricEnabled = biometricEnabled,
                themeMode = themeMode,
                notificationsEnabled = notificationsEnabled
            )
        }
    }

    fun clearNotificationHistory() {
        viewModelScope.launch(Dispatchers.IO) {
            notificationDao.clearHistory()
        }
    }

    // JSON Backup Export
    fun exportBackupToJson(outputStream: OutputStream) {
        viewModelScope.launch(Dispatchers.IO) {
            val routinesList = _routines.value
            val gson = Gson()
            val jsonString = gson.toJson(routinesList)
            outputStream.use { it.write(jsonString.toByteArray(Charsets.UTF_8)) }
        }
    }

    // JSON Backup Import
    fun importBackupFromJson(inputStream: InputStream, onSuccess: () -> Unit, onError: () -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val jsonString = inputStream.bufferedReader().use { it.readText() }
                val type = object : TypeToken<List<RoutineEntity>>() {}.type
                val importedList: List<RoutineEntity> = Gson().fromJson(jsonString, type)
                if (importedList.isNotEmpty()) {
                    routineDao.clearAll()
                    routineDao.insertAll(importedList)
                    launch(Dispatchers.Main) { onSuccess() }
                } else {
                    launch(Dispatchers.Main) { onError() }
                }
            } catch (e: Exception) {
                launch(Dispatchers.Main) { onError() }
            }
        }
    }

    private var isInitialDaySet = false

    private fun updateSelectedDayBasedOnShift(shift: String) {
        if (isInitialDaySet) return
        isInitialDaySet = true

        val calendar = Calendar.getInstance()
        val dayIndex = calendar.get(Calendar.DAY_OF_WEEK) // Sunday = 1, Thursday = 5, Fri = 6, Sat = 7

        val targetDay = when (dayIndex) {
            Calendar.FRIDAY, Calendar.SATURDAY -> "Sunday"
            Calendar.SUNDAY -> "Sunday"
            Calendar.MONDAY -> "Monday"
            Calendar.TUESDAY -> "Tuesday"
            Calendar.WEDNESDAY -> "Wednesday"
            Calendar.THURSDAY -> "Thursday"
            else -> "Sunday"
        }
        _selectedDay.value = targetDay
    }

    private fun calculateLiveStatus(allRoutines: List<RoutineEntity>) {
        val calendar = Calendar.getInstance()
        val dayIndex = calendar.get(Calendar.DAY_OF_WEEK)
        if (dayIndex == Calendar.FRIDAY || dayIndex == Calendar.SATURDAY) {
            _liveStatus.value = LiveRoutineStatus(isWeekend = true)
            return
        }

        val todayName = when (dayIndex) {
            Calendar.SUNDAY -> "Sunday"
            Calendar.MONDAY -> "Monday"
            Calendar.TUESDAY -> "Tuesday"
            Calendar.WEDNESDAY -> "Wednesday"
            Calendar.THURSDAY -> "Thursday"
            else -> "Sunday"
        }

        val todayRoutines = allRoutines.filter { it.day == todayName }
            .sortedBy { parseTimeToMinutes(it.startTime) ?: 0 }

        val currentMinutes = calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE)

        var currentClass: RoutineEntity? = null
        var progressPercent = 0
        var minutesRemainingInClass = 0
        var nextClass: RoutineEntity? = null
        var minutesUntilNext = Int.MAX_VALUE

        for (item in todayRoutines) {
            val start = parseTimeToMinutes(item.startTime) ?: continue
            val end = parseTimeToMinutes(item.endTime) ?: continue

            if (currentMinutes in start until end) {
                currentClass = item
                val duration = (end - start).coerceAtLeast(1)
                val elapsed = (currentMinutes - start).coerceIn(0, duration)
                progressPercent = ((elapsed.toFloat() / duration) * 100).toInt()
                minutesRemainingInClass = end - currentMinutes
            } else if (start > currentMinutes) {
                val diff = start - currentMinutes
                if (diff < minutesUntilNext) {
                    minutesUntilNext = diff
                    nextClass = item
                }
            }
        }

        val allCompleted = todayRoutines.isNotEmpty() && currentClass == null && nextClass == null

        _liveStatus.value = LiveRoutineStatus(
            currentClass = currentClass,
            progressPercent = progressPercent,
            minutesRemainingInClass = minutesRemainingInClass,
            nextClass = nextClass,
            minutesUntilNextClass = if (minutesUntilNext == Int.MAX_VALUE) 0 else minutesUntilNext,
            isWeekend = false,
            allCompleted = allCompleted
        )
    }

    private fun parseTimeToMinutes(timeStr: String): Int? {
        return try {
            val cleaned = timeStr.trim().uppercase()
            val isPm = cleaned.contains("PM")
            val isAm = cleaned.contains("AM")
            val timeDigits = cleaned.replace("AM", "").replace("PM", "").trim()
            val parts = timeDigits.split(":")
            var hour = parts[0].trim().toInt()
            val minute = parts[1].trim().toInt()
            if (isPm && hour < 12) hour += 12
            if (isAm && hour == 12) hour = 0
            hour * 60 + minute
        } catch (e: Exception) {
            null
        }
    }
}
