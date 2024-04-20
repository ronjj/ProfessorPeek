const article = document.querySelector("article");

// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).insertAdjacentElement("afterend", badge);
}


// Get Staff Names
const findMeetingPatterns = document.getElementsByClassName("meeting-pattern");
if (findMeetingPatterns.length === 0) {
  console.log("No professor names found");
} else {
    // console.log(findMeetingPatterns[0])
    // Write a loop to iterate through each item in findMeetingPatterns and find the class name "Instructors"
    for (let i = 0; i < findMeetingPatterns.length; i++) {
      const findInstructors = findMeetingPatterns[i].getElementsByClassName("instructors");
    //   console.log(findInstructors)
      // If the class name "Instructors" is found, then iterate through each item in findInstructors
      if (findInstructors.length > 0) {
        for (let j = 0; j < findInstructors.length; j++) {
          // If the name is Staff, ignore it
          if (findInstructors[j].textContent.includes("Staff")) {
            console.log("Staff found")
          } else {
            // console.log(findInstructors[j].textContent)
          }
        }
      } else {
        console.log("No professor names found")
      }
    }
}

// Function To Get CUReviews Information For A Course
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
    
    console.log(classDifficulty, classRating, classWorkload);
    return [classDifficulty, classRating, classWorkload];
}

// Get Course Names
const findCourseNames = document.getElementsByClassName("title-subjectcode");
if (findCourseNames.length === 0) {
  console.log("No course names found");
} else {
  async function processCourseNames() {
    for (let i = 0; i < 2; i++) {
      // Split coursename at space. element before space is course subject
      const splitCourseName = findCourseNames[i].textContent.split(" ");
      const subject = splitCourseName[0];
      const courseNumber = splitCourseName[1];
      const cuReviewsLink = `(link unavailable)`;

      // Use await to wait for the Promise to resolve
      const classInfo = await getCUReviewsInfo(subject, courseNumber);
      const classInfoText = document.createElement("p");
      const difficultyText = document.createElement('span');
        difficultyText.textContent = ` Difficulty: ${classInfo[0].toFixed(2)}`;
        difficultyText.style.color = 'red';
        classInfoText.appendChild(difficultyText);

        const ratingText = document.createElement('span');
        ratingText.textContent = ` Rating: ${classInfo[1].toFixed(2)}`;
        classInfoText.appendChild(ratingText);

        const workloadText = document.createElement('span');
        workloadText.textContent = ` Workload: ${classInfo[2].toFixed(2)}`;
        classInfoText.appendChild(workloadText);

      const classSection = findCourseNames[i].parentNode;
      classSection.insertAdjacentElement("afterend", classInfoText);

    //   findCourseNames[i].insertAdjacentElement("afterend", classInfoText);
    }
  }
  processCourseNames();
}