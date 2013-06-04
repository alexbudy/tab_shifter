function click(e) {
    console.log(e)
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
    var newIndex = tabPos + 1
    if (newIndex >= tabCount) {
        newIndex = 0
    }
    chrome.tabs.move(tabId, {index:newIndex});
});

  console.log("CLICKED A BUTTON");
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});

window.addEventListener('keyup', click, false)
