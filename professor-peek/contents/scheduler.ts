import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://classes.cornell.edu/scheduler/roster/*"]
}

import { getCUReviewsInfo, getStaffNames, processCourseNames } from "~contents/main"


// Write a function that runs every 1 second to check if a condition is true. once the condition is true, stop the interval
// and run the function that you want to run when the condition is true
function checkCondition() {
    if (document.getElementsByClassName("expander ng-binding")) {
        clearInterval(interval);
        checkAndLogElements();
    }
}
const interval = setInterval(checkCondition, 1000);


async function checkAndLogElements() {
const courseRatingDict = {};

    let classes = [];
    console.log("running function")
    const downgradedCourses = new Map([
        ['CS 3700', '4700'],
        ['CS 3780', '4780'],
        ['ECE 3200', '4200'],
        ['ORIE 3741', '4741'],
        ['STSCI 3740', '4740']
    ]);
    const courseElements = document.getElementsByClassName("expander ng-binding");
    if (courseElements) {
        for (let i = 0; i < courseElements.length; i++) {
            // console.log('Course Element Text:', courseElements[i].children[0] ? courseElements[i].children[0].textContent : 'No child text');
            classes.push(courseElements[i].children[0].textContent);
        }
        console.log('Course Elements:', courseElements);
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
            
            let classInfo = [];
            if (courseRatingDict[courseName]) {
                console.log('Rating found in dict:', courseRatingDict[courseName]);
                courseRating = courseRatingDict[courseName];
                continue;
            } else {
                try {
                    console.log(`Fetching course rating for ${courseSubject} ${courseNumber}`);
                    let classInfo = await getCUReviewsInfo(courseSubject, courseNumber);
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
            if (courseRating === 0.0 || courseRating === undefined || courseRating === null) {
                courseElements[i].children[0].textContent = `(N/A) ${courseName}`;
            } else {
                const classInfoText = document.createElement("p");
                  // give p element a class name
                  classInfoText.className = "class-info-text";
    
                // Rating Text
                courseElements[i].children[0].textContent = `${courseName} (${courseRating}/5) `
    
                  //   Difficulty Text
                  const difficultyText = document.createElement('span');
                  difficultyText.textContent = ` Diff: ${classInfo[0]}`;
                  difficultyText.style.color = "white"
                  classInfoText.appendChild(difficultyText);
    
                  // Workload Text
                  const workloadText = document.createElement('span');
                  workloadText.textContent = ` Workload: ${classInfo[2]}`;
                  workloadText.style.color = "white";
                  classInfoText.appendChild(workloadText);
                  courseElements[i].appendChild(classInfoText);
                // courseElements[i].children[0].textContent = `(${courseRating}) ${courseName}`;
            }
        }
        console.log('Course Rating Dict:', courseRatingDict);
    } else {
        console.log('Scheduler: No course elements found');
    }
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



