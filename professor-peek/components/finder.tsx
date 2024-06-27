import React, { useState } from "react"

import "./component-styles/finder.css"

const Finder: React.FC = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim() === "") return

    setLoading(true)
    setResults([])

    try {
      // MARK: Fix endpoint
      const response = await fetch(
        `https://professorpeek.onrender.com/?question=${query}`
      )
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="finder-container">
      <form onSubmit={handleSubmit} className="finder-form">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for classes"
          className="finder-input"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="finder-button">
          Search
        </button>
      </form>
      {loading && <div className="loading-icon">Loading...</div>}
      <div className="results-container">
        {results.map((result, index) => (
          <div key={index} className="result-item">
            <h3>
              {result.course_code}: {result.course_name}
            </h3>
            <p>{result.course_description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Finder
