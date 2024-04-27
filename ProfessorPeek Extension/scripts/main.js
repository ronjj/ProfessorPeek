function colorText(number, isInverted) {

//   If inverted, low numbers are good and high numbers are bad
  if (isInverted) {
    if (number === 0 || number === "N/A") {
        return "black";
      }
      if (number >= 4) {
        return "red";
      }
      if (number >= 3) {
        return "black";
      }
      else {
        return "green";
      }
  } else {
    if (number === 0 || number === "N/A") {
        return "black";
      }
      if (number >= 4) {
        return "green";
      }
      if (number >= 3) {
        return "black";
      }
      else {
        return "red";
      }
  }
}

async function getRateMyProfessorScore(professorLastName, professorFirstName) {
  const response = await fetch(`https://professorpeek.onrender.com/${professorLastName}/${professorFirstName}`, {
  // const response = await fetch(`http://127.0.0.1:5000/${professorLastName}/${professorFirstName}`, {

      method: "GET",
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
  });
  const data = await response.json(); // or response.textContent if you're expecting a string
  console.log(data);
  return data;
}

// Get Staff Names
async function getStaffNames() {
  const findMeetingPatterns = document.getElementsByClassName("meeting-pattern");
  if (findMeetingPatterns.length === 0) {
      console.log("No professor names found");
  } else {
      const professorMap = {};
      for (let i = 0; i < findMeetingPatterns.length; i++) {
          const findInstructors = findMeetingPatterns[i].getElementsByClassName("instructors");
          // If the class name "Instructors" is found, then iterate through each item in findInstructors
          if (findInstructors.length > 0) {
              for (let j = 0; j < findInstructors.length; j++) {
                  // If the name is Staff, ignore it
                  if (findInstructors[j].textContent.includes("Staff")) {
                      // console.log("Staff found -ignoring");
                  } else {
                        // Get p tag for each instructor and get full name and netid.
                        // Start at 1 to skip the "Instructors" text
                        for (let k = 1; k < findInstructors[j].children.length; k++) {
                            const instructorsPTag = findInstructors[j].children[k];
                            if (instructorsPTag.querySelector('.tooltip-iws') === null) {
                                // console.log("No tooltip found");
                            } else {
                                const tooltipElement = instructorsPTag.querySelector('.tooltip-iws');
                                const nameAndNetID = tooltipElement.dataset.content;
                                let firstName = ""
                                let lastName = ""
                                // Split last name. Ex: "Anke Van Zuylen"
                                if (nameAndNetID.split(" ").length > 3) {
                                     firstName = nameAndNetID.split(" ")[0].toLowerCase();
                                     lastName = nameAndNetID.split(" ")[1].toLowerCase() + " " + nameAndNetID.split(" ")[2].toLowerCase();
                                } else {
                                    firstName = nameAndNetID.split(" ")[0].toLowerCase();
                                    lastName = nameAndNetID.split(" ")[1].toLowerCase();
                                }
                                let rmpData = 0.0
                                let rmp_link = ""
                                let num_ratings = 0.0
                                if (lastName in professorMap) {
                                    rmpData = professorMap[lastName][0];
                                    rmp_link = professorMap[lastName][1];
                                    num_ratings = professorMap[lastName][2];
                                    console.log(`${lastName}: in map with ${rmpData}`);
                                } else {
                                    try {
                                        rmpResponse = await getRateMyProfessorScore(lastName, firstName);
                                        rmpData = rmpResponse["rating"];
                                        rmp_link = rmpResponse["rmp_link"];
                                        num_ratings = rmpResponse["num_ratings"];
                                        if (rmpData === 0) {
                                            rmpData = "N/A";
                                        }
                                        professorMap[lastName] = [rmpData, rmp_link, num_ratings];
                                    } catch (error) {
                                        console.log(`Error fetching RateMyProfessor score for ${lastName} : ${error.message}`);
                                        rmpData = "N/A";
                                    }
                                }
                              // Update professor name on page
                              const originalText = tooltipElement.textContent;
                              tooltipElement.innerHTML = `${originalText} - ${rmpData} (${num_ratings} Ratings)`;
                              tooltipElement.style.color = colorText(rmpData, false);
                              if (rmp_link == "None") {
                                const rmp_link_element = document.createElement("p"); // Create an <p> element
                                rmp_link_element.textContent = "No Ratings Found"; // Set the text
                                instructorsPTag.insertAdjacentElement("afterend", rmp_link_element);
                              } else {
                                const rmp_link_element = document.createElement("a"); // Create an <a> element
                                rmp_link_element.href = rmp_link; // Set the href attribute to the URL
                                rmp_link_element.textContent = "(RateMyProfessor Page)"; // Set the link text
                                rmp_link_element.target = "_blank"; // Optional: open in a new tab
                                instructorsPTag.insertAdjacentElement("afterend", rmp_link_element);
                              }
                            }
                        }
                  }
              }
          } else {
              console.log("No professor names found")
          }
      }
  }
}

getStaffNames();

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

