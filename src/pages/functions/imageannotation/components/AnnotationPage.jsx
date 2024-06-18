// components/AnnotationPage.jsx
import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import AnnotationCanvas from './AnnotationCanvas';
import Toolkit from './Toolkit';

const AnnotationPage = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imgwidth, setImgwidth] = useState(null);
  const [imgheight, setImghight] = useState(null);
  const [annotations, setAnnotations] = useState(() => {
    const savedAnnotations = localStorage.getItem('annotations');
    return savedAnnotations ? JSON.parse(savedAnnotations) : [];
  });
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isAdjustingSize, setIsAdjustingSize] = useState(false);
  const [selectedInputField, setSelectedInputField] = useState('');
  const [mappedFields, setMappedFields] = useState({});
  const inputFields = ['Roll No', 'Booklet No', 'Booklet Series/Set', 'Year/Semester']; // Sample input fields

  const handleImageSelect = (url, width, height) => {
    setImageUrl(url);
    setImgwidth(width);
    setImghight(height);
  };

  useEffect(() => {
    if (selectedAnnotation !== null) {
      setSelectedInputField(annotations[selectedAnnotation].FieldName);
    }
  }, [selectedAnnotation, annotations]);

  useEffect(() => {
    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].FieldName = selectedInputField;
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
    }
  }, [selectedAnnotation, selectedInputField, annotations]);

  useEffect(() => {
    const mappedFieldsObj = {};
    annotations.forEach((annotation) => {
      mappedFieldsObj[annotation.FieldName] = true;
    });
    setMappedFields(mappedFieldsObj);
  }, [annotations]);

  const handleAddAnnotation = (coordinates) => {
    if (coordinates.width <= 0 || coordinates.height <= 0) {
      return;
    }

    const unmappedInputFields = inputFields.filter(
      (field) => !annotations.some((annotation) => annotation.FieldName === field),
    );

    if (unmappedInputFields.length === 0) {
      alert('All input fields are already mapped.');
      return;
    }

    const selectedField = prompt(
      `Select an input field to map (${unmappedInputFields.join(', ')}):`,
    );

    if (
      !selectedField ||
      annotations.some((annotation) => annotation.FieldName === selectedField)
    ) {
      alert('Please select a valid input field.');
      return;
    }

    const newAnnotation = {
      coordinates,
      FieldName: selectedField,
      FieldValue: '', // Add an empty value initially
    };
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    setSelectedInputField(selectedField);
  };

  const handleDeleteAnnotation = () => {
    const updatedAnnotations = annotations.filter((_, i) => i !== selectedAnnotation);
    setAnnotations(updatedAnnotations);
    setSelectedAnnotation(null);
    setIsAdjustingSize(false);
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
  };

  const handleAdjustSize = () => {
    setIsAdjustingSize(!isAdjustingSize);
  };

  const handleResize = (index, deltaX, deltaY, corner) => {
    const updatedAnnotations = [...annotations];
    const annotation = updatedAnnotations[index];
    const { x, y, width, height } = annotation.coordinates;

    switch (corner) {
      case 'bottom-left':
        annotation.coordinates = {
          ...annotation.coordinates,
          x: x + deltaX,
          width: width - deltaX,
          height: height + deltaY,
        };
        break;
      case 'bottom-right':
        annotation.coordinates = {
          ...annotation.coordinates,
          width: width + deltaX,
          height: height + deltaY,
        };
        break;
      case 'top-left':
        annotation.coordinates = {
          ...annotation.coordinates,
          x: x + deltaX,
          y: y + deltaY,
          width: width - deltaX,
          height: height - deltaY,
        };
        break;
      case 'top-right':
        annotation.coordinates = {
          ...annotation.coordinates,
          y: y + deltaY,
          width: width + deltaX,
          height: height - deltaY,
        };
        break;
      default:
        break;
    }

    setAnnotations(updatedAnnotations);
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
  };

  const handleAdjustLeftSize = (deltaX) => {
    handleResize(selectedAnnotation, deltaX, 0, 'bottom-left');
  };

  const handleAdjustRightSize = (deltaX) => {
    handleResize(selectedAnnotation, deltaX, 0, 'bottom-right');
  };

  const handleAdjustTopSize = (deltaY) => {
    handleResize(selectedAnnotation, 0, deltaY, 'top-left');
  };

  const handleAdjustBottomSize = (deltaY) => {
    handleResize(selectedAnnotation, 0, deltaY, 'bottom-right');
  };

  const startResizing = (e, index, corner) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      handleResize(index, deltaX, deltaY, corner);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div>
      <Toolkit
        onDelete={handleDeleteAnnotation}
        onAdjustSize={handleAdjustSize}
        isAdjustingSize={isAdjustingSize}
        onLeftAdjust={handleAdjustLeftSize}
        onRightAdjust={handleAdjustRightSize}
        onTopAdjust={handleAdjustTopSize}
        onBottomAdjust={handleAdjustBottomSize}
        inputFields={inputFields}
        selectedInputField={selectedInputField}
        setSelectedInputField={setSelectedInputField}
        mappedFields={mappedFields}
        selectedAnnotation={selectedAnnotation !== null}
      />
      <div className="d-flex align-items-center justify-content-center m-1">
        <ImageUploader onImageSelect={handleImageSelect} />
      </div>
      {imageUrl && (
        <div style={{ position: 'relative' }}>
          <AnnotationCanvas imageUrl={imageUrl} imgwidth={imgwidth} imgheight={imgheight} onAddAnnotation={handleAddAnnotation} />
          {annotations.map((annotation, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${annotation.coordinates.x}px`,
                top: `${annotation.coordinates.y}px`,
                width: `${annotation.coordinates.width}px`,
                height: `${annotation.coordinates.height}px`,
                border: selectedAnnotation === index ? '3px solid red' : '3px solid blue',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedAnnotation(index)}
            >
              <input
                style={{
                  width: '100%',
                  border: '1px solid black',
                  padding: '5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
                value={annotation.FieldValue}
                onChange={(e) => {
                  const updatedAnnotations = [...annotations];
                  updatedAnnotations[index].FieldValue = e.target.value;
                  setAnnotations(updatedAnnotations);
                  localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnotationPage;
