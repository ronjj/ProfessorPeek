import React, { useState } from "react"

import "./component-styles/checklist.css"

const Checklist = () => {
  const [items, setItems] = useState([])
  const [input, setInput] = useState("")

  const addItem = () => {
    if (input.trim()) {
      setItems([...items, { text: input, completed: false }])
      setInput("")
    }
  }

  const removeItem = (index) => {
    const newItems = items.filter((item, i) => i !== index)
    setItems(newItems)
  }

  const toggleComplete = (index) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    )
    setItems(newItems)
  }

  return (
    <div className="checklist-container">
      <h2>Checklist</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new item"
      />
      <button onClick={addItem}>Add</button>
      <ul>
        {items.map((item, index) => (
          <li key={index} className={item.completed ? "completed" : ""}>
            <span onClick={() => toggleComplete(index)}>{item.text}</span>
            <button onClick={() => removeItem(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Checklist
