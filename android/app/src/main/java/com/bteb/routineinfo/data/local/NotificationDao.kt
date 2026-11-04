package com.bteb.routineinfo.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.bteb.routineinfo.data.model.NotificationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NotificationDao {

    @Query("SELECT * FROM notification_history WHERE timestamp >= :sevenDaysAgo ORDER BY timestamp DESC")
    fun getRecentNotifications(sevenDaysAgo: Long): Flow<List<NotificationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Query("DELETE FROM notification_history")
    suspend fun clearHistory()

    @Query("DELETE FROM notification_history WHERE timestamp < :cutoffTimestamp")
    suspend fun pruneOldNotifications(cutoffTimestamp: Long)
}
