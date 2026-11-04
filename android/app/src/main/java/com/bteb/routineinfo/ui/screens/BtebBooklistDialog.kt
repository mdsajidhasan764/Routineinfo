package com.bteb.routineinfo.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bteb.routineinfo.ui.theme.Emerald600

data class BtebSubjectItem(val code: String, val name: String, val credit: Int)

val BTEB_SAMPLE_BOOKS = listOf(
    BtebSubjectItem("28511", "Computer Office Application", 2),
    BtebSubjectItem("28521", "Programming Essentials", 3),
    BtebSubjectItem("28531", "Web Development & Design", 3),
    BtebSubjectItem("28541", "Database Management System", 3),
    BtebSubjectItem("28551", "Computer Network & Security", 3),
    BtebSubjectItem("25831", "Physics-2", 3),
    BtebSubjectItem("25921", "Mathematics-3", 3),
    BtebSubjectItem("25722", "Communicative English", 2)
)

@Composable
fun BtebBooklistDialog(
    onDismiss: () -> Unit,
    onSelectBook: (BtebSubjectItem) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = Emerald600)
            }
        },
        title = {
            Text("BTEB Polytechnic Curriculum Books", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        },
        text = {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.heightIn(max = 350.dp)
            ) {
                items(BTEB_SAMPLE_BOOKS) { book ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                onDismiss()
                                onSelectBook(book)
                            }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = book.name,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Code: ${book.code} · Credit: ${book.credit}",
                                    fontSize = 11.sp,
                                    color = Color.Gray,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Text(
                                text = "Select",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald600
                            )
                        }
                    }
                }
            }
        },
        shape = RoundedCornerShape(20.dp)
    )
}