// Get Course Names, Get CUReviews Info, Add Data to Page
async function processCourseNames() {
  const findCourseNames = document.getElementsByClassName("title-subjectcode");
  if (findCourseNames.length === 0) {
      console.log("No course names found");
  } else {
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
              // give p element a class name
              classInfoText.className = "class-info-text";

              //   Difficulty Text
              const difficultyText = document.createElement('span');
              difficultyText.textContent = ` Difficulty: ${classInfo[0].toFixed(2)}`;
              difficultyText.style.color = colorText(classInfo[0].toFixed(2), true);
              classInfoText.appendChild(difficultyText);

              // Rating Text
              const ratingText = document.createElement('span');
              ratingText.textContent = ` Rating: ${classInfo[1].toFixed(2)}`;
              ratingText.style.color = colorText(classInfo[1].toFixed(2), false);
              classInfoText.appendChild(ratingText);

              // Workload Text
              const workloadText = document.createElement('span');
              workloadText.textContent = ` Workload: ${classInfo[2].toFixed(2)}`;
              workloadText.style.color = colorText(classInfo[2].toFixed(2), true);
              classInfoText.appendChild(workloadText);

            //   Number of Ratings
              const numberOfRatings = document.createElement('span');
              numberOfRatings.textContent = ` (${classInfo[3]} Ratings)`;
              numberOfRatings.style.color = "black";
              classInfoText.appendChild(numberOfRatings);

              //   Find parent node of course name and insert classInfoText after it
              const classSection = findCourseNames[i].parentNode;
              classSection.insertAdjacentElement("afterend", classInfoText);

              // Create a link to the CUReviews page
              const cuReviewsLinkElement = document.createElement("a");
              cuReviewsLinkElement.href = cuReviewsLink;
              cuReviewsLinkElement.textContent = "(View CUReviews Page)";
              cuReviewsLinkElement.style.color = "blue";
              classSection.insertAdjacentElement("afterend", cuReviewsLinkElement);

             // Make a toggle button to show/hide reviews
              const toggleButton = document.createElement("button");
              toggleButton.textContent = "Show Recent Reviews";
              toggleButton.style.backgroundColor = "blue";
              toggleButton.style.color = "white";
              toggleButton.style.border = "none";
              toggleButton.style.borderRadius = "5px";
              toggleButton.style.marginBottom = "5px";
              toggleButton.style.marginRight = "5px";
              toggleButton.style.padding = "7px";
              toggleButton.style.cursor = "pointer";

              // Append the button to the section
              classSection.insertAdjacentElement("afterend", toggleButton);

              // Create an array to store the review elements for toggling visibility
              const reviewElements = [];

              // Iterate through review_preview and get the reviews and ratings
              // Initialize a variable to hold the last inserted review element. This is needed so reviews are displayed in proper order
              let lastInsertedReview = null;

              for (let j = 0; j < classInfo[4].length; j++) {
                  const review = classInfo[4][j];
                  const reviewText = document.createElement("p");
                  reviewText.textContent = `${j + 1}. ${review.text} (Overall Rating: ${review.rating}, Professor: ${review.professors[0]})`;
                  reviewText.style.color = "black";
                  reviewText.style.display = "none";  // Initially hide the reviews

                  if (lastInsertedReview === null) {
                      // If no reviews have been inserted, insert the first review directly after classSection
                      classSection.insertAdjacentElement("afterend", reviewText);
                  } else {
                      // Insert subsequent reviews after the last one added
                      lastInsertedReview.insertAdjacentElement("afterend", reviewText);
                  }
                  
                  // Update the lastInsertedReview to the current one
                  lastInsertedReview = reviewText;
                  reviewElements.push(reviewText);  // Store the review element for later use
              }

              // Function to toggle the display of reviews
              function toggleReviews() {
                  const isHidden = reviewElements[0].style.display === "none";
                  reviewElements.forEach(element => {
                      element.style.display = isHidden ? "block" : "none";  // Toggle display
                  });
                  toggleButton.textContent = isHidden ? "Hide Reviews" : "Show Recent Reviews";  // Toggle button text
              }

              // Add event listener to the button
              toggleButton.addEventListener("click", toggleReviews);

          } catch (error) {
              console.error(`No CUReviews For: ${subject} ${courseNumber}`);
              const classInfoText = document.createElement("p");
              classInfoText.textContent = `No Class Ratings Found`;
              classInfoText.style.color = "black";
              const classSection = findCourseNames[i].parentNode;
              classSection.insertAdjacentElement("afterend", classInfoText);
          }
      }
  }
}
processCourseNames();


function toggleCourseSections() {
  // Toggle Sections
  var sections = document.querySelectorAll('div.sections');

  // Iterate through each section
  sections.forEach(section => {
      const toggleButton = document.createElement("button");
      toggleButton.textContent = "Show Sections";  // Set initial button text to "Show Sections"
      toggleButton.style.backgroundColor = "white";
      toggleButton.style.color = "black";
      toggleButton.style.border = "1px solid black"; // Thin black border
      toggleButton.style.borderRadius = "5px"; // Rounded corners
      toggleButton.style.marginBottom = "5px";
      toggleButton.style.marginRight = "5px";
      toggleButton.style.padding = "7px";
      toggleButton.style.cursor = "pointer";
      
      // Append the button to the section
      section.insertAdjacentElement("beforebegin", toggleButton);
      
      // Create an array to store the enrlgrp elements for toggling visibility specific to this section
      const enrlgrpElements = Array.from(section.querySelectorAll(".enrlgrp"));
      
      // Initially hide all enrlgrp elements
      enrlgrpElements.forEach(element => element.style.display = "none");

      // Function to toggle the display of enrlgrp elements specific to this section
      function toggleEnrlgrp() {
          const isHidden = enrlgrpElements[0].style.display === "none";
          enrlgrpElements.forEach(element => {
              element.style.display = isHidden ? "block" : "none";  // Toggle display
          });
          toggleButton.textContent = isHidden ? "Hide Sections" : "Show Sections";  // Toggle button text
      }
      
      // Add event listener to the button
      toggleButton.addEventListener("click", toggleEnrlgrp);    
  });
}


toggleCourseSections();