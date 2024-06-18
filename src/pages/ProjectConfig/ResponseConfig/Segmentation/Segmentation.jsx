import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'antd';
import { useThemeToken } from '@/theme/hooks';

const Segmentation = () => {
  const { colorPrimary } = useThemeToken();
  const [isDivided, setIsDivided] = useState(null); // State to hold the selected option
  const [numSections, setNumSections] = useState(0); // State to hold the number of sections
  const [sections, setSections] = useState([]); // State to hold section details
  const [isEditing, setIsEditing] = useState(true); // State to toggle edit mode for all sections
  const [showAlert, setShowAlert] = useState(false); // State to control alert visibility

  // Effect to reset form state when switching between yes/no options
  useEffect(() => {
    if (isDivided === 'no') {
      setNumSections(0);
      setSections([]);
    }
  }, [isDivided]);

  const handleRadioChange = (e) => {
    setIsDivided(e.target.value);
  };

  const handleNumSectionsChange = (e) => {
    const num = parseInt(e.target.value);
    setNumSections(num);
    setSections(Array.from({ length: num }, () => ({
      name: '',
      numQuestions: 0,
      marksCorrect: 0,
      negativeMarking: false,
      marksWrong: 0,
      totalMarks: 0
    })));
  };

  const handleSectionNameChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].name = e.target.value;
    setSections(newSections);
  };

  const handleNumQuestionsChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].numQuestions = parseInt(e.target.value);
    setSections(newSections);
  };

  const handleMarksCorrectChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].marksCorrect = parseFloat(e.target.value);
    setSections(newSections);
  };

  const handleNegativeMarkingChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].negativeMarking = e.target.checked;
    setSections(newSections);
  };

  const handleMarksWrongChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].marksWrong = parseFloat(e.target.value);
    setSections(newSections);
  };

  const handleTotalMarksChange = (e, index) => {
    const newSections = [...sections];
    newSections[index].totalMarks = parseFloat(e.target.value);
    setSections(newSections);
  };

  const handleSave = () => {
    // Check if there are any empty required fields
    const isValid = validateFields();
    if (isValid) {
      setIsEditing(false); // Disable editing after saving
      setShowAlert(false); // Hide alert if shown
      // Perform save operations here if needed
    } else {
      setShowAlert(true); // Show alert for empty fields
    }
  };

  const validateFields = () => {
    if (isDivided === 'yes') {
      if (numSections === 0) {
        return false; // Cannot save if number of sections is not entered
      }
      for (let i = 0; i < numSections; i++) {
        if (!sections[i]?.name || !sections[i]?.numQuestions || !sections[i]?.marksCorrect || !sections[i]?.totalMarks) {
          return false;
        }
      }
    } else {
      if (!sections[0]?.name || !sections[0]?.numQuestions || !sections[0]?.marksCorrect || !sections[0]?.totalMarks) {
        return false;
      }
    }
    return true;
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3>Segmentation</h3>
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <p style={{ marginRight: '10px' }}>Is Question Paper divided in Sections?</p>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            name="dividedSections"
            value="yes"
            checked={isDivided === 'yes'}
            onChange={handleRadioChange}
          />{' '}
          Yes
        </label>
        <label>
          <input
            type="radio"
            name="dividedSections"
            value="no"
            checked={isDivided === 'no'}
            onChange={handleRadioChange}
          />{' '}
          No
        </label>
      </div>

      {isDivided === 'yes' && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            Number of Sections:
            <input
              type="number"
              value={numSections}
              onChange={handleNumSectionsChange}
              min="0"
              disabled={!isEditing}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </label>

          {numSections > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              {[...Array(numSections)].map((_, index) => (
                <div key={index} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                  <label style={{ marginBottom: '5px' }}>
                    Section Name:
                    <input
                      type="text"
                      value={sections[index]?.name || ''}
                      onChange={(e) => handleSectionNameChange(e, index)}
                      disabled={!isEditing}
                      style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                    />
                  </label>

                  <label style={{ marginBottom: '5px' }}>
                    Number of Questions:
                    <input
                      type="number"
                      value={sections[index]?.numQuestions || ''}
                      onChange={(e) => handleNumQuestionsChange(e, index)}
                      min="0"
                      disabled={!isEditing}
                      style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                    />
                  </label>

                  <label style={{ marginBottom: '5px' }}>
                    Marks for Correct Answer:
                    <input
                      type="number"
                      step="0.01"
                      value={sections[index]?.marksCorrect || ''}
                      onChange={(e) => handleMarksCorrectChange(e, index)}
                      min="0"
                      disabled={!isEditing}
                      style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                    />
                  </label>

                  <label style={{ marginBottom: '5px' }}>
                    Negative Marking:
                    <input
                      type="checkbox"
                      checked={sections[index]?.negativeMarking || false}
                      onChange={(e) => handleNegativeMarkingChange(e, index)}
                      disabled={!isEditing}
                      style={{ marginLeft: '10px', marginRight: '5px' }}
                    />
                  </label>

                  {sections[index]?.negativeMarking && (
                    <label style={{ marginBottom: '5px' }}>
                      Marks for Wrong Answer:
                      <input
                        type="number"
                        step="0.01"
                        value={sections[index]?.marksWrong || ''}
                        onChange={(e) => handleMarksWrongChange(e, index)}
                        min="0"
                        disabled={!isEditing}
                        style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                      />
                    </label>
                  )}

                  <label style={{ marginBottom: '5px' }}>
                    Total Marks:
                    <input
                      type="number"
                      step="0.01"
                      value={sections[index]?.totalMarks || ''}
                      onChange={(e) => handleTotalMarksChange(e, index)}
                      min="0"
                      disabled={!isEditing}
                      style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isDivided === 'no' && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginBottom: '5px' }}>
            Section Name:
            <input
              type="text"
              value={sections[0]?.name || ''}
              onChange={(e) => handleSectionNameChange(e, 0)}
              disabled={!isEditing}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ marginBottom: '5px' }}>
            Number of Questions:
            <input
              type="number"
              value={sections[0]?.numQuestions || ''}
              onChange={(e) => handleNumQuestionsChange(e, 0)}
              min="0"
              disabled={!isEditing}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ marginBottom: '5px' }}>
            Marks for Correct Answer:
            <input
              type="number"
              step="0.01"
              value={sections[0]?.marksCorrect || ''}
              onChange={(e) => handleMarksCorrectChange(e, 0)}
              min="0"
              disabled={!isEditing}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ marginBottom: '5px' }}>
            Negative Marking:
            <input
              type="checkbox"
              checked={sections[0]?.negativeMarking || false}
              onChange={(e) => handleNegativeMarkingChange(e, 0)}
              disabled={!isEditing}
              style={{ marginLeft: '10px', marginRight: '5px' }}
            />
          </label>

          {sections[0]?.negativeMarking && (
            <label style={{ marginBottom: '5px' }}>
              Marks for Wrong Answer:
              <input
                type="number"
                step="0.01"
                value={sections[0]?.marksWrong || ''}
                onChange={(e) => handleMarksWrongChange(e, 0)}
                min="0"
                disabled={!isEditing}
                style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
              />
            </label>
          )}

          <label style={{ marginBottom: '5px' }}>
            Total Marks:
            <input
              type="number"
              step="0.01"
              value={sections[0]?.totalMarks || ''}
              onChange={(e) => handleTotalMarksChange(e, 0)}
              min="0"
              disabled={!isEditing}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </label>
        </div>
      )}

      {showAlert && (
        <Alert
          message="Validation Error"
          description={isDivided === 'yes' ? "Please enter the number of sections and fill out all required fields before saving." : "Please fill out all required fields before saving."}
          type="warning"
          showIcon
          closable
          onClose={() => setShowAlert(false)}
          style={{ marginTop: '10px' }}
        />
      )}

      <div className=' d-flex justify-center'>
        <Button type="primary" className="btn  mb-2 text-center" onClick={handleSave} style={{ marginTop: '10px' }} disabled={!isEditing || (isDivided === 'yes' && numSections === 0)}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default Segmentation;
