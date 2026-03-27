package com.example.jaldrishti


import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class FeasibilityViewModel : ViewModel() {

    private val repo = FeasibilityRepository()

    private val _status = MutableStateFlow("input")
    val status: StateFlow<String> = _status

    private val _result = MutableStateFlow("Pending")
    val result: StateFlow<String> = _result

    fun analyzeDistrict(districtId: String) {
        _status.value = "processing"
        viewModelScope.launch {
            val res = repo.checkFeasibility(districtId)
            _result.value = res
            _status.value = "result"
        }
    }
}
