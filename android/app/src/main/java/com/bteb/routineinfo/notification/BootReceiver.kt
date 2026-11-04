package com.bteb.routineinfo.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.bteb.routineinfo.data.local.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            // Re-schedule routine alarms upon device boot
            val database = AppDatabase.getDatabase(context)
            CoroutineScope(Dispatchers.IO).launch {
                val routines = database.routineDao().getAllRoutines().first()
                AlarmScheduler.scheduleAllRoutines(context, routines)
            }
        }
    }
}
