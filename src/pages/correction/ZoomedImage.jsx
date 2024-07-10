import React, { useState, useEffect } from 'react';
import './style.css';

const ZoomedImage = ({ data, onUpdate, onNext }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (data) {
      setValue(data.FieldValue);
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
    onNext(); // Handle case where data or coordinates are not yet available
    return;
  }

  const { x, y, width, height } = data.coordinates;
  const scale = 700 / width; // Assuming the original image width is 700px

  return (
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
        <input
          type="text"
          className="form-control border-danger p-0 text-center"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default ZoomedImage;
