import React, { useState } from 'react';
import RectangleSelection from './RectangleSelection';

const FormWithRectangleSelection = () => {
  const [selectedFields, setSelectedFields] = useState([]);

  const handleSelect = (field) => {
    setSelectedFields([...selectedFields, field]);
  };

  const fields = ['Field 1', 'Field 2', 'Field 3', 'Field 4', 'Field 5'];

  return (
    <div>
      <h2>Form with Rectangle Selection</h2>
      <div className="form">
        {fields.map((field, index) => (
          <div key={index}>
            <label>{field}</label>
            <input type="text" disabled={selectedFields.includes(field)} />
          </div>
        ))}
      </div>
      <div className="rectangle-selection-container">
        <h3>Rectangle Selection</h3>
        <RectangleSelection fields={fields.filter(field => !selectedFields.includes(field))} onSelect={handleSelect} />
      </div>
    </div>
  );
};

export default FormWithRectangleSelection;
