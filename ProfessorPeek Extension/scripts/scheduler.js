async function getCUReviewsInfo(subject, courseNumber) {
    const response = await fetch(`https://www.cureviews.org/api/getCourseByInfo`, {
        method: "POST",
        body: JSON.stringify({
            number: courseNumber,
            subject: subject.toLowerCase()
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
  
    const data = await response.json();
    const classInfo = data.result; // Access the "result" property
    const classDifficulty = classInfo.classDifficulty;
    const classRating = classInfo.classRating;
    const classWorkload = classInfo.classWorkload;
    const classId = classInfo._id;
  
    const response_two = await fetch(`https://www.cureviews.org/api/getReviewsByCourseId`, {
        method: "POST",
        body: JSON.stringify({
          courseId: classId,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
  
    const data_two = await response_two.json();
    const num_reviews = data_two.result.length;
    const review_preview = data_two.result.slice(0, 2);
  
    return [classDifficulty, classRating, classWorkload, num_reviews, review_preview];
  }


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

const courseRatingDict = {};

async function checkAndLogElements() {
    const courseElements = document.getElementsByClassName("expander ng-binding");
    // console.log(courseElements, "courseElements found: " + courseElements.length);
    for (let i = 0; i < courseElements.length; i++) {
        const courseRating = 0.0;
        // if that child is in a dict, get the rating, else, fetch the rating
        const courseName = courseElements[i].children[0].textContent;
        const courseSubject = courseName.split(" ")[0];
        const courseNumber = courseName.split(" ")[1];
        if (courseRatingDict[courseName]) {
            // console.log('Rating found in dict:', courseRatingDict[courseName]);
            courseRating = courseRatingDict[courseName];
            continue;
        } else {
            classInfo = await getCUReviewsInfo(courseSubject, courseNumber);
            courseRating = classInfo[1];
        }
        // Update HTML with rating
        courseElements[i].children[1].textContent = `${courseName} - ${courseRating}`;
    }
}

onDOMReady(setupObserverWithDelay);
