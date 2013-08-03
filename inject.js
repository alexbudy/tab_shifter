window.addEventListener('keyup', moveTab, false)

function moveTab(e) 
{
    var RIGHT = 39
    var LEFT = 37
    var PIN = 38
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
     } 

    if (e.ctrlKey && tabAction) {
        chrome.extension.sendRequest({
            "request" : "moveTab",
            "tabAction" : tabAction
        })
    }
}
