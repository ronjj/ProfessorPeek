function colorText(number) {

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

async function getRateMyProfessorScore(professorLastName) {
  const response = await fetch(`http://127.0.0.1:5000/${professorLastName}/test`, {
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
                      console.log("Staff found -ignoring");
                  } else {
                        // Get p tag for each instructor and get full name and netid.
                        // Start at 1 to skip the "Instructors" text
                        for (let k = 1; k < findInstructors[j].children.length; k++) {
                            const instructorsPTag = findInstructors[j].children[k];
                            if (instructorsPTag.querySelector('.tooltip-iws') === null) {
                                console.log("No tooltip found");
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
                                if (lastName in professorMap) {
                                    rmpData = professorMap[lastName];
                                    console.log(`${lastName}: in map with ${rmpData}`);
                                } else {
                                    try {
                                        rmpResponse = await getRateMyProfessorScore(lastName);
                                        rmpData = rmpResponse["rating"];
                                        rmp_link = rmpResponse["rmp_link"];
                                        if (rmpData === 0) {
                                            rmpData = "N/A";
                                        }
                                        professorMap[lastName] = rmpData;
                                    } catch (error) {
                                        console.log(`Error fetching RateMyProfessor score for ${lastName} : ${error.message}`);
                                        rmpData = "N/A";
                                    }
                                }
                              // Update professor name on page
                              const originalText = tooltipElement.textContent;
                              tooltipElement.innerHTML = `${originalText} - ${rmpData}`;
                              tooltipElement.style.color = colorText(rmpData);
                              if (rmp_link == "None") {
                                const rmp_link_element = document.createElement("p"); // Create an <p> element
                                rmp_link_element.textContent = "No Ratings Found"; // Set the text
                                instructorsPTag.insertAdjacentElement("afterend", rmp_link_element);
                              } else {
                                const rmp_link_element = document.createElement("a"); // Create an <a> element
                                rmp_link_element.href = rmp_link; // Set the href attribute to the URL
                                rmp_link_element.textContent = "(View Full Ratings)"; // Set the link text
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
  return [classDifficulty, classRating, classWorkload];
}

// Get Course Names, Get CUReviews Info, Add Data to Page
async function processCourseNames() {
  const findCourseNames = document.getElementsByClassName("title-subjectcode");
  if (findCourseNames.length === 0) {
      console.log("No course names found");
  } else {
      for (let i = 0; i < findCourseNames.length - 1; i++) {
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
}
// processCourseNames();