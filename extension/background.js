
let contentJs

chrome.runtime.onConnect.addListener(function(content) {
    if (content.name !== 'hidein') {
            console.log("Unknown content handler calling")
            return
    }
    content.onMessage.addListener(function(msg) {
            console.log("Background received message", JSON.stringify(msg))
    })
    content.postMessage({msg: 'sent from background'})
    contentJs = content
})

chrome.action.onClicked.addListener(function(tab) {
    console.log("Browser action clicked")
    if (contentJs) {
        contentJs.postMessage({msg: 'Browser action clicked'})
    }
})
