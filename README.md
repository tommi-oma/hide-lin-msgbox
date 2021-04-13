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
