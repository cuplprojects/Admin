import React, { useState, useEffect } from 'react';
import { Select } from 'antd'; // Import Select from antd
import './style.css';

const { Option } = Select;

const ZoomedImage = ({ data, onUpdate, onNext }) => {
  const [selectedResponse, setSelectedResponse] = useState('');

  useEffect(() => {
    if (data) {
      setSelectedResponse(data.fieldNameValue);
    }
  }, [data]);

  const handleChange = (newValue) => {
    setSelectedResponse(newValue);
    onUpdate(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdate(selectedResponse);
      onNext();
    }
  };

  if (!data || !data.coordinates) {
    onNext();
    return null;
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
        {data.responses ? (
          <Select
            value={selectedResponse}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ width: '100%' }}
          >
            <Option value="">Select an option</Option>
            {data.responses.split(',').map((response, index) => (
              <Option key={index} value={response.trim()}>
                {response.trim()}
              </Option>
            ))}
          </Select>
        ) : (
          <input
            type="text"
            className="form-control border-danger p-0 text-center"
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

export default ZoomedImage;
