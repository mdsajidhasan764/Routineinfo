package com.bteb.routineinfo.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "notification_history")
data class NotificationEntity(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("body")
    val body: String,

    @SerializedName("timestamp")
    val timestamp: Long,

    @SerializedName("routineId")
    val routineId: String? = null
)
