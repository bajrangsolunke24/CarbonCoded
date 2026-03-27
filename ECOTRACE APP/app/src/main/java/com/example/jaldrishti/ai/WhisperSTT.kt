package com.example.jaldrishti.ai

import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile

/**
 * Audio recorder for capturing voice input
 * Audio will be processed by Gemini for speech-to-text
 */
class AudioRecorder(private val context: Context) {
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var audioFile: File? = null
    
    companion object {
        private const val SAMPLE_RATE = 16000
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
    }
    
    fun startRecording(): File {
        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        
        audioFile = File(context.cacheDir, "recording_${System.currentTimeMillis()}.wav")
        isRecording = true
        
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            CHANNEL_CONFIG,
            AUDIO_FORMAT,
            bufferSize
        )
        
        audioRecord?.startRecording()
        
        // Record in background thread
        Thread {
            val buffer = ShortArray(bufferSize)
            val outputStream = FileOutputStream(audioFile!!)
            
            // Write WAV header (44 bytes)
            writeWavHeader(outputStream, SAMPLE_RATE, 1, 16)
            
            while (isRecording) {
                val read = audioRecord?.read(buffer, 0, bufferSize) ?: 0
                if (read > 0) {
                    val byteBuffer = shortArrayToByteArray(buffer, read)
                    outputStream.write(byteBuffer)
                }
            }
            
            // Update WAV header with final size
            outputStream.close()
            updateWavHeader(audioFile!!)
            
            audioRecord?.stop()
            audioRecord?.release()
        }.start()
        
        return audioFile!!
    }
    
    fun stopRecording(): File? {
        isRecording = false
        Thread.sleep(100) // Give time for thread to finish
        return audioFile
    }
    
    private fun writeWavHeader(outputStream: FileOutputStream, sampleRate: Int, channels: Int, bitsPerSample: Int) {
        val header = ByteArray(44)
        
        // RIFF header
        header[0] = 'R'.code.toByte()
        header[1] = 'I'.code.toByte()
        header[2] = 'F'.code.toByte()
        header[3] = 'F'.code.toByte()
        
        // File size (placeholder)
        header[4] = 0
        header[5] = 0
        header[6] = 0
        header[7] = 0
        
        // WAVE
        header[8] = 'W'.code.toByte()
        header[9] = 'A'.code.toByte()
        header[10] = 'V'.code.toByte()
        header[11] = 'E'.code.toByte()
        
        // fmt chunk
        header[12] = 'f'.code.toByte()
        header[13] = 'm'.code.toByte()
        header[14] = 't'.code.toByte()
        header[15] = ' '.code.toByte()
        
        // fmt chunk size
        header[16] = 16
        header[17] = 0
        header[18] = 0
        header[19] = 0
        
        // Audio format (PCM = 1)
        header[20] = 1
        header[21] = 0
        
        // Channels
        header[22] = channels.toByte()
        header[23] = 0
        
        // Sample rate
        val sr = sampleRate
        header[24] = (sr and 0xff).toByte()
        header[25] = (sr shr 8 and 0xff).toByte()
        header[26] = (sr shr 16 and 0xff).toByte()
        header[27] = (sr shr 24 and 0xff).toByte()
        
        // Byte rate
        val byteRate = sampleRate * channels * bitsPerSample / 8
        header[28] = (byteRate and 0xff).toByte()
        header[29] = (byteRate shr 8 and 0xff).toByte()
        header[30] = (byteRate shr 16 and 0xff).toByte()
        header[31] = (byteRate shr 24 and 0xff).toByte()
        
        // Block align
        val blockAlign = channels * bitsPerSample / 8
        header[32] = blockAlign.toByte()
        header[33] = 0
        
        // Bits per sample
        header[34] = bitsPerSample.toByte()
        header[35] = 0
        
        // Data chunk
        header[36] = 'd'.code.toByte()
        header[37] = 'a'.code.toByte()
        header[38] = 't'.code.toByte()
        header[39] = 'a'.code.toByte()
        
        // Data size (placeholder)
        header[40] = 0
        header[41] = 0
        header[42] = 0
        header[43] = 0
        
        outputStream.write(header)
    }
    
    private fun updateWavHeader(file: File) {
        val raf = RandomAccessFile(file, "rw")
        val fileSize = raf.length()
        
        // Update file size
        raf.seek(4)
        raf.writeInt(Integer.reverseBytes((fileSize - 8).toInt()))
        
        // Update data size
        raf.seek(40)
        raf.writeInt(Integer.reverseBytes((fileSize - 44).toInt()))
        
        raf.close()
    }
    
    private fun shortArrayToByteArray(shorts: ShortArray, length: Int): ByteArray {
        val bytes = ByteArray(length * 2)
        for (i in 0 until length) {
            bytes[i * 2] = (shorts[i].toInt() and 0x00FF).toByte()
            bytes[i * 2 + 1] = (shorts[i].toInt() shr 8).toByte()
        }
        return bytes
    }
}
