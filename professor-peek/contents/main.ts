import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://classes.cornell.edu/browse/roster/*", "https://classes.cornell.edu/search/roster/*"]
}

export async function getRateMyProfessorScore(professorLastName, professorFirstName) {
    const response = await fetch(`https://professorpeek.onrender.com/${professorLastName}/${professorFirstName}`, {
  //   const response = await fetch(`http://127.0.0.1:5000/${professorLastName}/${professorFirstName}`, {
  
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    const data = await response.json(); // or response.textContent if you're expecting a string
  //   console.log(data);
    return data;
  }
  
  // Get Staff Names
  export async function getStaffNames() {
    const findMeetingPatterns = document.getElementsByClassName("meeting-pattern");
    if (findMeetingPatterns.length === 0) {
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
                                  // ----------------
                                  // Get the name and netid from the tooltip and add RMP Score
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
                                      // console.log(`${lastName}: in map with ${rmpData}`);
                                  } else {
                                      try {
                                          let rmpResponse = await getRateMyProfessorScore(lastName, firstName);
                                          rmpData = rmpResponse["rating"];
                                          rmp_link = rmpResponse["rmp_link"];
                                          num_ratings = rmpResponse["num_ratings"];
                                          if (rmpData === 0) {
                                              rmpData = 0.0;
                                          }
                                          professorMap[lastName] = [rmpData, rmp_link, num_ratings];
                                      } catch (error) {
                                          console.log(`Error fetching RateMyProfessor score for ${lastName} : ${error.message}`);
                                          rmpData = 0.0;
                                      }
                                  }
                                // Update professor name on page
                                const originalText = tooltipElement.textContent;
                                tooltipElement.innerHTML = `${originalText} - ${rmpData} (${num_ratings} Ratings)`;
                                // change on click behavior on tooltipelement
                                tooltipElement.style.cursor = "pointer";
                                tooltipElement.onclick = function () { writeClipboardText(`${firstName} ${lastName}`); };
                                tooltipElement.style.color = colorText(rmpData, false);
                                if (rmp_link == "None") {
                                  const rmp_link_element = document.createElement("p"); // Create an <p> element
                                  rmp_link_element.textContent = "No Ratings Found"; // Set the text
                                  instructorsPTag.insertAdjacentElement("afterend", rmp_link_element);
                                } else {
                                  const rmp_link_element = document.createElement("a"); // Create an <a> element
                                  rmp_link_element.href = rmp_link; // Set the href attribute to the URL
                                  rmp_link_element.textContent = "View Professor Ratings"; // Set the link text
                                  rmp_link_element.target = "_blank"; // Optional: open in a new tab
                                  instructorsPTag.insertAdjacentElement("afterend", rmp_link_element);
                                  
                                  const br = document.createElement("br");
                                  rmp_link_element.insertAdjacentElement("afterend", br);
                                  
                                  const rmp_leave_review = document.createElement("a"); 
                                  rmp_leave_review.href = convertToReviewLink(rmp_link); 
                                  rmp_leave_review.textContent = "Leave A Review"; 
                                  rmp_leave_review.target = "_blank"; 
                                  br.insertAdjacentElement("afterend", rmp_leave_review);
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
  
  // Function To Get CUReviews Information For A Course
export async function getCUReviewsInfo(subject, courseNumber) {
    try {
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
        if (data.result === null || data.result === undefined) {
            console.log(`No CUReviews For: ${subject} ${courseNumber}`);
            throw new Error(`No CUReviews For: ${subject} ${courseNumber}`);
        } else {
            try {
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
            } catch (error) {
                console.error("getCUReviewsInfo: Error fetching CUReviews data:", error.message);
                return [0, 0, 0, 0, []];
            }
        }
    } catch (error) {
        console.error("getCUReviewsInfo: Error fetching CUReviews data:", error.message);
        return [0, 0, 0, 0, []];
  }
}
  
  // Get Course Names, Get CUReviews Info, Add Data to Page
export async function processCourseNames() {
      const downgradedCourses = new Map([
          ['CS 3700', '4700'],
          ['CS 3780', '4780'],
          ['ECE 3200', '4200'],
          ['ORIE 3741', '4741'],
          ['STSCI 3740', '4740']
      ]);
      
    const findCourseNames = document.getElementsByClassName("title-subjectcode");
    if (findCourseNames.length === 0) {
        console.log("No course names found");
  
    } else {
        for (let i = 0; i < findCourseNames.length; i++) {
            // Split coursename at space. element before space is course subject
            const splitCourseName = findCourseNames[i].textContent.split(" ");
            const subject = splitCourseName[0];
            let courseNumber = splitCourseName[1];
            if (downgradedCourses.has(subject + " " + courseNumber)) {
                  courseNumber = downgradedCourses.get(subject + " " + courseNumber);
                  // console.log(`Downgraded Course Found: ${subject} ${courseNumber}`);
            }
            else {
              courseNumber = splitCourseName[1];
            }
  
          // Get CUReviews Information and add ratings under the title of the course
          const cuReviewsLink = `https://cureviews.org/course/${subject}/${courseNumber}`;
            try {
                //   CUReview Stats in Line
                const classInfo = await getCUReviewsInfo(subject, courseNumber);
                const classInfoText = document.createElement("p");
                // give p element a class name
                classInfoText.className = "class-info-text";
  
                // Rating Text
                const ratingText = document.createElement('span');
                ratingText.textContent = ` Rating: ${classInfo[1].toFixed(2)} \u{2605}`;
                ratingText.style.color = colorText(classInfo[1].toFixed(2), false);
                classInfoText.appendChild(ratingText);
                
                //   Difficulty Text
                const difficultyText = document.createElement('span');
                difficultyText.textContent = ` Difficulty: ${classInfo[0].toFixed(2)}`;
                difficultyText.style.color = colorText(classInfo[0].toFixed(2), true);
                classInfoText.appendChild(difficultyText);
  
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
                    reviewText.textContent = `${j + 1}. ${review.text} (Overall Rating: ${review.rating}\u{2605}, Professor: ${review.professors[0]})`;
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

  
function toggleCourseSections() {
    console.log("------------------Toggling Course Sections");
    // Toggle Sections
    var sections = document.querySelectorAll('div.sections');
  
    // Iterate through each section
    sections.forEach(section => {
      const toggleButton = document.createElement("button");
      toggleButton.textContent = "\u{25B6} Show Enrollment Information";  // Set initial button text to "Show Enrollment Information" with a right arrow
      toggleButton.style.backgroundColor = "transparent";  // No background
      toggleButton.style.color = "#077f97";  // Blue text
      toggleButton.style.border = "none";  // No border
      toggleButton.style.borderRadius = "0";  // No rounded corners
      toggleButton.style.marginBottom = "5px";
      toggleButton.style.marginRight = "5px";
      toggleButton.style.cursor = "pointer";
      toggleButton.style.textDecoration = "none";  // No underline
      toggleButton.style.outline = "none";  // Remove focus outline
      toggleButton.style.fontSize = "12px";  // Optional: set font size
      toggleButton.style.fontFamily = "Helvetica, Arial, sans-serif";  // Set font to Helvetica, with Arial and sans-serif as fallbacks
  
  
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
          if (isHidden) {
              toggleButton.textContent = "\u{25BC} Hide Enrollment Information";  // Text with a down arrow when showing sections
          } else {
              toggleButton.textContent = "\u{25B6} Show Enrollment Information";  // Text with a right arrow when hiding sections
          }
      }
  
      // Add event listener to the button
      toggleButton.addEventListener("click", toggleEnrlgrp);
        });
  }
  
function backToTop() {
    var sections = document.querySelectorAll('div.home');
  
    // Create an a href element
    const backToTop = document.createElement("a");
    
    // Set the text content
    backToTop.textContent = "Back to Top";
    
    // Set the href attribute
    backToTop.href = "#";
    
    // Apply the style to make it fixed and visually distinct
    backToTop.style.position = "fixed";
    backToTop.style.width = "90px"; // Adjusted to match your div style
    backToTop.style.height = "50px"; // Adjusted to match your div style
    backToTop.style.backgroundColor = "blue"; // Color from your div style
    backToTop.style.color = "white";
    backToTop.style.border = "none";
    backToTop.style.borderRadius = "5px";
    backToTop.style.margin = "0"; // Removing margin for fixed positioning
    backToTop.style.right = "20px"; // Distance from the right edge of the viewport
    backToTop.style.bottom = "20px"; // Distance from the bottom edge of the viewport
    backToTop.style.cursor = "pointer";
    backToTop.style.display = "flex"; // To center text inside
    backToTop.style.justifyContent = "center"; // Center horizontally
    backToTop.style.alignItems = "center"; // Center vertically
    backToTop.style.textDecoration = "none"; // Remove underline from link
    
    // Append the element to the body
    document.body.appendChild(backToTop);
    
    // Add an event listener to the element
    backToTop.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default anchor click behavior
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to the top
    });
    
  }
  
  // backToTop();
  // getStaffNames();
  // processCourseNames();
  // toggleCourseSections();
  
  function parseTime(timeStr) {
      const [time, period] = timeStr.split(/(?=[AP]M$)/i);
      let [hours, minutes] = time.split(':').map(Number);
      if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
  }
  
  function compareTimes(inputTime, filterStartTime, filterEndTime, filterType) {
      if (typeof inputTime.textContent !== 'string' || typeof filterStartTime !== 'string') {
          console.log("Input or filter time is not a string:", inputTime, filterStartTime);
          throw new Error('Both inputTime and filterStartTime must be strings.');
      }
      // input minutes is the string 9:05 - 10:25am from the class listing
      const inputMinutes = parseTime(inputTime.textContent.split(' - ')[0]);
      const startFilterMinutes = parseTime(filterStartTime.split(' - ')[0]);
      const endFilterMinutes = filterEndTime ? parseTime(filterEndTime.split(' - ')[0]) : null;
  
      if (filterType === "before") {
          return inputMinutes < startFilterMinutes;
      } else if (filterType === "after") {
          return inputMinutes > startFilterMinutes;
      } else if (filterType === "inbetween" && endFilterMinutes !== null) {
          const endInputMinutes = parseTime(inputTime.textContent.split(' - ')[1]);
          return inputMinutes >= startFilterMinutes && endInputMinutes <= endFilterMinutes;
      } else {
          throw new Error("Invalid filter type specified. Use 'before', 'after', or 'in between'.");
      }
  }
  
  function checkIfAllUlHidden(children) {
      const allHidden = Array.from(children).every(ul => {
          return ul.style.display === 'none' || window.getComputedStyle(ul).display === 'none';
      });
  
      // Log the result or handle it as needed
      console.log("Are all UL elements hidden? " + allHidden);
      return allHidden;
  }
  
  // filterTime should be in the format 1:00pm
  // beforeOrAfter should be either "before" or "after"
  function applyClassFilter(beforeOrAfter, filterStartTime, filterEndTime = null) {
      const sections = document.querySelectorAll('ul.section.active-tab-details.flaggedSection');
  
      // Unhide all sections first
      sections.forEach(section => {
          section.style.display = "block";
      });
  
      // Apply filtering logic
      sections.forEach(section => {
          const sectionTime = section.querySelector("time.time");
          if (!sectionTime) {
              return;
          }
  
          if (!compareTimes(sectionTime, filterStartTime, filterEndTime, beforeOrAfter)) {
              section.style.display = "none";
              console.log("Hiding section:", section.querySelector("time.time").textContent);
          }
      });
  
      // go to parent of sections
      // if every child from index 1 to end has display none, hide the parent
      sections.forEach(section => {
          const parent = section.parentElement;
  
          let hideParent = true;
          if (checkIfAllUlHidden(parent.querySelectorAll('ul.section.active-tab-details.flaggedSection'))) {
              hideParent = true;
          } else {
              hideParent = false;
          }
          if (hideParent) {
              parent.parentElement.parentElement.parentElement.style.display = "none";
              console.log("hiding parent", parent.parentElement.parentElement.parentElement.className);
          }
      });
  }
  
  function resetFiltering() {
      const sections = document.querySelectorAll('ul.section.active-tab-details.flaggedSection');
      const nodes = document.querySelectorAll('div.node');
  
      // Unhide all sections 
      sections.forEach(section => {
          section.style.display = "block";
      });
  
      // unhide all nodes
      nodes.forEach(node => {
          node.style.display = "block";
      });
  }
  
  function watchForClassListing() {
          const classListing = document.querySelector('div.class-listing');
          if (classListing && document.querySelector('p.selectedOption') === null) {
              processCourseNames();
              getStaffNames();
              backToTop();
              toggleCourseSections();
              makeFilter();
            //   console.log(window.location.toString())
          }
          else {
              setTimeout(() => watchForClassListing(), 5000);
              // console.log("waiting for class-listing");
          }
  }
  
  
  async function makeFilter() {
    
    // Making filter section
    const classListing = document.querySelector('div.class-listing');
    if (classListing === null)  {
        console.log("No class listing found");
    } else {
        console.log("Class listing found");
    }
    
    // Create a paragraph to display the chosen option or default message
    const displayStatus = document.createElement("p");
    displayStatus.textContent = "Select A Filter Type"; // Default text
    displayStatus.className = "selectedOption"
    
    classListing.appendChild(displayStatus); // Append the display element to the same container as the dropdown
    
    // Create the button that will toggle the dropdown
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Select Filter Type"; // Set the button text
    classListing.appendChild(toggleButton); // Append the button to the body or another container element
    
    // Create the dropdown menu container
    const dropdownMenu = document.createElement("div");
    dropdownMenu.style.display = "none"; // Initially hide the dropdown
    dropdownMenu.style.position = "absolute"; // Position it below the button (adjust as needed)
    dropdownMenu.style.border = "1px solid #ccc";
    dropdownMenu.style.backgroundColor = "#fff";
    dropdownMenu.style.padding = "5px";
    dropdownMenu.style.zIndex = "1"; // Ensure it's above other elements
    dropdownMenu.style.margin = "5px";
    
    // Create options for the dropdown
    const optionAfter = document.createElement("div");
    optionAfter.textContent = "After";
    optionAfter.style.padding = "10px";
    optionAfter.style.cursor = "pointer";
    
    const optionBefore = document.createElement("div");
    optionBefore.textContent = "Before";
    optionBefore.style.padding = "10px";
    optionBefore.style.cursor = "pointer";
    
    // Create the 'In Between' option for the dropdown
    const optionInBetween = document.createElement("div");
    optionInBetween.textContent = "In Between";
    optionInBetween.style.padding = "10px";
    optionInBetween.style.cursor = "pointer";
    
    // Add options to the dropdown menu
    dropdownMenu.appendChild(optionAfter);
    dropdownMenu.appendChild(optionBefore);
    dropdownMenu.appendChild(optionInBetween);
    
    // Append the dropdown menu to the body
    classListing.appendChild(dropdownMenu);
    
    // Function to toggle dropdown visibility
    function toggleDropdown() {
        if (dropdownMenu.style.display === "none") {
            dropdownMenu.style.display = "block";
            toggleButton.textContent = "Select Filter Type"; // Reset the button text when opening the dropdown
        } else {
            dropdownMenu.style.display = "none";
        }
    }
    
    // Event listener to open/close the dropdown when the button is clicked
    toggleButton.addEventListener("click", function() {
        toggleDropdown();
        if (dropdownMenu.style.display === "block") {
            displayStatus.textContent = "Select an option"; // Reset to default when opening the dropdown
        }
    });
    
    [optionAfter, optionBefore, optionInBetween].forEach(option => {
        option.addEventListener("click", function() {
            applyFilterButton.style.display = "inline";
    
            // Set the text of the toggleButton to the current selection
            toggleButton.textContent = this.textContent;
            // Adjust visibility of the end time dropdown based on the selection
            endTimeDropdown.style.display = this.textContent === "In Between" ? "inline" : "none";
            // Hide the dropdown menu after selection
            dropdownMenu.style.display = "none";
            // Display the selected filter type
            displayStatus.textContent = `Filter type selected: ${this.textContent}`;
            displayStatus.className = "selectedOption"; // Set class name for selected option
        });
    });
    // Event to hide the dropdown and reset display when clicking outside
    document.addEventListener("click", function(event) {
        if (!dropdownMenu.contains(event.target) && !toggleButton.contains(event.target)) {
            dropdownMenu.style.display = "none";
            // Check if a selection has been made or reset to default
            if (toggleButton.textContent === "Select Filter Type") {
                displayStatus.textContent = "No option selected";
                applyFilterButton.style.display = "none"; // Disable the button if no option is selected
            }
        }
    });
    
  
    
    const timeOptions = createTimeOptions();
    const startTimeDropdown = document.createElement("select");
    const endTimeDropdown = document.createElement("select");
    
    timeOptions.forEach(time => {
        const startOption = document.createElement("option");
        startOption.value = startOption.textContent = time;
        startTimeDropdown.appendChild(startOption);
    
        const endOption = document.createElement("option");
        endOption.value = endOption.textContent = time;
        endTimeDropdown.appendChild(endOption);
    });
    
    startTimeDropdown.style.margin = "5px";
    endTimeDropdown.style.margin = "5px";
    
    const applyFilterButton = document.createElement("button");
    applyFilterButton.textContent = "Apply Filter";
    applyFilterButton.style.display = "none";  // Initially disable the button
    applyFilterButton.style.margin = "5px";
    
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.style.margin = "5px";
    
    
    applyFilterButton.addEventListener("click", function() {
        const selectedOption = document.querySelector('.selectedOption').textContent.toLowerCase(); // Assuming you set a class 'selectedOption' to the selected text div
        const selectedOptionText = selectedOption.split(":")[1].replace(/\s+/g, '');
        let selectedTime = startTimeDropdown.value; // Assuming you want to use the start time dropdown for this purpose
        // remove the space between the time and am in selectedTime
        selectedTime = selectedTime.replace(" ", "");
        console.log("select option", selectedOptionText, "selected time:", selectedTime);
    
        if (selectedOptionText === "inbetween") {
            const endTime = endTimeDropdown.value;
            let startTimeMinutes = parseTime(selectedTime);
            let endTimeMinutes = parseTime(endTime);
    
            // 
            if (endTimeMinutes <= startTimeMinutes) {
                // alert user that end time must be after start time
                alert("End time must be after start time");
                return; // Stop further execution to prevent applying the filter
            }
            applyClassFilter(selectedOptionText, selectedTime, endTime);
        } else {
            applyClassFilter(selectedOptionText, selectedTime);
        }
    });
    
    resetButton.addEventListener("click", function() {
        resetFiltering();
        
    });
    classListing.appendChild(displayStatus);      // Add the status display to the DOM
    classListing.appendChild(toggleButton);        // Add the toggle button to the DOM
    classListing.appendChild(dropdownMenu);       // Add the dropdown menu to the DOM
    classListing.appendChild(startTimeDropdown);   // Add the start time dropdown to the DOM
    classListing.appendChild(endTimeDropdown);     // Add the end time dropdown to the DOM
    classListing.appendChild(applyFilterButton);
    classListing.appendChild(resetButton);
    
    
    classListing.insertAdjacentElement("beforebegin", displayStatus);
    classListing.insertAdjacentElement("beforebegin", dropdownMenu);
    classListing.insertAdjacentElement("beforebegin", toggleButton);
    classListing.insertAdjacentElement("beforebegin", startTimeDropdown);
    classListing.insertAdjacentElement("beforebegin", endTimeDropdown);
    classListing.insertAdjacentElement("beforebegin", applyFilterButton);
    classListing.insertAdjacentElement("beforebegin", resetButton);
  }

  
  
  function convertToReviewLink(professorLink) {
      const professorIdMatch = professorLink.match(/\/professor\/(\d+)/);
      if (professorIdMatch && professorIdMatch[1]) {
          const professorId = professorIdMatch[1];
          const reviewLink = `https://www.ratemyprofessors.com/add/professor-rating/${professorId}`;
          return reviewLink;
      } else {
          throw new Error("Invalid professor link");
      }
  }
    // ------ code for time dropdowns
    function createTimeOptions() {
        const times = [];
        for (let hour = 8; hour <= 21; hour++) {  // 8 AM to 9 PM
            for (let minute = 0; minute < 60; minute += 10) {
                const time = `${hour % 12 === 0 ? 12 : hour % 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
                times.push(time);
            }
        }
        return times;
    }
    
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

    async function writeClipboardText(text) {
        try {
            console.log("Copying to clipboard:", text);
          await navigator.clipboard.writeText(text);
        } catch (error) {
          console.error(error.message);
        }
      }

      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.message === 'TabUpdated') {
          watchForClassListing();
        }
      })
