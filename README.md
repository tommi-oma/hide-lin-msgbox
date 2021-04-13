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

