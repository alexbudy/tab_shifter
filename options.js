function saveOptions() {
	localStorage[this.id] = this.checked
}

var chkBoxes=document.getElementsByName("options")

for (var i = 0; i < chkBoxes.length; i++) {
	var chkBox = chkBoxes[i]
	chkBox.addEventListener('click', saveOptions)
	chkBox.checked=(localStorage[chkBox.id] == 'true')
}
