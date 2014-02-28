var disabled_id="disable-in-textbox"

function saveOptions() {
	var disabled_in_text=document.getElementById(disabled_id).checked
	localStorage[disabled_id]=disabled_in_text
}

function loadDisabledInTextboxOption() {
	var disabled=localStorage[disabled_id]
	if (disabled == undefined) {
		localStorage[disabled_id]=true
		disabled=true
	}
	return (disabled == 'true')
}

var chkBox=document.getElementById(disabled_id)
chkBox.addEventListener('click', saveOptions)
chkBox.checked=loadDisabledInTextboxOption()
