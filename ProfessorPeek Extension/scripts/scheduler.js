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
    // console.log(courseElements, "courseElements found: " + courseElements.length);
    for (let i = 0; i < classes.length; i++) {
        let courseRating = 0.0;
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

function checkForModal() {
    // Use the attribute selector to find the div
    const modal = document.querySelector('div[uib-modal-window="modal-window"]');
    
    if (modal) {
        console.log("Modal found:", modal);
        // call functions to get professor scores and cureviews info
        // Perform any action here, such as manipulating the modal or logging more details
    } else {
        console.log("Modal not found.");
    }
}
// Check for the modal every 3000 milliseconds (3 seconds)
setInterval(checkForModal, 3000);


