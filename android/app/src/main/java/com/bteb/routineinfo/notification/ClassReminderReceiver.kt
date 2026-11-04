package com.bteb.routineinfo.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.bteb.routineinfo.data.local.AppDatabase
import com.bteb.routineinfo.data.model.NotificationEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ClassReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Class Reminder"
        val body = intent.getStringExtra("body") ?: "Class alert"
        val routineId = intent.getStringExtra("routineId")
        val notifId = intent.getIntExtra("notifId", (System.currentTimeMillis() % 100000).toInt())

        NotificationHelper.showNotification(context, notifId, title, body, routineId)

        // Log notification to Room Database for 7-day history log
        val database = AppDatabase.getDatabase(context)
        CoroutineScope(Dispatchers.IO).launch {
            database.notificationDao().insertNotification(
                NotificationEntity(
                    id = "notif_${System.currentTimeMillis()}_${(1000..9999).random()}",
                    title = title,
                    body = body,
                    timestamp = System.currentTimeMillis(),
                    routineId = routineId
                )
            )
        }
    }
}
