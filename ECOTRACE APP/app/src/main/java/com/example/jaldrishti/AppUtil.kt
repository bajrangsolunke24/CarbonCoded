package com.example.jaldrishti

import android.content.Context
import android.widget.Toast

object AppUtil {
    fun showtoast(context: Context, message : String){

        Toast.makeText(context , message , Toast.LENGTH_LONG).show()
    }
}