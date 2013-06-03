function click(e) {
  chrome.tabs.query({'active': true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: 'http://espn.com'});
    console.log(tabs[0]);
});

  console.log("CLICKED A BUTTON");
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});
