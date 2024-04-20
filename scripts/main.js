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

// Get RateMyProfessor Score
async function getRateMyProfessorScore(professorLastName) {
    const query = `query NewSearchTeachersQuery(
        $query: TeacherSearchQuery!
        $count: Int
      ) {
        newSearch {
          teachers(query: $query, first: $count) {
            didFallback
            edges {
              cursor
              node {
                id
                legacyId
                firstName
                lastName
                department
                departmentId
                school {
                  legacyId
                  name
                  id
                }
                ...CompareProfessorsColumn_teacher
              }
            }
          }
        }
      }
      
      fragment CompareProfessorsColumn_teacher on Teacher {
        id
        legacyId
        firstName
        lastName
        school {
          legacyId
          name
          id
        }
        department
        departmentId
        avgRating
        numRatings
        wouldTakeAgainPercentRounded
        mandatoryAttendance {
          yes
          no
          neither
          total
        }
        takenForCredit {
          yes
          no
          neither
          total
        }
        ...NoRatingsArea_teacher
        ...RatingDistributionWrapper_teacher
      }
      
      fragment NoRatingsArea_teacher on Teacher {
        lastName
        ...RateTeacherLink_teacher
      }
      
      fragment RatingDistributionWrapper_teacher on Teacher {
        ...NoRatingsArea_teacher
        ratingsDistribution {
          total
          ...RatingDistributionChart_ratingsDistribution
        }
      }
      
      fragment RatingDistributionChart_ratingsDistribution on ratingsDistribution {
        r1
        r2
        r3
        r4
        r5
      }
      
      fragment RateTeacherLink_teacher on Teacher {
        legacyId
        numRatings
        lockStatus
      }`;

    const variables = {
        "query": {
            "text": professorLastName,
            "schoolID": "U2Nob29sLTI5OA=="
        },
        "count": 10
    };

    const response = await fetch('https://www.ratemyprofessors.com/graphql', {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.7',
            "Origin": "https://www.ratemyprofessors.com",
            'Authorization': 'Basic dGVzdDp0ZXN0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Cookie': 'ccpa-notice-viewed-02=true; cid=UjVMSbzN3x-20230719; userSchoolId=U2Nob29sLTI5OA==; userSchoolLegacyId=298; userSchoolName=Cornell%20University',
            'Origin': 'Origin:https://www.ratemyprofessors.com',
            'Referer': 'https://www.ratemyprofessors.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-GPC': '1',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11.0; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            'sec-ch-ua': '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"'
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    const data = await response.json();
    return data;
}

getRateMyProfessorScore("white");

// Get Staff Names
async function getStaffNames() {
    const findMeetingPatterns = document.getElementsByClassName("meeting-pattern");
    if (findMeetingPatterns.length === 0) {
      console.log("No professor names found");
    } else {
        for (let i = 0; i < 2; i++) {
          const findInstructors = findMeetingPatterns[i].getElementsByClassName("instructors");
          // If the class name "Instructors" is found, then iterate through each item in findInstructors
          if (findInstructors.length > 0) {
            for (let j = 0; j < findInstructors.length; j++) {
              // If the name is Staff, ignore it
              if (findInstructors[j].textContent.includes("Staff")) {
                console.log("Staff found -ignoring");
              } else {
                // Get p tag for the instructor and get full name and netid
                const instructorsPTag = findInstructors[j].children[1];
                const tooltipElement = instructorsPTag.querySelector('.tooltip-iws');
                const nameAndNetID = tooltipElement.dataset.content;
                const firstName = nameAndNetID.split(" ")[0].toLowerCase();
                const lastName = nameAndNetID.split(" ")[1].toLowerCase();
                console.log(lastName);
                try {
                    const rmpData = await getRateMyProfessorScore(lastName);
                    console.log(rmpData);
                    // const professorInfo = rmpData.data.newSearch.teachers.edges[0].node.avgRating;
                    // console.log(`RateMyProfessor score for ${lastName}: ${professorInfo}`);
                } catch (error) {
                    console.log(`Error fetching RateMyProfessor score for ${lastName} : ${error.message}`);
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


// // Function To Get CUReviews Information For A Course
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