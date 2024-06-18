import React, { useState } from 'react';
// import './RectangleSelection.css';

const RectangleSelection = ({ fields, onSelect }) => {
  const [selectedField, setSelectedField] = useState(null);

  const handleSelect = (field) => {
    setSelectedField(field);
    onSelect(field);
  };

  return (
    <div className="rectangle-selection">
      {fields.map((field, index) => (
        <div
          key={index}
          className={`rectangle ${selectedField === field ? 'selected' : ''}`}
          onClick={() => handleSelect(field)}
        >
          {field}
        </div>
      ))}
    </div>
  );
};

export default RectangleSelection;
