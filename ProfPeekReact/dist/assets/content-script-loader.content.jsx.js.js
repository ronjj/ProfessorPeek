(function () {
  'use strict';

  (async () => {
    if ("assets/content-script-preamble.js.js")
      await import(
        /* @vite-ignore */
        chrome.runtime.getURL("assets/content-script-preamble.js.js")
      );
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("node_modules/vite/dist/client/client.mjs.js")
    );
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("src/content.jsx.js")
    );
  })().catch(console.error);

})();
