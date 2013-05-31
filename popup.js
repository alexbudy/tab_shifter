// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

console.log("LOL")
console.debug("LOL")

createTab()

function createTab() {
    alert("LOL")
    console.log("HERE")
    console.log(tab.id)
    chrome.tabs.duplicate(tab.id)
}

onload = setTimeout(createTab, 2)
