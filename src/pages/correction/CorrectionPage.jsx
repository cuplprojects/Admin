import React, { useState, useEffect } from 'react';
import { Button, Select } from 'antd';
import { Table } from 'react-bootstrap';
import { useMessage } from './../../utils/alerts/MessageContext';
import omr1 from '@/assets/images/omrs/100001.jpg';
import ZoomedImage from './ZoomedImage';
import FullImageView from './FullImageView';

const { Option } = Select;

const CorrectionPage = () => {
  const showMessage = useMessage();
  const [data, setData] = useState([
    {
      coordinates: { x: 402, y: 130.4375, width: 114, height: 136 },
      FieldName: 'Gender',
      FieldValue: 'Male',
    },
    {
      coordinates: { x: 29, y: 136.71875, width: 157, height: 222 },
      FieldName: 'Roll No',
      FieldValue: 20001,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDataCorrected, setAllDataCorrected] = useState(false);
  const [selectedField, setSelectedField] = useState(localStorage.getItem('selectedField') || ''); // State for selected field to correct
  const [expandMode, setExpandMode] = useState(false); // State to track expand mode

  const handleShowNotification = async (type, messageId) => {
    await showMessage(type, messageId);
  };

  useEffect(() => {
    // Reset the current index and correction status when the selected field changes
    setCurrentIndex(0);
    setAllDataCorrected(false);
    localStorage.setItem('selectedField', selectedField); // Save to local storage
  }, [selectedField]);

  const handleUpdate = (index, newValue) => {
    const updatedData = [...data];
    updatedData[index].FieldValue = newValue;
    setData(updatedData);
    localStorage.setItem('correctionData', JSON.stringify(updatedData)); // Save to local storage
  };

  const handleNext = () => {
    let fieldData = data;
    if (selectedField !== 'all') {
      fieldData = data.filter((item) => item.FieldName === selectedField);
    }

    if (currentIndex < fieldData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log(fieldData);
    } else {
      setAllDataCorrected(true);
      console.log('All data corrected:', fieldData);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFieldChange = (value) => {
    setSelectedField(value);
  };

  const toggleExpandMode = () => {
    setExpandMode(!expandMode);
  };

  const handleFullImageUpdate = (fieldName, newValue) => {
    const updatedData = [...data];
    const index = updatedData.findIndex((item) => item.FieldName === fieldName);
    if (index !== -1) {
      updatedData[index].FieldValue = newValue;
      setData(updatedData);
      localStorage.setItem('correctionData', JSON.stringify(updatedData)); // Save to local storage
    }
  };

  let fieldData = data;
  if (selectedField !== 'all') {
    fieldData = data.filter((item) => item.FieldName === selectedField);
  }
  const currentData = fieldData[currentIndex];
  const imageurl = omr1;
  const remainingFlags = allDataCorrected ? 0 : fieldData.length - currentIndex;

  // Extract unique field names using Set
  const uniqueFields = Array.from(new Set(data.map((item) => item.FieldName)));

  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <Select
          placeholder="Select field to correct"
          onChange={handleFieldChange}
          value={selectedField} // Set the value of the Select component
          style={{ width: 200 }}
        >
          <Option value="all">All</Option>
          {uniqueFields.map((field, index) => (
            <Option key={index} value={field}>
              {field}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={toggleExpandMode}>
          {expandMode ? 'Zoomed View' : 'Expand OMR'}
        </Button>
      </div>
      <p className="text-danger fs-5 m-1 text-center">Remaining Flags: {remainingFlags}</p>

      <div className="table-responsive">
        <Table className="table-bordered table-striped text-center">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>OMR Barcode Number</th>
              <th>Flag Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Project A</td>
              <td>123456</td>
              <td>{currentIndex + 1}</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '75%' }}>
        {!allDataCorrected && selectedField ? (
          expandMode ? (
            <FullImageView
              src={imageurl}
              data={currentData}
              onUpdate={(newValue) =>
                handleUpdate(
                  data.findIndex((item) => item === currentData),
                  newValue,
                )
              }
              onNext={handleNext}
            />
          ) : (
            <ZoomedImage
              src={imageurl}
              data={currentData}
              onUpdate={(newValue) =>
                handleUpdate(
                  data.findIndex((item) => item === currentData),
                  newValue,
                )
              }
              onNext={handleNext}
            />
          )
        ) : (
          <div className="text-center">
            <p className="fs-3">
              {!selectedField ? 'Please select a field to correct' : 'All data corrected'}
            </p>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-evenly m-1">
        <Button
          type="primary"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || !selectedField}
        >
          Previous
        </Button>
        <Button type="primary" onClick={handleNext} disabled={allDataCorrected || !selectedField}>
          Save and Next
        </Button>
      </div>
    </>
  );
};

export default CorrectionPage;
