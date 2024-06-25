import React from "react"

import "./popup.css"

const App = () => {
  return (
    <div>
      <div className="resources-container">
        <h2>Resources</h2>
        <div className="sub-header">
          <h3>General Resources</h3>
          <ul>
            <li>
              <a href="https://registrar.cornell.edu/calendar/">
                Key Academic Dates
              </a>
            </li>
            <li>
              <a href="https://registrar.cornell.edu/academic-calendar">
                Academic Calendar
              </a>
            </li>
            <li>
              <a href="https://studentessentials.cornell.edu/">
                Student Center
              </a>
            </li>
            <li>
              <a href="https://www.ratemyprofessors.com/">
                RateMyProfessor.com
              </a>
            </li>
            <li>
              <a href="https://www.cureviews.org/">CUReviews</a>
            </li>
            <li>
              <a href="https://cuadd.org/">Track Classes - CUAdd</a>
            </li>
            <li>
              <a href="https://apps.apple.com/tt/app/coursegrab/id1510823691?ign-mpt=uo%3D2">
                Track Classes - CourseGrab
              </a>
            </li>
            <li>
              <a href="https://apps.apple.com/us/app/grabbit/id6450518666">
                Track Classes - Grabbit
              </a>
            </li>
          </ul>
        </div>
        <div className="sub-header">
          <h3>College Specific</h3>
          <ul>
            <li>
              <a href="http://data.arts.cornell.edu/as-stus">
                Arts and Science Checklist
              </a>
            </li>
            <li>
              <a href="https://dust.cals.cornell.edu">
                CALS and Dyson Checklist
              </a>
            </li>
            <li>
              <a href="https://checklists.coecis.cornell.edu/student_checklist.cfm">
                Comp, Info, and Data Sci Checklist
              </a>
            </li>
            <li>
              <a href="https://apps.engineering.cornell.edu/CourseEval/crseval/results/">
                College of Engineering Course Evals
              </a>
            </li>
          </ul>
        </div>
      </div>

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
  )
}

export default App
