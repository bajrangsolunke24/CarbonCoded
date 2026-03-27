package com.example.jaldrishti

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream
import java.io.InputStream
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object ImageUtils {
    suspend fun compressImage(context: Context, uri: Uri): ByteArray? {
        return withContext(Dispatchers.IO) {
            try {
                val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
                val originalBitmap = BitmapFactory.decodeStream(inputStream)
                inputStream?.close()

                if (originalBitmap == null) return@withContext null

                // Resize if too big (max 1024x1024)
                val maxDimension = 1024
                var width = originalBitmap.width
                var height = originalBitmap.height

                if (width > maxDimension || height > maxDimension) {
                    val ratio = width.toFloat() / height.toFloat()
                    if (ratio > 1) {
                        width = maxDimension
                        height = (width / ratio).toInt()
                    } else {
                        height = maxDimension
                        width = (height * ratio).toInt()
                    }
                }

                val resizedBitmap = Bitmap.createScaledBitmap(originalBitmap, width, height, true)

                // Compress
                val outputStream = ByteArrayOutputStream()
                resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
                val bytes = outputStream.toByteArray()
                
                // Recycle bitmaps
                if (originalBitmap != resizedBitmap) {
                    originalBitmap.recycle()
                }
                resizedBitmap.recycle()

                bytes
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
