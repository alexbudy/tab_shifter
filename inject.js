window.addEventListener('keyup', moveTab, false)

function moveTab(e) 
{
    if (!e.ctrlKey) { // ctrlKey needs to be pressed for shortcuts to work
        return
    }

    var RIGHT = 39
    var LEFT = 37
    var PIN = 38
    var DOWN = 40
    var SPACE = 32

    // window movement commands
    var WINLEFT = 188
    var WINRIGHT = 190
    var MAXWIN = 222
    var MINWIN = 191
    var ALTKEY = 18

    var tabAction 
    switch(e.which) {
        case RIGHT:
            if (e.shiftKey) {
                tabAction = "fullright"
            } else {
                tabAction = "right"
            }
            break
        case LEFT:
            if (e.shiftKey) {
                tabAction = "fullleft"
            } else {
                tabAction = "left"
            }
            break            
        case PIN:
            tabAction = "pin"
            break    
        case DOWN: // cycle among all windows
            if (e.shiftKey) {
                tabAction = "newWinDown"
            }
            break
        case SPACE: // bring current tab to new window, and back
            if (e.shiftKey) {
                tabAction = "shiftSpace"
            }
            break
        case WINRIGHT:
            if (e.shiftKey) {
                tabAction = "moveWinRight"
            }
            break
        case WINLEFT:
            if (e.shiftKey) {
                tabAction = "moveWinLeft"
            }
            break
        case MAXWIN:
            if (e.shiftKey) {
                tabAction = "maximizeWindow"
            }
            break
        case MINWIN:
            if (e.shiftKey) {
                tabAction = "shrinkWindow"
            }
            break
     }  
		
		 var inTextBox = (document.activeElement.nodeName.toUpperCase() == 'TEXTAREA' 
		 || document.activeElement.nodeName.toUpperCase() == 'INPUT' 
		 || (document.activeElement.hasAttribute('role') 
		 			&& document.activeElement.getAttribute('role').toLowerCase() == 'textbox')) //in case in google email compose field (special case)
		
    if (e.ctrlKey && tabAction) {
        chrome.extension.sendRequest({
            "request" : "moveTab",
						"tabAction"  : tabAction,
						"inTextBox"  : inTextBox,
                        "altPressed" : e.altKey
        })
    }
}

