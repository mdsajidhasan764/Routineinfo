package com.bteb.routineinfo

import android.app.Application
import com.bteb.routineinfo.data.local.AppDatabase
import com.bteb.routineinfo.data.preferences.UserPreferencesRepository
import com.bteb.routineinfo.notification.NotificationHelper

class RoutineApplication : Application() {

    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }
    val userPreferencesRepository: UserPreferencesRepository by lazy {
        UserPreferencesRepository(this)
    }

    override fun onCreate() {
        super.onCreate()
        NotificationHelper.createNotificationChannel(this)
    }
}
