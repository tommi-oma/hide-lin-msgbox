# Hide LinkedIn Message Window

Simple Chrome extension, and tutorial, to hide the Messaging window in LinkedIn

## Extension setup

Let's create the base for our extension, and see that we get it to run. In the first phase we'll simply

1. Create the `manifest.json` file for our extension,
3. add a code file (only console log),
4. load the newly created extension and check our code runs

First we'll create the `manifest-json` file. This file describes the extension to Chrome. 

```JSON
{
    "manifest_version": 3,
    "name": "Hide LinkedIn Msg window",
    "version": "1.0",
    "description": "Hide the Messagging Conversation Window in LinkedIn",
    "content_scripts": [{
        "matches": ["https://*.linkedin.com/*"],
        "js": ["js/content.js"]
    }]
}
```

The interesting part is the **`content_scripts`** others are rather obvious. *Content* means that the scripts will be run for the content, so we can actually manipulate the DOM. Other type of script that we will add later is *Background*. Background scripts do not have access to the page content, but are allowed to use all `chrome` extension scripts. Content script declaration first uses **matches** to declare that the extension should only run in LinkedIn. Second part (`js`) states which script file should be run. So let us create the script file.

Create a new file `content.js` to the sub directory `js`. Names are not important, as well long as they match what is declared in the manifest file. To start off, just add a simple console logging to the file. By default Chrome will execute the script after the DOM is complete [more info](https://developer.chrome.com/docs/extensions/mv3/content_scripts/#run_time).

```JavaScript
console.log("Executing content!")
```

Next we'll enable the development mode for Chrome, and load the extension. (For more details on this, see e.g. [Getting started(https://developer.chrome.com/docs/extensions/mv3/getstarted/) in the official documentation)

* Open `chrome://extensions/` page in Chrome,
* on top right enable *Developer mode*
* click *Load upnpacked*, and navigate to the root folder for the extension code (where the `manifest.json` file resides). The Extension should now be visible with the others.
* Open [https://www.linkedin.com](https://www.linkedin.com)
* Open the developer tool, and find the "Execution content!" in the console feed

## Hide the Messaging Window

Now that we have an extension up and running, we can add some executing code. All we need to do is to modify the `content.js` file.

Start off by wrapping the console log call in a SIAF, not an essential step, but often used to wrap things to a single function.

```JavaScript
(function () {
    console.log("Executing content!")
})()
```

Next we'll add the actual functionality. Since Linked In page content is created dynamically using JavaScript, we use a timer to see when the Messaging Window actually appears on the page. So we wrap our code in a function, and immediately call that function. In the function we try to find the Messaging Window element, and hide it if found. If not found we'll retry after a second. 

> We limit the retries to 10 not to have the script run for ever in case e.g. linked in changes something rendering the extension script useless.

The hiding is done simply by finding the element `#msg-overlay`, and setting it's `display` property to `'none'`. The above implementation is below (add it to the SIAF function)

```JavaScript
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
```

Now reload the extension (from the chrome://extensions page), reload the LinkedIn page, and the Messaging window should not be visible any more. The console should also show the log prints with one or more `Retry #*N*` prints

And there you have it, a working extension. Let's just add a little nicer icon to it, just in case you want to [publish it in the Chrome Web Store](https://developer.chrome.com/docs/extensions/mv3/hosting/).

Again this is straightforward: add an icon to your project, and update the manifest file. We use a single icon, and list it as the icon for all sizes

![Extension icon](extension/images/icon.png)

Manifest file addition:
```JSON
    "icons": {
        "16": "images/icon.png",
        "32": "images/icon.png",
        "48": "images/icon.png",
        "128": "images/icon.png"
    }
```

## Interactivity

Even though my basic goal was met, I figured I could take it a little further. The next step is to be able to toggle the visibility of the Messaging window.

Since content scripts can not handle interactivity (except in the content), we'll add a background script and messaging between the content and the background scripts.

First we'll create the background script. In manifest version 3 the script **must be** located in the root directory (same where `manifest.json` resides). So create a file `background.js`, and add the following content to it:

```JavaScript
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
```

The event listener for connecting will be called from the content, and we have placeholder code that will log print if we receive a message from the content, but in any case will immediately send a message back to the caller. The action's event handler will send a message to the caller when the extension's icon is clicked.


We also need to add a couple of sections to the manifest file. One to register the background script, and another that declares that we can perform an action (click) on the extension's icon. Add the following to the manifest file:

```JSON
    "permissions": ["scripting"],
    "background": {
        "service_worker": "background.js"
    },
    "action": {
        "default_icon": {
            "16": "images/icon.png",
            "32": "images/icon.png",
            "48": "images/icon.png",
            "128": "images/icon.png"
        }    
    }
```

Now we just need to add code to the `content.js` file to complete the messaging sceleton. Add the following to the SIAF function:

```JavaScript
    var background = chrome.runtime.connect({ name: 'hidein' });
    background.onMessage.addListener(function (msg) {
        console.log("Got message from background", JSON.stringify(msg))
    })
```

Now we can see if our code works:

1. Reload the extension,
1. open your Linked In page, and reload. You should see the console.log prints for hiding the page, but also 
    ```
    Got message from background {"msg":"sent from background"}
    ```
1. Check also that the background script is called. To do this you open the page for extensions (chrome://extensions), and click on your extension's *Inspect views service worker* link. That should open a new window showing the service worker's console. 
    ![Extension screenshot](docs/extension_logs.png)
1. Switch to linked in page, and click on the extension icon in your browser's toolbar. That should result in console prints both to your linked in page's console, as well as the service worker's console.

If all went fine we should now have a skeleton with communication between the content and the service worker.

The next step is to have the communication implement the toggling of the message window. That can be implemented by introducing a new `toggleBoxVisibility` function, and calling that from the event handler for receiving a message from the service worker.

```JavaScript
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
```

Now when you reload the extension, reload the Linked in page, you should be able to hide and show the Messaging window by clicking on the extension icon in the browser's toolbar.

## Add persistence

As a final task we'll store the state to local storage, so we can show/hide the messaging window depending on how it was the last time the extension was used. With this we'll also get rid of console prints and some extra code we really don't use.

First the manifest file needs to be updated to include a permission to use the storage.
```JSON
    "permissions": ["scripting", "storage"],
```

The background script does not contain anything new, it is merely cleaned up.

The content script is modified to use the local storage. Just to make sure, the whole file:

```JavaScript
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
``` 

1. during startup we check for a `showbox` key. If it is false, or non existing, we execute the familiar hiding code.
1. During toggling, we store the latest state to the local storage.

The end result is then

```JavaScript
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
``` 

HTH. Have fun
