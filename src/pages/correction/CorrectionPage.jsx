import React, { useState, useEffect } from 'react';
import { Button, Select, notification, Checkbox } from 'antd';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import ZoomedImage from './ZoomedImage';
import FullImageView from './FullImageView';
import { useProjectActions, useProjectId } from '@/store/ProjectState';

const apiurl = import.meta.env.VITE_API_URL;
const { Option } = Select;

const CorrectionPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDataCorrected, setAllDataCorrected] = useState(false);
  const [expandMode, setExpandMode] = useState(false);
  const projectId = useProjectId();
  const { setProjectId } = useProjectActions();
  const [fieldCounts, setFieldCounts] = useState([]);
  const [remaining, setRemaining] = useState(0);
  const [selectedField, setSelectedField] = useState('all');
  const [unchangedata, setUnchangeData] = useState('');
  const [noChangeRequired, setNoChangeRequired] = useState(false);

  useEffect(() => {
    if (data[currentIndex]) {
      setUnchangeData(data[currentIndex].fieldNameValue);
    }
  }, [currentIndex, data]);

  useEffect(() => {
    fetchFieldCounts();
    fetchData();
  }, [projectId, selectedField]);

  useEffect(() => {
    const selectedfield = localStorage.getItem('selectedField');
    if (selectedfield) {
      setSelectedField(selectedfield);
    }
  }, []);

  const handleFieldChange = (value) => {
    setSelectedField(value);
    localStorage.setItem('selectedField', value); // Save selected field to localStorage
  };

  const fetchFieldCounts = async () => {
    try {
      const response = await axios.get(`${apiurl}/Flags/counts`);
      setFieldCounts(response.data.countsByFieldname);
      setRemaining(response.data.remaining);
    } catch (error) {
      console.error('Error fetching field counts:', error);
    }
  };

  const fetchData = async () => {
    setCurrentIndex(0);
    try {
      const flagsResponse = await axios.get(
        `${apiurl}/Correction/GetFlagsByCategory?WhichDatabase=Local&ProjectID=${projectId}&FieldName=${selectedField}`,
        { headers: { accept: 'application/json' } }
      );
      const flagsResult = flagsResponse.data;

      const imageConfigResponse = await axios.get(`${apiurl}/ImageConfigs/1`, {
        params: { WhichDatabase: 'Local' },
        headers: { accept: 'text/plain' },
      });
      const imageConfigResult = imageConfigResponse.data;

      const parsedAnnotations = JSON.parse(imageConfigResult.annotationsJson).map((annotation) => ({
        FieldName: annotation.FieldName,
        coordinates: JSON.parse(annotation.Coordinates.replace(/'/g, '"')),
        fieldNameValue: '',
        imageUrl: '',
      }));

      const mergedData = flagsResult.map((flag) => {
        const matchingAnnotation = parsedAnnotations.find(
          (annotation) => annotation.FieldName === flag.field
        );
        return {
          ...matchingAnnotation,
          flagId: flag.flagId,
          remarks: flag.remarks,
          fieldNameValue: flag.fieldNameValue || '',
          FieldName: flag.field,
          barCode: flag.barCode,
          projectId: projectId,
          isCorrected: true,
          imageUrl: `https://localhost:7290/OMR/${flag.barCode}.jpg`,
          noChangeRequired: false,
        };
      });

      setData(mergedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleUpdate = (index, newValue) => {
    const updatedData = [...data];
    updatedData[index].fieldNameValue = newValue;
    setData(updatedData);
  };

  const sendPostRequest = async (currentData) => {
    try {
      if (!currentData) {
        console.error('Current data is undefined or null');
        return;
      }

      const payload = {
        barCode: currentData.barCode,
        fieldName: currentData.FieldName,
        value: currentData.fieldNameValue,
      };

      const response = await axios.post(
        `${apiurl}/Correction/SubmitCorrection?WhichDatabase=Local`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Data posted successfully:', response.data);
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const handleNext = async () => {
    let fieldData = data;
    const currentData = fieldData[currentIndex];
    if (!currentData) {
      console.error('Current data is undefined or null');
      return;
    }
    if (unchangedata === currentData.fieldNameValue && !noChangeRequired) {
      console.log('Data has not changed:', unchangedata);
      notification.error({
        message: 'Alert',
        description: 'Please correct the data before submit',
        duration: 3,
      });
      return;
    } else {
      await sendPostRequest(currentData);

      if (currentIndex < fieldData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        fetchFieldCounts();
        setUnchangeData(data[currentIndex + 1]?.fieldNameValue);
      } else {
        fetchData();
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUnchangeData(data[currentIndex - 1]?.fieldNameValue);
    }
  };

  const toggleExpandMode = () => {
    setExpandMode(!expandMode);
  };

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
  }, [currentIndex, data, allDataCorrected]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <Select
          placeholder="All Fields"
          style={{ width: 200 }}
          value={selectedField}
          onChange={handleFieldChange} // Corrected onChange handler
        >
          <Option value="all">All</Option>
          {fieldCounts.map((field, index) => (
            <Option key={index} value={field.fieldName}>
              {field.fieldName}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={toggleExpandMode}>
          {expandMode ? 'Zoomed View' : 'Expand OMR'}
        </Button>
      </div>
      <p className="text-danger fs-5 m-1 text-center">Remaining Flags: {remaining}</p>

      <div className="table-responsive">
        <Table className="table-bordered table-striped text-center">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>OMR Barcode Number</th>
              <th>Remark</th>
              <th>Flag Number</th>
              <th>No Change Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Project {projectId}</td>
              <td>{data[currentIndex]?.barCode}</td>
              <td>{data[currentIndex]?.remarks}</td>
              <td>{data[currentIndex]?.flagId}</td>
              <td>
                <Checkbox
                  checked={noChangeRequired}
                  onChange={() => setNoChangeRequired(!noChangeRequired)}
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '75%' }}>
        {!allDataCorrected && data[currentIndex] ? (
          expandMode ? (
            <FullImageView
              data={data[currentIndex]}
              onUpdate={(newValue) =>
                handleUpdate(
                  data.findIndex((item) => item === data[currentIndex]),
                  newValue
                )
              }
              onNext={handleNext}
            />
          ) : (
            <ZoomedImage
              data={data[currentIndex]}
              onUpdate={(newValue) =>
                handleUpdate(
                  data.findIndex((item) => item === data[currentIndex]),
                  newValue
                )
              }
              onNext={handleNext}
            />
          )
        ) : (
          <div className="text-center">
            <p className="fs-3">All data corrected</p>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-evenly m-1">
        <Button type="primary" onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button type="primary" onClick={handleNext} disabled={allDataCorrected}>
          Next
        </Button>
      </div>
    </>
  );
};

export default CorrectionPage;
