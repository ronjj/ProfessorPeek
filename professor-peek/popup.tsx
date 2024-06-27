import React, { useState } from "react"

import Bookmarks from "./components/bookmarks"
import Checklist from "./components/checklist"
import Resources from "./components/resources"

import "./popup.css"

const App = () => {
  const [activeTab, setActiveTab] = useState("Resources")

  const renderComponent = () => {
    switch (activeTab) {
      case "Resources":
        return <Resources />
      case "Checklist":
        return <Checklist />
      case "Bookmarks":
        return <Bookmarks />
      default:
        return <Resources />
    }
  }

  return (
    <div className="app-container">
      <div className="tab-menu">
        <span
          className={activeTab === "Resources" ? "active" : ""}
          onClick={() => setActiveTab("Resources")}>
          Resources
        </span>
        <span
          className={activeTab === "Checklist" ? "active" : ""}
          onClick={() => setActiveTab("Checklist")}>
          Checklist
        </span>
        <span
          className={activeTab === "Bookmarks" ? "active" : ""}
          onClick={() => setActiveTab("Bookmarks")}>
          Bookmarks
        </span>
      </div>
      <div className="component-container">{renderComponent()}</div>
    </div>
  )
}

export default App
