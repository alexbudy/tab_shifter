window.addEventListener('keyup', moveTab, false)

function moveTab(e) 
{
    var RIGHT = 39
    var LEFT = 37
    var PIN = 38
    var DOWN = 40

    var tabAction 
    switch(e.which) {
         case RIGHT:
            tabAction = "right"
            break
         case LEFT:
            tabAction = "left"
            break            
         case PIN:
            tabAction = "pin"
            break    
         case DOWN:
            if (e.shiftKey) {
                tabAction = "newWinDown"
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
						"tabAction" : tabAction,
						"inTextBox" : inTextBox
        })
    }
}

