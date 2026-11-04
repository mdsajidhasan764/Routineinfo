package com.bteb.routineinfo.notification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.bteb.routineinfo.data.model.RoutineEntity
import java.util.Calendar

object AlarmScheduler {

    fun scheduleAllRoutines(context: Context, routines: List<RoutineEntity>) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        for (routine in routines) {
            scheduleRoutineAlarm(context, alarmManager, routine, isStart = true)
            scheduleRoutineAlarm(context, alarmManager, routine, isStart = false)
        }
    }

    private fun scheduleRoutineAlarm(
        context: Context,
        alarmManager: AlarmManager,
        routine: RoutineEntity,
        isStart: Boolean
    ) {
        val timeStr = if (isStart) routine.startTime else routine.endTime
        val (hour, minute) = parseTime(timeStr) ?: return
        val dayOfWeekInt = dayNameToCalendarInt(routine.day) ?: return

        val calendar = Calendar.getInstance().apply {
            set(Calendar.DAY_OF_WEEK, dayOfWeekInt)
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)

            if (before(Calendar.getInstance())) {
                add(Calendar.WEEK_OF_YEAR, 1)
            }
        }

        val roomPart = if (routine.room.isNotBlank()) " - ${routine.room}" else ""
        val title = if (isStart) {
            "${routine.subjectName} Class Started At ${routine.startTime}$roomPart"
        } else {
            "${routine.subjectName} Class Ended At ${routine.endTime}$roomPart"
        }
        val body = if (isStart) {
            if (routine.teacherName.isNotBlank()) "Teacher: ${routine.teacherName}" else "Class starting now!"
        } else {
            "Class concluded. Upcoming class soon!"
        }

        val intent = Intent(context, ClassReminderReceiver::class.java).apply {
            putExtra("title", title)
            putExtra("body", body)
            putExtra("routineId", routine.id)
            putExtra("notifId", (routine.id.hashCode() * (if (isStart) 1 else 2)))
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            (routine.id.hashCode() + (if (isStart) 10000 else 20000)),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY * 7,
                pendingIntent
            )
        } catch (e: Exception) {
            // Permission or system limitation safely caught
        }
    }

    private fun parseTime(timeStr: String): Pair<Int, Int>? {
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

            Pair(hour, minute)
        } catch (e: Exception) {
            null
        }
    }

    private fun dayNameToCalendarInt(day: String): Int? {
        return when (day.lowercase().trim()) {
            "sunday" -> Calendar.SUNDAY
            "monday" -> Calendar.MONDAY
            "tuesday" -> Calendar.TUESDAY
            "wednesday" -> Calendar.WEDNESDAY
            "thursday" -> Calendar.THURSDAY
            else -> null
        }
    }
}
