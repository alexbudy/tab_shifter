var checkboxValues = { // initial default values here, should match options.js
}

chrome.storage.sync.get({
        disableWhileInTextbox : true, //default values here
        keepFocusWhenPinning  : true,
        unpinToOriginalPos : true
    }, function(items) {
        for (item in items) {
            checkboxValues[item] = items[item]
        }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        checkboxValues[key] = changes[key].newValue   
    }
})

// takes a windows array and current window index, returns next largest window index, 
//      or first if current is largest
function findNextLargestInWindowArray(windows, currentWinId) {
    var returnWinId = 0

    for (var i = 0; i < windows.length; i++) {
        if (currentWinId < windows[i].id) {
            returnWinId = windows[i].id
            break
        }
    }

    if (returnWinId == 0) {
        returnWinId = windows[0].id
    }

    return returnWinId
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
          chrome.tabs.query({'currentWindow': true}, function(tabs) {
			if (request.inTextBox == true && checkboxValues['disableWhileInTextbox']) {
				return
			}

            var tabCount = tabs.length
            var leftTab
            var activeTab
            var rightTab
            var pinCount = 0
            for (var i = 0; i < tabCount; i++) {
                if (tabs[i].active) {
                    if (i > 0) {leftTab = tabs[i-1] }
                    if (i+1 < tabCount) { rightTab = tabs[i+1] }
                    activeTab = tabs[i]
                }
                if (tabs[i].pinned)     pinCount++
            }
            var tabId = activeTab.id
            var tabPos = activeTab.index
            var newIndex = tabPos
            var pinned = activeTab.pinned
            switch(request.tabAction) {
                case 'right':
                    newIndex++
                    if (pinned && newIndex >= pinCount) newIndex = 0
                    else if (newIndex >= tabCount) newIndex = pinCount
                    chrome.tabs.move(tabId, {index:newIndex})
                    break
                case 'left':
                    newIndex--
                    if (pinned) { //moving a pinned tab left
                        if (newIndex < 0) newIndex = (pinCount - 1)
                    } else {      //moving an unpinned tab left
                        if (newIndex < 0) newIndex = (tabCount - 1)
                        else if (tabs[newIndex].pinned) newIndex = (tabCount - 1)
                    }
                    chrome.tabs.move(tabId, {index:newIndex})
                    break 
                case 'pin':
                    if (pinned) {
                        chrome.tabs.update(tabId, {pinned:false})
						var tabPosKey = 'tab_'+tabId
						if (tabPosKey in localStorage && checkboxValues["unpinToOriginalPos"]) {
							chrome.tabs.move(tabId, {index: parseInt(localStorage[tabPosKey])})
						}
                    }
                    else {
						localStorage['tab_'+tabId] = tabPos
                        chrome.tabs.update(tabId, {pinned:true})
						if (!checkboxValues["keepFocusWhenPinning"]) {
                       		if (rightTab) {
                           	chrome.tabs.update(rightTab.id, {active:true})
                     	} else if (leftTab) {
                            chrome.tabs.update(leftTab.id, {active:true})
						}
    					} else {
	       					chrome.tabs.update(tabId, {active:true})
			     		}
                    }
                    break
                case 'newWinDown': // this key stroke cycles the tab among windows
                    var activeWindowId = activeTab.windowId
                    // possibly get all window type = normal in obj
                    chrome.windows.getAll({windowTypes : ['normal']}, function(windows) {
                        console.log("active id: " + activeWindowId)
                        for (var i = 0; i < windows.length; i++) {
                            console.log(windows[i].id)
                        }

                        if (windows.length > 1) { // if only one window only thing to do is move to new tab
                            var newWinId = findNextLargestInWindowArray(windows, activeWindowId)

                           chrome.tabs.move(tabId, {index : -1, windowId : newWinId}, function(tab) {
                                chrome.tabs.update(tab.id, {'active': true, 'pinned': pinned}, function(tab) {
                                    chrome.windows.update(tab.windowId, {focused : true})
                                    
                                })
                           })
                        }

                    })
                    //chrome.windows.create({tabId: tabId})
                    //chrome.tabs.move(tabId, {'index' : -1})
                        
                    break
            }
          })}
)
