package com.bteb.routineinfo.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("code")
    val code: String = "",

    @SerializedName("subjectName")
    val subjectName: String,

    @SerializedName("day")
    val day: String, // Sunday, Monday, Tuesday, Wednesday, Thursday

    @SerializedName("startTime")
    val startTime: String, // e.g. "08:00 AM"

    @SerializedName("endTime")
    val endTime: String,   // e.g. "09:30 AM"

    @SerializedName("room")
    val room: String = "",

    @SerializedName("teacherName")
    val teacherName: String = "",

    @SerializedName("teacherPhone")
    val teacherPhone: String? = null,

    @SerializedName("shift")
    val shift: String? = "Morning Shift",

    @SerializedName("group")
    val group: String? = null, // "A", "B", "C"

    @SerializedName("color")
    val color: String? = null,

    @SerializedName("note")
    val note: String? = null
)
