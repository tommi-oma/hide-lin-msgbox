
(function () {
    const toggleBoxVisibility = () => {
        const box = document.getElementById('msg-overlay')
        if (!box) {
            console.error("Message box does not exist, aborting")
            return
        }
        if (box.style.display === 'none') {
            box.style.display = 'flex'
            chrome.storage.sync.set({showbox: true}, function() { });
        } else {
            box.style.display = 'none'
            chrome.storage.sync.set({showbox: 0}, function() { });
        }
    }
    const background = chrome.runtime.connect({ name: 'hidein' });
    background.onMessage.addListener(function (msg) {
        toggleBoxVisibility()
    })
    chrome.storage.sync.get(['showbox'], function(result) {
        if (!result.showbox) {
            let tries = 0
            const hideBox = () => {
                const box = document.getElementById('msg-overlay')
                if (box) {
                    box.style.display = 'none'
                } else {
                    if (++tries < 10) {
                        setTimeout(hideBox, 1000)
                    } else {
                        console.warning(`Failed to hide messaging window after ${tries} tries`)
                    }
                }
    
            }
            hideBox();
        }
    });

})()