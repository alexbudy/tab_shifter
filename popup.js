window.addEventListener('keyup', moveTab, false)

function moveTab(e) {
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
    var RIGHT = 39
    var LEFT = 37
    switch(e.which) {
        case RIGHT:
            newIndex++
            if (newIndex >= tabCount) newIndex = 0
            break
        case LEFT:
            newIndex--
            if (newIndex < 0) newIndex = (tabCount - 1)
            break 
    }

    if (e.ctrlKey) {
        chrome.tabs.move(tabId, {index:newIndex});
    }
  })
    
}
