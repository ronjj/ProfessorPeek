function onDOMReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document already loaded, running function immediately.');
        fn();
    } else {
        console.log('Document not yet loaded, setting up DOMContentLoaded listener.');
        document.addEventListener('DOMContentLoaded', fn);
    }
}


onDOMReady(function() {
    setTimeout(function() {
        const courseElements = document.getElementsByClassName("expander ng-binding");
        console.log(courseElements, "courseElements found: " + courseElements.length);
        for (let i = 0; i < courseElements.length; i++) {
            console.log('Course Element Text:', courseElements[i].children[0] ? courseElements[i].children[0].textContent : 'No child text');
        }
    }, 1000); // Delay by 1000 milliseconds (1 second)
});

