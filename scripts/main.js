function colorText(number) {
    // 0 - 2
    if (number < 2) {
        return "red";
    // 2 - 3.75
    } else if (number < 3.75) {
        return "black";
    // 3.75 - 5
    } else if (number < 5) {
        return "green";
    }
    
    else {
        return "color: black;"; // or some other default color
    }
}

// Get Staff Names
const findMeetingPatterns = document.getElementsByClassName("meeting-pattern");
if (findMeetingPatterns.length === 0) {
  console.log("No professor names found");
} else {
    for (let i = 0; i < findMeetingPatterns.length; i++) {
      const findInstructors = findMeetingPatterns[i].getElementsByClassName("instructors");
      // If the class name "Instructors" is found, then iterate through each item in findInstructors
      if (findInstructors.length > 0) {
        for (let j = 0; j < findInstructors.length; j++) {
          // If the name is Staff, ignore it
          if (findInstructors[j].textContent.includes("Staff")) {
            // do nothing
          } else {
            console.log(findInstructors[j].textContent)
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
    
    // console.log(classDifficulty, classRating, classWorkload);
    return [classDifficulty, classRating, classWorkload];
}

// Get Course Names
const findCourseNames = document.getElementsByClassName("title-subjectcode");
if (findCourseNames.length === 0) {
  console.log("No course names found");
} else {
  async function processCourseNames() {
    for (let i = 0; i < findCourseNames.length; i++) {
      // Split coursename at space. element before space is course subject
      const splitCourseName = findCourseNames[i].textContent.split(" ");
      const subject = splitCourseName[0];
      const courseNumber = splitCourseName[1];
      const cuReviewsLink = `https://cureviews.org/course/${subject}/${courseNumber}`;

      try {
        //   CUReview Stats in Line
        const classInfo = await getCUReviewsInfo(subject, courseNumber);
        const classInfoText = document.createElement("p");

        //   Difficulty Text
        const difficultyText = document.createElement('span');
        difficultyText.textContent = ` Difficulty: ${classInfo[0].toFixed(2)}`;
        difficultyText.style.color = colorText(classInfo[0].toFixed(2));
        classInfoText.appendChild(difficultyText);

        // Rating Text
        const ratingText = document.createElement('span');
        ratingText.textContent = ` Rating: ${classInfo[1].toFixed(2)}`;
        ratingText.style.color = colorText(classInfo[1].toFixed(2));
        classInfoText.appendChild(ratingText);

        // Workload Text
        const workloadText = document.createElement('span');
        workloadText.textContent = ` Workload: ${classInfo[2].toFixed(2)}`;
        workloadText.style.color = colorText(classInfo[2].toFixed(2));
        classInfoText.appendChild(workloadText);

        //   Find parent node of course name and insert classInfoText after it
        const classSection = findCourseNames[i].parentNode;
        classSection.insertAdjacentElement("afterend", classInfoText);
        
        // Create a link to the CUReviews page
        const cuReviewsLinkElement = document.createElement("a");
        cuReviewsLinkElement.href = cuReviewsLink;
        cuReviewsLinkElement.textContent = "(View CUReviews Page)";
        cuReviewsLinkElement.style.color = "blue";
        classSection.insertAdjacentElement("afterend", cuReviewsLinkElement);
      } catch (error) {
        console.error(`No CUReviews For: ${subject} ${courseNumber}`);
        const classInfoText = document.createElement("p");
        classInfoText.textContent = `Error fetching class info`;
        classInfoText.style.color = "red";
        const classSection = findCourseNames[i].parentNode;
        classSection.insertAdjacentElement("afterend", classInfoText);
      }
    }
  }
  processCourseNames();
}