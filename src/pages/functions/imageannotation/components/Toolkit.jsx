import React from 'react';
import "./Toolkit.css"
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
}) => {
  const handleInputChange = (event) => {
    const newInputField = event.target.value;
    setSelectedInputField(newInputField);

    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].inputName = newInputField;
      setAnnotations(updatedAnnotations);
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 99,
        backgroundColor: '#dadada',
        marginBottom: '10px',
        height: 'calc(100vh - 20px)',
        padding: '20px',
        borderRadius: '8px',
      }}
    >
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
          <select className="form-select m-2" value={selectedInputField} onChange={handleInputChange}>
            <option value="">Select Input Field</option>
            {inputFields.map((field, index) => (
               <option key={index} value={field} disabled={mappedFields[field]}>
               {field}
             </option>
            ))}
          </select>
          <p>You have selected: {selectedInputField}</p>
        </>
      )}
    </div>
  );
};

export default Toolkit;
