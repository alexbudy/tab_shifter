console.log("in background")

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
          chrome.tabs.query({'currentWindow': true}, function(tabs) {
            var tabCount = tabs.length
            var activeTab
            for (var i = 0; i < tabCount; i++) {
                if (tabs[i].active == true) {
                    activeTab = tabs[i]
                    break
                }
            }
            var tabId = activeTab.id
            var tabPos = activeTab.index
            var newIndex = tabPos
            switch(request.direction) {
                case 'right':
                    newIndex++
                    if (newIndex >= tabCount) newIndex = 0
                    break
                case 'left':
                    newIndex--
                    if (newIndex < 0) newIndex = (tabCount - 1)
                    break 
            }
            chrome.tabs.move(tabId, {index:newIndex});
          })}
)
