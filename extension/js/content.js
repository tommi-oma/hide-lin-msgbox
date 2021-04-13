
(function () {
    console.log("Executing content!")
    const toggleBoxVisibility = () => {
        const box = document.getElementById('msg-overlay')
        if (!box) {
            console.error("Message box does not exist, aborting")
            return
        }
        if (box.style.display === 'none') {
            box.style.display = 'flex'
        } else {
            box.style.display = 'none'
        }
        console.log("Changed visibility to", box.style.display)
    }
    var background = chrome.runtime.connect({ name: 'hidein' });
    background.onMessage.addListener(function (msg) {
        console.log("Got message from background", JSON.stringify(msg))
        toggleBoxVisibility()
    })
    let tries = 0
    const hideBox = () => {
        const box = document.getElementById('msg-overlay')
        if (box) {
            console.log("Hiding")
            box.style.display = 'none'
        } else {
            console.log("No box found")
            if (++tries < 10) {
                console.log("Retry #", tries)
                setTimeout(hideBox, 1000)
            } else {
                console.log("No retry, tried", tries)
            }
        }

    }
    hideBox();

})()