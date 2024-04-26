function onDOMReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Call the function immediately if the document is already ready
        fn();
    } else {
        // Otherwise, wait for the DOMContentLoaded event
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function setupObserverWithDelay() {
    // Start observing changes from the start, even during the delay
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                checkAndLogElements();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial check after a delay
    setTimeout(() => {
        checkAndLogElements();
    }, 1000); // Delay by 1000 milliseconds (1 second)
}

function checkAndLogElements() {
    const courseElements = document.getElementsByClassName("expander ng-binding");
    // console.log(courseElements, "courseElements found: " + courseElements.length);
    for (let i = 0; i < courseElements.length; i++) {
        // console.log('Course Element Text:', courseElements[i].children[0] ? courseElements[i].children[0].textContent : 'No child text');
    }
}

onDOMReady(setupObserverWithDelay);
