package com.bteb.routineinfo.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_settings")

data class UserSettings(
    val departmentSlug: String = "computer",
    val departmentName: String = "Computer Science & Technology",
    val semester: Int = 5,
    val semesterName: String = "5th Semester",
    val shift: String = "Morning Shift",
    val instituteName: String = "Polytechnic Institute",
    val pinCode: String? = null,
    val isBiometricEnabled: Boolean = false,
    val themeMode: String = "light",
    val notificationsEnabled: Boolean = true,
    val notifyOnStart: Boolean = true,
    val notifyOnEnd: Boolean = true,
    val soundEnabled: Boolean = true
)

class UserPreferencesRepository(private val context: Context) {

    private object PreferencesKeys {
        val DEPARTMENT_SLUG = stringPreferencesKey("department_slug")
        val DEPARTMENT_NAME = stringPreferencesKey("department_name")
        val SEMESTER = intPreferencesKey("semester")
        val SEMESTER_NAME = stringPreferencesKey("semester_name")
        val SHIFT = stringPreferencesKey("shift")
        val INSTITUTE_NAME = stringPreferencesKey("institute_name")
        val PIN_CODE = stringPreferencesKey("pin_code")
        val IS_BIOMETRIC_ENABLED = booleanPreferencesKey("is_biometric_enabled")
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
        val NOTIFY_ON_START = booleanPreferencesKey("notify_on_start")
        val NOTIFY_ON_END = booleanPreferencesKey("notify_on_end")
        val SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
    }

    val userSettingsFlow: Flow<UserSettings> = context.dataStore.data.map { prefs ->
        UserSettings(
            departmentSlug = prefs[PreferencesKeys.DEPARTMENT_SLUG] ?: "computer",
            departmentName = prefs[PreferencesKeys.DEPARTMENT_NAME] ?: "Computer Science & Technology",
            semester = prefs[PreferencesKeys.SEMESTER] ?: 5,
            semesterName = prefs[PreferencesKeys.SEMESTER_NAME] ?: "5th Semester",
            shift = prefs[PreferencesKeys.SHIFT] ?: "Morning Shift",
            instituteName = prefs[PreferencesKeys.INSTITUTE_NAME] ?: "Polytechnic Institute",
            pinCode = prefs[PreferencesKeys.PIN_CODE],
            isBiometricEnabled = prefs[PreferencesKeys.IS_BIOMETRIC_ENABLED] ?: false,
            themeMode = prefs[PreferencesKeys.THEME_MODE] ?: "light",
            notificationsEnabled = prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] ?: true,
            notifyOnStart = prefs[PreferencesKeys.NOTIFY_ON_START] ?: true,
            notifyOnEnd = prefs[PreferencesKeys.NOTIFY_ON_END] ?: true,
            soundEnabled = prefs[PreferencesKeys.SOUND_ENABLED] ?: true
        )
    }

    suspend fun updateSettings(
        departmentSlug: String? = null,
        departmentName: String? = null,
        semester: Int? = null,
        semesterName: String? = null,
        shift: String? = null,
        instituteName: String? = null,
        pinCode: String? = null,
        isBiometricEnabled: Boolean? = null,
        themeMode: String? = null,
        notificationsEnabled: Boolean? = null,
        notifyOnStart: Boolean? = null,
        notifyOnEnd: Boolean? = null,
        soundEnabled: Boolean? = null
    ) {
        context.dataStore.edit { prefs ->
            departmentSlug?.let { prefs[PreferencesKeys.DEPARTMENT_SLUG] = it }
            departmentName?.let { prefs[PreferencesKeys.DEPARTMENT_NAME] = it }
            semester?.let { prefs[PreferencesKeys.SEMESTER] = it }
            semesterName?.let { prefs[PreferencesKeys.SEMESTER_NAME] = it }
            shift?.let { prefs[PreferencesKeys.SHIFT] = it }
            instituteName?.let { prefs[PreferencesKeys.INSTITUTE_NAME] = it }
            pinCode?.let { prefs[PreferencesKeys.PIN_CODE] = it }
            isBiometricEnabled?.let { prefs[PreferencesKeys.IS_BIOMETRIC_ENABLED] = it }
            themeMode?.let { prefs[PreferencesKeys.THEME_MODE] = it }
            notificationsEnabled?.let { prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] = it }
            notifyOnStart?.let { prefs[PreferencesKeys.NOTIFY_ON_START] = it }
            notifyOnEnd?.let { prefs[PreferencesKeys.NOTIFY_ON_END] = it }
            soundEnabled?.let { prefs[PreferencesKeys.SOUND_ENABLED] = it }
        }
    }
}
