import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const FullImageView = ({ data, onUpdate, onNext }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (data) {
      setValue(data.fieldNameValue);
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [data]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    // Validate input value on change
    const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
    const isValid = responses ? responses.includes(inputValue) : true;
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
      const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
      const isValid = responses ? responses.includes(e.target.value) : true;

      if (hasValidResponses) {
        if (isValid) {
          onUpdate(value);
          onNext();
        } else {
          setError('Invalid input. Please enter a valid option.');
        }
      } else {
        onUpdate(value);
        onNext();
      }
    }
  };

  if (!data || !data.coordinates) {
    return null;
  }

  const { x, y, width, height } = data.coordinates;
  const originalWidth = 700; // Replace with the original width of your image
  const imageUrl = data.imageUrl;

  const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
  const hasValidResponses =
    responses && responses.length > 0 && !(responses.length === 1 && responses[0] === '');

  return (
    <>
      {error && (
        <div className="alert alert-info mt-2" role="alert">
          {error}
        </div>
      )}
      <div
        className="zoomimg m-auto"
        style={{
          position: 'relative',
          width: `${originalWidth}px`,
          margin: 'auto',
        }}
      >
        <img
          src={imageUrl}
          alt="Full Image"
          style={{
            width: `${originalWidth}px`,
          }}
        />
        <div
          className="form-group"
          style={{
            position: 'absolute',
            top: `${y}px`,
            left: `${x}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: '2px solid black',
          }}
        >
          <input
            type="text"
            ref={inputRef}
            className="form-control border-danger p-0 text-center"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              boxSizing: 'border-box',
            }}
            required
            autoFocus
            list="suggestions"
          />
          {hasValidResponses && (
            <datalist id="suggestions">
              {responses.map((response, index) => (
                <option key={index} value={response} />
              ))}
            </datalist>
          )}
        </div>
      </div>
    </>
  );
};

export default FullImageView;
