import React, { useState, useEffect } from 'react';
import './style.css';

const ZoomedImage = ({ src, data, onUpdate, onNext }) => {
  const [value, setValue] = useState(data.FieldValue);

  useEffect(() => {
    setValue(data.FieldValue);
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

  const { x, y, width, height } = data.coordinates;
  const scale = 700 / width; // Assuming the original image width is 700px

  return (
    <div
      className="m-auto zoomimg"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(2)`,
        width,
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
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
          className="form-control border-danger text-center p-0"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default ZoomedImage;
