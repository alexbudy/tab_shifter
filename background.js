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
            }
          })}
)
