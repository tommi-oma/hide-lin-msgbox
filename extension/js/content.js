
(function () {
    console.log("Executing content!")
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