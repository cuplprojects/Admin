import React, { useState, useEffect } from 'react';
import { Button, Select } from 'antd';
import { Table } from 'react-bootstrap';
import { useMessage } from './../../utils/alerts/MessageContext';
import omr1 from '@/assets/images/omrs/100001.jpg';
import ZoomedImage from './ZoomedImage';
import FullImageView from './FullImageView';

const apiurl = import.meta.env.VITE_API_URL;
const { Option } = Select;

const CorrectionPage = () => {
  const showMessage = useMessage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDataCorrected, setAllDataCorrected] = useState(false);
  const [selectedField, setSelectedField] = useState('all');
  const [expandMode, setExpandMode] = useState(false);

  const handleShowNotification = async (type, messageId) => {
    await showMessage(type, messageId);
  };

  useEffect(() => {
    const selectedfield = localStorage.getItem('selectedField');
    setSelectedField(selectedfield);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch flags
        const flagsResponse = await fetch(`${apiurl}/Flags`, {
          headers: { accept: 'application/json' },
        });
        const flagsResult = await flagsResponse.json();

        // Fetch annotations
        const imageConfigResponse = await fetch(`${apiurl}/ImageConfigs/3?WhichDatabase=Local`, {
          headers: { accept: 'text/plain' },
        });
        const imageConfigResult = await imageConfigResponse.json();

        const parsedAnnotations = JSON.parse(imageConfigResult.annotationsJson).map(
          (annotation) => ({
            FieldName: annotation.FieldName,
            coordinates: JSON.parse(annotation.Coordinates.replace(/'/g, '"')),
            FieldValue: '',
            imageUrl: '',
          }),
        );

        // Merge flags with annotations based on FieldName and construct image URL
        const mergedData = flagsResult.map((flag) => {
          const matchingAnnotation = parsedAnnotations.find(
            (annotation) => annotation.FieldName === flag.field,
          );
          return {
            ...matchingAnnotation,
            FieldName: flag.field,
            FieldValue: flag.fieldNameValue,
            flagRemarks: flag.remarks,
            imageUrl: `https://localhost:7290/OMR/${flag.barCode}.jpg`,
            barCode: flag.barCode,
          };
        });

        setData(mergedData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Ensure loading is set to false on error as well
      }
    };
    fetchData();
  }, []);

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
    localStorage.setItem('correctionData', JSON.stringify(updatedData)); 
  };

  const sendPutRequest = async (currentData) => {
    try {
      const response = await fetch(`${apiurl}/Flags/${currentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update data');
      }
      const result = await response.json();
      console.log('Data updated successfully:', result);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleNext = async () => {
    let fieldData = data;
    if (selectedField !== 'all') {
      fieldData = data.filter((item) => item.FieldName === selectedField);
    }

    const currentData = fieldData[currentIndex];
    await sendPutRequest(currentData);

    if (currentIndex < fieldData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAllDataCorrected(true);
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const currentData = data[currentIndex];
      await sendPutRequest(currentData);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFieldChange = (value) => {
    setSelectedField(value);
  };

  const toggleExpandMode = () => {
    setExpandMode(!expandMode);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.ctrlKey && event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, data, selectedField, allDataCorrected]);

  if (loading) {
    return <p>Loading...</p>; // Render a loading indicator while fetching data
  }

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
              <th>Remark</th>
              <th>Flag Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Project A</td>
              <td>{currentData?.barCode}</td>
              <td>{currentData?.flagRemarks}</td>
              <td>{currentIndex + 1}</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '75%' }}>
        {!allDataCorrected && currentData && selectedField ? (
          expandMode ? (
            <FullImageView
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

export default CorrectionPage
