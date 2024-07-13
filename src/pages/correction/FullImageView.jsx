import React, { useState, useEffect } from 'react';
import './style.css';

const FullImageView = ({ data, onUpdate, onNext }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (data) {
      setValue(data.fieldNameValue);
    }
  }, [data]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdate(e.target.value);
      onNext();
    }
  };

  if (!data || !data.coordinates) {
    return null; // Handle case where data or coordinates are not yet available
  }

  const { x, y, width, height } = data.coordinates;
  const originalWidth = 700; // Replace with the original width of your image
  const imageUrl = data.imageUrl; // Ensure data includes imageUrl

  return (
    <div
      className="m-auto zoomimg"
      style={{
        position: 'relative',
        width: `${originalWidth}px`, // Set the width of the container to the original image width
        margin: 'auto',
      }}
    >
      <img
        src={data.imageUrl}
        alt="Full Image"
        style={{
          width: `${originalWidth}px`, // Set the image width to the original image width
        }}
      />
      <div
        className="form-group"
        style={{
          position: 'absolute',
          top: `${y}px`, // Adjust top position to match annotation y-coordinate
          left: `${x}px`, // Adjust left position to match annotation x-coordinate
          width: `${width}px`, // Set width to match annotation width
          height: `${height}px`, // Set height to match annotation height
          border: '2px solid black',
        }}
      >
        <input
          type="text"
          className="form-control border-danger text-center p-0"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', // Make input full width of its container
            boxSizing: 'border-box', // Ensure padding and border are included in width and height
          }}
          required
          autoFocus
        />
      </div>
    </div>
  );
};

export default FullImageView;