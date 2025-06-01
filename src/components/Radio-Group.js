// src/components/ui/radio-group.js
import React from "react";

export default function RadioGroup({ options, selected, onChange }) {
  return (
    <div>
      {options.map((opt) => (
        <label key={opt} style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
          <input
            type="radio"
            value={opt}
            checked={selected === opt}
            onChange={() => onChange(opt)}
            style={{ marginRight: "0.5rem" }}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
