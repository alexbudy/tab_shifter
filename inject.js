console.log("INJECTED")

window.addEventListener('keyup', moveTab, false)

function moveTab(e) 
{
    var RIGHT = 39
    var LEFT = 37
    var PIN = 38
    var UNPIN = 40
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
         case UNPIN:
            tabAction = "unpin"
            break            
     } 
    console.log(e)

    if (e.ctrlKey && tabAction) {
        console.log("sending request to move tab " + tabAction)
        chrome.extension.sendRequest({
            "request" : "moveTab",
            "tabAction" : tabAction
        })
    }
}
