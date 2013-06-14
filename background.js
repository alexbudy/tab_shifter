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
                    chrome.tabs.move(tabId, {index:newIndex})
                    break
                case 'left':
                    newIndex--
                    if (newIndex < 0 && toPin) newIndex = (pinCount - 1)
                    else if (tabs[newIndex].pinned) newIndex = (tabCount - 1)
                    else if (newIndex < 0) newIndex = (tabCount - 1)
                    chrome.tabs.move(tabId, {index:newIndex})
                    break 
                case 'pin':
                    toPin = true
                    chrome.tabs.update(tabId, {pinned:toPin})
                    break
                case 'unpin':
                    toPin = false
                    chrome.tabs.update(tabId, {pinned:toPin})
                    break
                    
            }
          })}
)
