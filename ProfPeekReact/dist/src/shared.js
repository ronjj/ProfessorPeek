class Shared {
    async getCUReviewsInfo(subject, courseNumber) {
        const response = await fetch(`https://www.cureviews.org/api/getCourseByInfo`, {
            method: "POST",
            body: JSON.stringify({
                number: courseNumber,
                subject: subject.toLowerCase()
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
      
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
        });
      
        const data_two = await response_two.json();
        const num_reviews = data_two.result.length;
        const review_preview = data_two.result.slice(0, 2);
      
        return [classDifficulty, classRating, classWorkload, num_reviews, review_preview];
      }
}
