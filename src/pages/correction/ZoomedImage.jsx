import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is included
import './style.css';

const ZoomedImage = ({ data, onUpdate, onNext }) => {
  const [selectedResponse, setSelectedResponse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      setSelectedResponse(data.fieldNameValue || '');
    }
  }, [data]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSelectedResponse(inputValue);

    const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',') || [];
    const isValid = responses.length === 0 || responses.includes(inputValue);
    if (hasValidResponses) {
      if (!isValid && inputValue) {
        setError('Invalid input. Please enter a valid option.');
      } else {
        setError('');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',') || [];
      const isValid = responses.length === 0 || responses.includes(selectedResponse);
      if (hasValidResponses) {
        if (isValid) {
          onUpdate(selectedResponse);
          onNext();
        } else {
          setError('Invalid input. Please enter a valid option.');
        }
      }
      else{
        onUpdate(selectedResponse);
        onNext();
      }
    }
  };

  if (!data || !data.coordinates) {
    onNext();
    return null;
  }

  const { x, y, width, height } = data.coordinates;
  const scale = 700 / width; // Assuming the original image width is 700px
  const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
  const hasValidResponses =
    responses && responses.length > 0 && !(responses.length === 1 && responses[0] === '');

  return (

    <>
      {error && (
        <div className="alert alert-danger mt-2" role="alert">
          {error}
        </div>
      )}

      <div
        className="zoomimg m-auto"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(2)`,
          width,
          height,
          overflow: 'hidden',
        }}
      >
        <img
          src={data.imageUrl}
          alt="Zoomed Image"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${x / scale}px ${y / scale}px`,
            position: 'relative',
            left: `-${x / scale}px`,
            top: `-${y / scale}px`,
          }}
        />
        <div
          className="form-group"
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {hasValidResponses ? (
            <>
              <input
                type="text"
                className="form-control border-danger p-0 text-center"
                value={selectedResponse}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                autoFocus
                list="suggestions"
              />
              <datalist id="suggestions">
                {responses.map((response, index) => (
                  <option key={index} value={response.trim()}>
                    {response.trim()}
                  </option>
                ))}
              </datalist>
            </>
          ) : (
            <input
              type="text"
              className="form-control border-danger p-0 text-center"
              value={selectedResponse}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              autoFocus
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ZoomedImage;
