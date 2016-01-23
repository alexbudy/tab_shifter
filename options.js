function saveOptions() {
	var obj = {}
	obj[this.id] = this.checked
	chrome.storage.sync.set(obj)
}

function restore_options() {
	chrome.storage.sync.get({
		disableWhileInTextbox : true, //default values here
		keepFocusWhenPinning  : true,
		unpinToOriginalPos : true,
		enableShiftSpace : true,
		enableShiftDown : true,
		enableShiftRightLeft : false,
		enableMoveWindowRightLeft : false,
		enableResizeWindow : false,
		shrinkPercentage: 25
	}, function(items) {
		var chkBoxes=document.getElementsByName("options")
		var shrinkbox = document.getElementById('shrinkpercentage')

		for (var i = 0; i < chkBoxes.length; i++) {
			var chkBox = chkBoxes[i]
			chkBox.addEventListener('click', saveOptions)
			chkBox.checked=items[chkBox.id]

			if (chkBox.id == "enableResizeWindow") {
				chkBox.addEventListener('click', toggleShrinkBox)
			}
		}
		
		if (items['enableResizeWindow']) {
			shrinkbox.value = items['shrinkPercentage']
		} else {
			shrinkbox.disabled = true
		}

		shrinkbox.addEventListener("keypress", validateKeyPress)
		shrinkbox.addEventListener("keyup", saveShrinkPercentage)
		shrinkbox.addEventListener("paste", function(e) {e.preventDefault()}) // don't allow pasting into textbox
		shrinkbox.addEventListener("blur", function(e) { 
			if (shrinkbox.value.length == 0) {
				shrinkbox.value = items['shrinkPercentage']
			} 
		})
	});
}

function toggleShrinkBox(e) {
	var shrinkbox = document.getElementById('shrinkpercentage')
	if (e.srcElement.checked) {
		shrinkbox.disabled = false
		chrome.storage.sync.get({shrinkPercentage : 25}, function (items) {
			shrinkbox.value = items['shrinkPercentage']
		})
	} else {
		shrinkbox.disabled = true
		shrinkbox.value = ""
	}
}

function validateKeyPress(e) {
	var shrinkBox = document.getElementById('shrinkpercentage')
	var unicode = e.charCode ? e.charCode : e.keyCode
	var curVal = shrinkBox.value

    if (unicode!=8){ // if the key isn't the backspace key (which we should allow)
        if (unicode<48||unicode>57) { // if not a number
        	e.preventDefault()
        	return 
        }
    }

	if (shrinkBox.selectionStart == 0 && shrinkBox.selectionEnd == 2) {
		shrinkBox.value = String.fromCharCode(event.which)
	} else if (shrinkBox.selectionStart == 0 && shrinkBox.selectionEnd == 1) {
		shrinkBox.value = String.fromCharCode(event.which)
		if (curVal.length == 2) {
			shrinkBox.value = shrinkBox.value + curVal[1]
		}
	} else if (shrinkBox.selectionStart == 1 && shrinkBox.selectionEnd == 2) {
		shrinkBox.value = curVal[0] + String.fromCharCode(event.which)
	}

	if (curVal.length == 2) {
		e.preventDefault()
	}
}

function saveShrinkPercentage(e) {
	var saveVal = document.getElementById('shrinkpercentage').value
	if (saveVal.length == 0) {
		return
	}
	chrome.storage.sync.set({shrinkPercentage : saveVal})
}

document.addEventListener('DOMContentLoaded', restore_options)
