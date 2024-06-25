import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldConfig.css';
import { Button } from 'antd';
import {Iconify, IconButton} from './../../../components/icon'
import { useThemeToken } from '@/theme/hooks';


const apiurl = import.meta.env.VITE_API_URL_PROD;


const FieldConfiguration = () => {
  const { colorPrimary } = useThemeToken();
  const [isFormVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    field: '',
    minRange: '',
    maxRange: '',
    controlType: '',
    numberOfBlocks: ''
  });
  const [savedData, setSavedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [fields, setFields] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);
  const [selectedFieldData, setSelectedFieldData] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    axios.get('apiurl/Fields')
      .then(response => {
        setFields(response.data);
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    axios.get('apiurl/FieldConfigurations')
      .then(response => {
        setSavedData(response.data);
      })
      .catch(error => {
        console.error('Error fetching field configurations:', error);
      });
  }, []);

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });

    // Additional validation for range fields
    if ((id === 'minRange' && value > formData.maxRange) ||
        (id === 'maxRange' && value < formData.minRange)) {
      showAlert('Maximum range cannot be less than minimum range.', 'danger');
      // Reset the field to its previous value
      setFormData(prevState => ({
        ...prevState,
        [id]: id === 'minRange' ? formData.minRange : formData.maxRange
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validate if any required field is empty
    if (!formData.field || !formData.minRange || !formData.maxRange || !formData.controlType || !formData.numberOfBlocks) {
      showAlert('Please fill in all fields.', 'danger');
      return;
    }

    // Validate range
    if (parseInt(formData.minRange) > parseInt(formData.maxRange)) {
      showAlert('Maximum range cannot be less than minimum range.', 'danger');
      return;
    }

    const newConfig = {
      attributeDetails: {
        field: formData.field,
        minRange: formData.minRange.toString(),
        maxRange: formData.maxRange.toString(),
        controlType: formData.controlType,
        numberOfBlocks: formData.numberOfBlocks.toString()
      },
      projectId: 1, // Example ProjectId, set accordingly
      fieldName: fields.find(f => f.fieldName === formData.field)?.fieldName || ""
    };

    if (selectedFieldIndex !== -1) {
      // Update existing field
      const updatedData = [...savedData];
      updatedData[selectedFieldIndex] = { ...updatedData[selectedFieldIndex], ...newConfig };
      setSavedData(updatedData);
      setSelectedFieldIndex(-1);
      setSelectedFieldData(null);
      showAlert('Field configuration updated successfully.', 'success');

      // Remove old field name from selectedFields
      setSelectedFields(selectedFields.filter(field => field !== savedData[selectedFieldIndex].attributeDetails.field));
    } else {
      // Add new field configuration
      axios.post('apiurl/FieldConfigurations', newConfig)
        .then(response => {
          setSavedData([...savedData, response.data]);
          showAlert('Field configuration saved successfully.', 'success');
        })
        .catch(error => {
          console.error('Error saving field configuration:', error);
          showAlert('Error saving field configuration. Please try again later.', 'danger');
          if (error.response) {
            console.error('Response data:', error.response.data);
          }
        });
    }

    setFormData({
      field: '',
      minRange: '',
      maxRange: '',
      controlType: '',
      numberOfBlocks: ''
    });

    // Add new field name to selectedFields
    setSelectedFields([...selectedFields, formData.field]);
  };

  const handleCheckboxChange = (index) => {
    setSelectedRows({
      ...selectedRows,
      [index]: !selectedRows[index]
    });
  };

  const handleDeleteSelected = () => {
    const selectedIds = savedData
      .filter((_, index) => selectedRows[index])
      .map(item => item.fieldConfigurationId);

    axios.all(selectedIds.map(id => axios.delete(`apiurl/FieldConfigurations/${id}`)))
      .then(() => {
        setSavedData(savedData.filter((_, index) => !selectedRows[index]));
        setSelectedRows({});
        setSelectAllChecked(false);
      })
      .catch(error => {
        console.error('Error deleting field configurations:', error);
      });
  };

  const handleSelectAll = () => {
    const allChecked = !selectAllChecked;
    let updatedSelectedRows = {};
    savedData.forEach((_, index) => {
      updatedSelectedRows[index] = allChecked;
    });
    setSelectedRows(updatedSelectedRows);
    setSelectAllChecked(allChecked);
  };

  const isAnyRowSelected = Object.values(selectedRows).some((isSelected) => isSelected);

  const handleFieldSelection = (index) => {
    setSelectedFieldIndex(index);
    setSelectedFieldData(savedData[index]);
    setFormData({
      field: savedData[index].attributeDetails.field,
      minRange: savedData[index].attributeDetails.minRange,
      maxRange: savedData[index].attributeDetails.maxRange,
      controlType: savedData[index].attributeDetails.controlType,
      numberOfBlocks: savedData[index].attributeDetails.numberOfBlocks
    });

    // Remove currently selected field from selectedFields
    setSelectedFields(selectedFields.filter(field => field !== savedData[index].attributeDetails.field));
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    // Automatically hide the alert after 3 seconds
    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  // Filter options for the select dropdown to exclude selected fields
  const filteredFields = fields.filter(field => !selectedFields.includes(field.fieldName));

  return (
    <div className="field-configuration">
      <div className='d-flex justify-content-between align-items-center'>
        <h2 className='mt-2'>Fields</h2>
        <i className='bx bx-edit-alt fs-4' onClick={toggleFormVisibility} style={{ cursor: 'pointer', color: colorPrimary }}></i>
      </div>
      {isFormVisible && (
        <div className="mt-3">
          <form className="form-inline">
            <div className="form-group mx-sm-3 mb-2">
              <label htmlFor="field" className="sr-only">Select Field</label>
              <select id="field" className="form-control" value={formData.field} onChange={handleInputChange}>
                <option value="">Select Field</option>
                {filteredFields.map((field) => (
                  <option key={field.fieldName} value={field.fieldName}>{field.fieldName}</option>
                ))}
              </select>
            </div>
            <div className="form-group mx-sm-3 mb-2">
              <label htmlFor="maxRange" className="sr-only">Maximum Range</label>
              <input type="number" id="maxRange" className="form-control" placeholder="Max Range" value={formData.maxRange} onChange={handleInputChange} />
            </div>
            <div className="form-group mx-sm-3 mb-2">
              <label htmlFor="minRange" className="sr-only">Minimum Range</label>
              <input type="number" id="minRange" className="form-control" placeholder="Min Range" value={formData.minRange} onChange={handleInputChange} />
            </div>
            <div className="form-group mx-sm-3 mb-2">
              <label htmlFor="controlType" className="sr-only">Control Type</label>
              <select id="controlType" className="form-control" value={formData.controlType} onChange={handleInputChange}>
                <option value="">Control Type</option>
                <option value="Text">Text</option>
                <option value="Radio Button">Radio Button</option>
              </select>
            </div>
            <div className="form-group mx-sm-3 mb-2">
              <label htmlFor="numberOfBlocks" className="sr-only">Number of Blocks</label>
              <input type="number" id="numberOfBlocks" className="form-control" placeholder="Blocks" value={formData.numberOfBlocks} onChange={handleInputChange} />
            </div>
            <Button type="primary" className="btn  mb-2 text-center" onClick={handleSave}>
              {selectedFieldIndex !== -1 ? 'Update' : 'Save'}
            </Button>
          </form>
        </div>
      )}
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
      {savedData.length > 0 && (
        <div className="mt-4">
          <div className='d-flex justify-content-between align-items-center'>
            <h1>Saved Fields</h1>
            {isAnyRowSelected && (
              <IconButton onClick={handleDeleteSelected} className="mt-2">
                <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
              </IconButton>
            )}
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Min Range</th>
                <th>Max Range</th>
                <th>Control Type</th>
                <th>Number of Blocks</th>
                <th>
                  Select All
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAll}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {savedData.map((data, index) => (
                <tr key={data.fieldConfigurationId} onClick={() => handleFieldSelection(index)} style={{ cursor: 'pointer' }}>
                  <td>{data.attributeDetails.field}</td>
                  <td>{data.attributeDetails.minRange}</td>
                  <td>{data.attributeDetails.maxRange}</td>
                  <td>{data.attributeDetails.controlType}</td>
                  <td>{data.attributeDetails.numberOfBlocks}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedRows[index]}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FieldConfiguration;
