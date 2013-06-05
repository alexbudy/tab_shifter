/*
chrome.extension.sendRequest({
    "greeting": "hello",
    "var1": "variable 1",
    "var2": true
});
*/
console.log("INJECTED")

window.addEventListener('keyup', moveTab, false)

function moveTab(e) 
{
    var RIGHT = 39
    var LEFT = 37
    var direction 
    switch(e.which) {
         case RIGHT:
            direction = "right"
            break
         case LEFT:
            direction = "left"
            break            
     } 
    console.log(e)

    if (e.ctrlKey && direction) {
        console.log("sending request to move tab " + direction)
        chrome.extension.sendRequest({
            "request" : "moveTab",
            "direction" : direction
        })
    }
}
