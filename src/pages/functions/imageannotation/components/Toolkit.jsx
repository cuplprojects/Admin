import React from 'react';
import "./Toolkit.css";

const Toolkit = ({
  onDelete,
  onAdjustSize,
  isAdjustingSize,
  onLeftAdjust,
  onRightAdjust,
  onTopAdjust,
  onBottomAdjust,
  selectedAnnotation,
  selectedInputField,
  inputFields,
  setSelectedInputField,
  annotations,
  setAnnotations,
  mappedFields,
  setMappedFields // Assuming you have this setter function for mappedFields
}) => {
  // Function to handle input field change
  const handleInputChange = (event) => {
    const newInputField = event.target.value;
    setSelectedInputField(newInputField); // Update selectedInputField in state

    // Update annotations if a selected annotation exists
    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].inputName = newInputField;
      setAnnotations(updatedAnnotations); // Update annotations state
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations)); // Store in localStorage
    }

    // Update mappedFields state to mark the selected input field as mapped
    const updatedMappedFields = { ...mappedFields };
    updatedMappedFields[newInputField] = true; // Assuming true means mapped
    setMappedFields(updatedMappedFields); // Update state of mappedFields
    console.log(mappedFields)
  };

  return (
    <div>
      <button className='btn btn-primary m-1' onClick={onAdjustSize} disabled={!selectedAnnotation}>
        Adjust Size
      </button>
      <button className='btn btn-danger m-1' onClick={onDelete} disabled={!selectedAnnotation}>
        Delete
      </button>
      <br />
      {isAdjustingSize && selectedAnnotation !== null && (
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
          <button className='btn btn-primary m-1' disabled> Top </button>
          <button className='btn btn-primary m-1' onClick={() => onTopAdjust(-10)}>&nbsp;↑&nbsp;</button>
          <button className='btn btn-primary m-1' onClick={() => onTopAdjust(10)}>&nbsp;↓&nbsp;</button>
          <br />
          <button className='btn btn-primary m-1' disabled>Left</button>
          <button className='btn btn-primary m-1' onClick={() => onLeftAdjust(-10)}>←</button>
          <button className='btn btn-primary m-1' onClick={() => onLeftAdjust(10)}>→</button>
          <br />
          <button className='btn btn-primary m-1' disabled>Right</button>
          <button className='btn btn-primary m-1' onClick={() => onRightAdjust(-10)}>←</button>
          <button className='btn btn-primary m-1' onClick={() => onRightAdjust(10)}>→</button>
          <br />
          <button className='btn btn-primary m-1' disabled>Bottom</button>
          <button className='btn btn-primary m-1' onClick={() => onBottomAdjust(-10)}>↑</button>
          <button className='btn btn-primary m-1' onClick={() => onBottomAdjust(10)}>↓</button>
        </div>
      )}
      <br />
      {selectedAnnotation !== null && (
        <>
          {/* Dropdown to select input field */}
          <select className="form-select m-2" value={selectedInputField} onChange={handleInputChange}>
            <option value="">Select Input Field</option>
            {inputFields.map((field, index) => (
              <option key={index} value={field} disabled={mappedFields[field]}>
                {field}
              </option>
            ))}
          </select>
          {/* Display selected input field */}
          <p>You have selected: {selectedInputField}</p>
        </>
      )}
    </div>
  );
};

export default Toolkit;
