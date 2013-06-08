console.log("in background")

chrome.commands.onCommand.addListener(function(command) {
    console.log("command", command)
});

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
          chrome.tabs.query({'currentWindow': true}, function(tabs) {
            var tabCount = tabs.length
            var activeTab
            var pinCount = 0
            for (var i = 0; i < tabCount; i++) {
                if (tabs[i].active == true) {
                    activeTab = tabs[i]
                }
                if (tabs[i].pinned) {
                    pinCount++
                }
            }
            var tabId = activeTab.id
            var tabPos = activeTab.index
            var newIndex = tabPos
            var toPin = activeTab.pinned
            switch(request.tabAction) {
                case 'right':
                    newIndex++
                    if (toPin && newIndex >= pinCount) newIndex = 0
                    else if (newIndex >= tabCount) newIndex = pinCount
                    break
                case 'left':
                    newIndex--
                    if (newIndex < 0 && toPin) newIndex = (pinCount - 1)
                    else if (tabs[newIndex].pinned) newIndex = (tabCount - 1)
                    else if (newIndex < 0) newIndex = (tabCount - 1)
                    break 
                case 'pin':
                    toPin = true
                    break
                case 'unpin':
                    toPin = false
                    break
                    
            }
            chrome.tabs.update(tabId, {pinned:toPin})
            chrome.tabs.move(tabId, {index:newIndex})
          })}
)
