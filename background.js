var checkboxValues = { // initial default values here, should match options.js
}

chrome.storage.sync.get({
        disableWhileInTextbox : true, //default values here
        keepFocusWhenPinning  : true,
        unpinToOriginalPos : true,
        enableShiftSpace : true,
        enableShiftDown : true,
        enableShiftRightLeft : false,
        enableMoveWindowRightLeft : false,
        enableResizeWindow : false,
        shrinkPercentage: 25

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
            var activeWindowId = activeTab.windowId
            var tabPos = activeTab.index
            var newIndex = tabPos
            var pinned = activeTab.pinned

            switch(request.tabAction) {
                case 'fullright':
                    if (checkboxValues['enableShiftRightLeft']) {
                        if (pinned) {
                            newIndex = pinCount - 1
                        } else {
                            newIndex = tabCount - 1
                        }
                        moveTab(tabId, newIndex)
                        break
                    }
                case 'right':
                    newIndex++
                    if (pinned && newIndex >= pinCount) newIndex = 0
                    else if (newIndex >= tabCount) newIndex = pinCount
                    moveTab(tabId, newIndex)
                    break
                case 'fullleft':
                    if (checkboxValues['enableShiftRightLeft']) {
                        if (pinned) {
                            newIndex = 0
                        } else {
                            newIndex = pinCount
                        }
                        moveTab(tabId, newIndex)
                        break
                    } // otherwise go to below case
                case 'left':
                    newIndex--
                    if (pinned) { //moving a pinned tab left
                        if (newIndex < 0) newIndex = (pinCount - 1)
                    } else {      //moving an unpinned tab left
                        if (newIndex < 0) newIndex = (tabCount - 1)
                        else if (tabs[newIndex].pinned) newIndex = (tabCount - 1)
                    }
                    moveTab(tabId, newIndex)
                    break 
                case 'pin':
                    if (pinned) {
                        chrome.tabs.update(tabId, {pinned:false})
                        var tabPosKey = 'tab_'+tabId
                        if (tabPosKey in localStorage && checkboxValues["unpinToOriginalPos"]) {
                            moveTab(tabId, parseInt(localStorage[tabPosKey]))
                            delete localStorage[tabPosKey]
                        }
                    }
                    else {
                        localStorage['tab_'+tabId] = tabPos
                        chrome.tabs.update(tabId, {pinned:true})
                        if (!checkboxValues["keepFocusWhenPinning"]) {
                            if (rightTab) {
                                activateTab(rightTab.id)
                            } else if (leftTab) {
                                activateTab(leftTab.id)
                            }
                        } else {
                            activateTab(tabId)
                        }
                    }
                    break
                case 'newWinDown': // this key stroke cycles the tab among windows
                    if (!checkboxValues['enableShiftDown']) {
                        break
                    }
                    // if alt key pressed dont keep focus
                    chrome.windows.getAll({windowTypes : ['normal']}, function(windows) {
                        if (windows.length > 1) { // if only one window only thing to do is move to new tab
                            var newWinId = findNextLargestInWindowArray(windows, activeWindowId)

                           chrome.tabs.move(tabId, {index : -1, windowId : newWinId}, function(tab) {
                                chrome.tabs.update(tab.id, {'active': true, 'pinned': pinned}, function(tab) {
                                    if (!request.altPressed) {
                                        chrome.windows.update(tab.windowId, {focused : true})
                                    }
                                })

                           })
                            
                            delete localStorage[tabId + "_win_from"]
                            delete localStorage[tabId + "_prev_win_tab_pos"]
                        } else if (tabCount > 1){ // 
                            chrome.windows.create({tabId: tabId}, function(window) {
                                chrome.tabs.update(tabId, {'pinned' : pinned})
                                localStorage[tabId+"_win_from"] = activeWindowId
                                localStorage[tabId+"_prev_win_tab_pos"] = tabPos
                            })
                        }
                    })
                        
                    break
                // brings current tab to new window, and back
                case 'shiftSpace':
                    if (!checkboxValues['enableShiftSpace']) {
                        break
                    } 
                    if (tabCount > 1) {
                        chrome.windows.create({tabId: tabId}, function(window) {
                            chrome.tabs.update(tabId, {'pinned' : pinned})
                            localStorage[tabId+"_win_from"] = activeWindowId
                            localStorage[tabId+"_prev_win_tab_pos"] = tabPos
                        })
                    } else if (tabCount == 1) { // if tab count is 1, want to bring this tab back to prev window, or first possible window
                        chrome.windows.getAll({windowTypes : ['normal']}, function(windows) {
                            if (windows.length > 1) { // if only one window only thing to do is move to new tab
                                var winFromId = parseInt(localStorage[tabId+"_win_from"])
                                if (!windowIdInWindowArray(windows, winFromId)) {
                                    winFromId = findNextLargestInWindowArray(windows, activeWindowId)
                                }
                                var prevTabPosKey = tabId + "_prev_win_tab_pos"
                                var prevTabPos = parseInt(localStorage[prevTabPosKey] || -1)

                                chrome.tabs.move(tabId, {index : prevTabPos, windowId : winFromId}, function(tab) {
                                    chrome.tabs.update(tab.id, {'active': true, 'pinned': pinned}, function(tab) {
                                        chrome.windows.update(tab.windowId, {focused : true})
                                    })
                                })
                            }
                            delete localStorage[tabId + "_win_from"]
                            delete localStorage[tabId + "_prev_win_tab_pos"]
                        })
                    }
                    break
                case 'moveWinLeft':
                    if (checkboxValues['enableMoveWindowRightLeft']) {
                        chrome.windows.update(activeTab.windowId, {left:  -screen.width*2}, function (win) {
                            maximizeWindow(activeTab.windowId) 
                        })
                    }
                    break
                case 'moveWinRight':
                    if (checkboxValues['enableMoveWindowRightLeft']) {
                        chrome.windows.get(activeTab.windowId, function(win) {
                            var origLeft = win.left
                            var origTop = win.top
                            chrome.windows.update(activeTab.windowId, {left:  (screen.width*2 + 5), top : origTop}, function(win2) {
                                maximizeWindow(activeTab.windowId)
                            })
                        })
                    }
                    break
                case 'maximizeWindow':
                    if (checkboxValues['enableResizeWindow']) {
                        maximizeWindow(activeTab.windowId)
                    }
                    break
                case 'shrinkWindow': // shrinks window by X%
                    if (checkboxValues['enableResizeWindow']) {
                        chrome.windows.get(activeTab.windowId, function(win) {
                            var scale = (1 - parseInt(checkboxValues['shrinkPercentage'])/100)
                            chrome.windows.update(activeTab.windowId, 
                                {width: Math.round(win.width * scale), 
                                 height: Math.round(win.height * scale),
                                    left: win.top +  Math.round(win.width * .12), 
                                    top:  win.left + Math.round(win.height * .12)
                                })
                        })
                    }
                    break
            }
          })}
)

// move tab with no function callback
function moveTab(tabId, toPos) {
    chrome.tabs.move(tabId, {index: toPos})
}

function activateTab(tabId) {
    chrome.tabs.update(tabId, {active:true})
}

function maximizeWindow(winId) {
    chrome.windows.update(winId, {state:'maximized'})
}

function windowIdInWindowArray(winArr, winId) {
    for (var i = 0; i < winArr.length; i++) {
        if (winId == winArr[i].id) {
            return true
        }
    }

    return false
}