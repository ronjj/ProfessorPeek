import "./component-styles/resources.css"

// Helper function to generate semester code based on current date
const getCurrentSemesterCode = (): string => {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() returns 0-11
  const year = now.getFullYear()
  const yearSuffix = year.toString().slice(-2)

  const semesterCode =
    month >= 1 && month <= 6 ? `SP${yearSuffix}` : `FA${yearSuffix}`

  console.log("Current month:", month)
  console.log("Current year:", year)
  console.log("Semester code:", semesterCode)

  return semesterCode
}

export const Resources = () => {
  const semesterCode = getCurrentSemesterCode()
  return (
    <>
      <div className="resources-wrapper">
        <div className="resources-container">
          <div className="sub-header">
            <h3>General Resources</h3>
            <ul>
              <li>
                <a
                  href="https://registrar.cornell.edu/calendar/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Key Academic Dates
                </a>
              </li>
              <li>
                <a
                  href="https://registrar.cornell.edu/academic-calendar"
                  target="_blank"
                  rel="noopener noreferrer">
                  Academic Calendar
                </a>
              </li>
              <li>
                <a
                  href="https://studentessentials.cornell.edu/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Student Center
                </a>
              </li>
              <li>
                <a
                  href="https://www.ratemyprofessors.com/"
                  target="_blank"
                  rel="noopener noreferrer">
                  RateMyProfessor.com
                </a>
              </li>
              <li>
                <a
                  href={`https://classes.cornell.edu/scheduler/roster/${semesterCode}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  Class Scheduler
                </a>
              </li>
              <li>
                <a
                  href={`https://classes.cornell.edu/browse/roster/${semesterCode}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  Browse Classes
                </a>
              </li>
              <li>
                <a
                  href="https://craft.cis.cornell.edu/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Find New Classes - CourseCrafter
                </a>
              </li>
              <li>
                <a
                  href="https://pathways.cornell.edu/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Find New Classes - Pathways
                </a>
              </li>
              <li>
                <a
                  href={`https://classes.cornell.edu/syllabi-landing/roster/${semesterCode}/`}
                  target="_blank"
                  rel="noopener noreferrer">
                  Find Class Syllabi
                </a>
              </li>
              <li>
                <a
                  href="https://www.cureviews.org/"
                  target="_blank"
                  rel="noopener noreferrer">
                  CUReviews
                </a>
              </li>
              <li>
                <a
                  href="https://cuadd.org/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Track Classes - CUAdd
                </a>
              </li>
              <li>
                <a
                  href="https://apps.apple.com/tt/app/coursegrab/id1510823691?ign-mpt=uo%3D2"
                  target="_blank"
                  rel="noopener noreferrer">
                  Track Classes - CourseGrab
                </a>
              </li>
              <li>
                <a
                  href="https://apps.apple.com/us/app/grabbit/id6450518666"
                  target="_blank"
                  rel="noopener noreferrer">
                  Track Classes - Grabbit
                </a>
              </li>
            </ul>
          </div>
          <div className="sub-header">
            <h3>College Specific</h3>
            <ul>
              <li>
                <a
                  href="http://data.arts.cornell.edu/as-stus"
                  target="_blank"
                  rel="noopener noreferrer">
                  Arts and Science Checklist
                </a>
              </li>
              <li>
                <a
                  href="https://dust.cals.cornell.edu"
                  target="_blank"
                  rel="noopener noreferrer">
                  CALS and Dyson Checklist
                </a>
              </li>
              <li>
                <a
                  href="https://checklists.coecis.cornell.edu/student_checklist.cfm"
                  target="_blank"
                  rel="noopener noreferrer">
                  Comp, Info, and Data Sci Checklist
                </a>
              </li>
              <li>
                <a
                  href="https://apps.engineering.cornell.edu/CourseEval/crseval/results/"
                  target="_blank"
                  rel="noopener noreferrer">
                  College of Engineering Course Evals
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="buttons-footer-wrapper">
          <div className="buttons-container">
            <a
              href="https://chromewebstore.google.com/detail/professorpeek/jilfmfcpampggogoeppklpbkkejnoglo"
              className="button-link"
              target="_blank"
              rel="noopener noreferrer">
              Leave A Review
            </a>
            <a
              href="mailto:rj336@cornell.com"
              className="button-link"
              target="_blank"
              rel="noopener noreferrer">
              Contact Developer
            </a>
          </div>
          <footer>
            <p>
              ProfessorPeek - Developed by Ronald Jabouin Jr - rj336@cornell.edu
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}

export default Resources
