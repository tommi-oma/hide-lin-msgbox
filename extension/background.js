
let contentJs

chrome.runtime.onConnect.addListener(function(content) {
    if (content.name !== 'hidein') {
            console.warning("Unknown content handler calling")
            return
    }
    contentJs = content
})

chrome.action.onClicked.addListener(function(tab) {
    if (contentJs) {
        contentJs.postMessage({msg: 'Browser action clicked'})
    }
})
