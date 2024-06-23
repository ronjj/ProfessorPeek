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
    const downgradedCourses = new Map([
        ['CS 3700', '4700'],
        ['CS 3780', '4780'],
        ['ECE 3200', '4200'],
        ['ORIE 3741', '4741'],
        ['STSCI 3740', '4740']
    ]);
    const courseElements = document.getElementsByClassName("expander ng-binding");
    // console.log(courseElements, "courseElements found: " + courseElements.length);
    for (let i = 0; i < classes.length; i++) {
        let courseRating = 0.0;
        // if that child is in a dict, get the rating, else, fetch the rating
        const courseName = courseElements[i].children[0].textContent;
        const courseSubject = courseName.split(" ")[0];
        let courseNumber = courseName.split(" ")[1];
        if (downgradedCourses.has(courseSubject + " " + courseNumber)) {
            courseNumber = downgradedCourses.get(courseSubject + " " + courseNumber);
            // console.log(`Downgraded Course Found: ${subject} ${courseNumber}`);
        }
        
        if (courseRatingDict[courseName]) {
            // console.log('Rating found in dict:', courseRatingDict[courseName]);
            courseRating = courseRatingDict[courseName];
            continue;
        } else {
            try {
                classInfo = await getCUReviewsInfo(courseSubject, courseNumber);
                if (classInfo[1] === null) {
                    courseRating = 0.0;
                } else {
                    courseRating = classInfo[1];
                }
            } catch (error){
                console.error(`Error fetching course rating: for ${courseSubject} ${courseNumber}`, error);
                continue;
            }
            
        }
        // Update HTML with rating
        if (courseRating === 0.0 | courseRating === undefined | courseRating === null) {
            courseElements[i].children[0].textContent = `(N/A) ${courseName} `;
        } else {
            const classInfoText = document.createElement("p");
              // give p element a class name
              classInfoText.className = "class-info-text";

            // Rating Text
            const ratingText = document.createElement('span');
            ratingText.textContent = ` R: ${classInfo[1].toFixed(2)}`;
            ratingText.style.color = "white";
            classInfoText.appendChild(ratingText);

              //   Difficulty Text
              const difficultyText = document.createElement('span');
              difficultyText.textContent = ` D: ${classInfo[0].toFixed(2)}`;
              difficultyText.style.color = "white"
              classInfoText.appendChild(difficultyText);

              // Workload Text
              const workloadText = document.createElement('span');
              workloadText.textContent = ` W: ${classInfo[2].toFixed(2)}`;
              workloadText.style.color = "white";
              classInfoText.appendChild(workloadText);
              courseElements[i].appendChild(classInfoText);
            // courseElements[i].children[0].textContent = `(${courseRating}) ${courseName}`;
        }
    }
    console.log('Course Rating Dict:', courseRatingDict);
}



let modalCheckInterval;
function checkForModal() {
    const modal = document.querySelector('div[uib-modal-window="modal-window"]');
    
    if (modal) {
        console.log("Modal found:", modal);
        clearInterval(modalCheckInterval); // Stop checking while the modal is open
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
                        observer.disconnect(); // Stop watching
                        modalCheckInterval = setInterval(checkForModal, 3000); // Restart checking for the modal
                        return;
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

modalCheckInterval = setInterval(checkForModal, 3000);  // Start the interval to check for the modal

