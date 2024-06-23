// import { getCUReviewsInfo } from './main.js';

function onDOMReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document already loaded, running function immediately.');
        fn();
    } else {
        console.log('Document not yet loaded, setting up DOMContentLoaded listener.');
        document.addEventListener('DOMContentLoaded', fn);
    }
}

let classes = []

onDOMReady(function() {
    setTimeout(function() {
        const courseElements = document.getElementsByClassName("expander ng-binding");
        console.log(courseElements, "courseElements found: " + courseElements.length);
        for (let i = 0; i < courseElements.length; i++) {
            console.log('Course Element Text:', courseElements[i].children[0] ? courseElements[i].children[0].textContent : 'No child text');
            classes.push(courseElements[i].children[0].textContent);
        }
        checkAndLogElements();
    }, 1000); // Delay by 1000 milliseconds (1 second)
});

const courseRatingDict = {};

async function checkAndLogElements() {
    const courseElements = document.getElementsByClassName("expander ng-binding");
    for (let i = 0; i < classes.length; i++) {
        let courseRating = 0.0;
        const courseName = courseElements[i]?.children[0]?.textContent;
        if (!courseName) {
            console.warn(`Course name not found for element at index ${i}`);
            continue;
        }
        const courseSubject = courseName.split(" ")[0];
        const courseNumber = courseName.split(" ")[1];
        if (courseRatingDict[courseName]) {
            courseRating = courseRatingDict[courseName];
            continue;
        } else {
            try {
                const classInfo = await getCUReviewsInfo(courseSubject, courseNumber);
                courseRating = classInfo[1];
                if (classInfo[1] === null) { throw new Error("No rating found"); }
                courseRatingDict[courseName] = classInfo;
            } catch (error) {
                console.error('Error fetching course rating:', error);
                continue;
            }
        }

        if (!courseElements[i]) {
            console.warn(`Course element not found for index ${i}`);
            continue;
        }

        if (courseRating === 0.0 || courseRating === undefined || courseRating === null) {
            courseElements[i].children[0].textContent = `(N/A) ${courseName} `;
        } else {
            const classInfoText = document.createElement("p");
            classInfoText.className = "class-info-text";

            const ratingText = document.createElement('span');
            ratingText.textContent = ` R: ${classInfo[1].toFixed(2)}`;
            ratingText.style.color = "white";
            classInfoText.appendChild(ratingText);

            const difficultyText = document.createElement('span');
            difficultyText.textContent = ` D: ${classInfo[0].toFixed(2)}`;
            difficultyText.style.color = "white";
            classInfoText.appendChild(difficultyText);

            const workloadText = document.createElement('span');
            workloadText.textContent = ` W: ${classInfo[2].toFixed(2)}`;
            workloadText.style.color = "white";
            classInfoText.appendChild(workloadText);

            courseElements[i].appendChild(classInfoText);
        }
    }
    console.log('Course Rating Dict:', courseRatingDict);
}

let modalCheckInterval;
function checkForModal() {
    const modal = document.querySelector('div[uib-modal-window="modal-window"]');
    
    if (modal) {
        console.log("Modal found:", modal);
        clearInterval(modalCheckInterval);
        getStaffNames();
        processCourseNames();
        watchModalClose(modal);
    } else {
        console.log("Modal not found.");
    }
}

function watchModalClose(modal) {
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.removedNodes.length) {
                for (const node of mutation.removedNodes) {
                    if (node === modal) {
                        console.log("Modal closed.");
                        observer.disconnect();
                        modalCheckInterval = setInterval(checkForModal, 3000);
                        return;
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

modalCheckInterval = setInterval(checkForModal, 3000);
