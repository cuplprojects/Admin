import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldConfig.css';
import { Button, Table, Input, Select, Space, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useThemeToken } from '@/theme/hooks';

const { Option } = Select;

const FieldConfiguration = () => {
  const { colorPrimary } = useThemeToken();
  const [isFormVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    field: '',
    minRange: '',
    maxRange: '',
    controlType: '',
    numberOfBlocks: 0
  });
  const [savedData, setSavedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fields, setFields] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);
  const [selectedFieldData, setSelectedFieldData] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '50']
  });


  useEffect(() => {
    if (formData.maxRange) {
      setFormData(prevFormData => ({
        ...prevFormData,
        numberOfBlocks: formData.maxRange.toString().length
      }));
    }
  }, [formData.maxRange]);
  
  useEffect(() => {
    axios.get('http://localhost:5071/api/Fields')
      .then(response => {
        setFields(response.data);
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    axios.get('http://localhost:5071/api/FieldConfigurations')
      .then(response => {
        setSavedData(response.data);
        setPagination({ ...pagination, total: response.data.length });
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
    } else {
      // Add new field configuration
      axios.post('http://localhost:5071/api/FieldConfigurations', newConfig)
        .then(response => {
          const newFieldConfig = response.data;
          setSavedData([...savedData, newFieldConfig]); // Update savedData with the new data
          showAlert('Field configuration saved successfully.', 'success');
          setPagination({ ...pagination, total: savedData.length + 1 }); // Update pagination if necessary
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

  useEffect(() => {
    if (savedData.length > 0) {
      const savedFieldNames = savedData.map(item => item.attributeDetails.field); // Extracting field names from savedData 0
      // Filter fields to include only those that exist in savedData

      const filteredFields = fields.filter(field => !savedFieldNames.includes(field.fieldName));

      setFields(filteredFields);
    }
  }, [savedData]); // Ensure to include `fields` as a dependency if you are updating it based on `savedData`


  const handleCheckboxChange = (selectedRowKeys) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleDelete = (fieldConfigurationId) => {
    axios.delete(`http://localhost:5071/api/FieldConfigurations/${fieldConfigurationId}`)
      .then(() => {
        setSavedData(savedData.filter(item => item.fieldConfigurationId !== fieldConfigurationId));
        message.success('Field configuration deleted successfully.');
      })
      .catch(error => {
        console.error('Error deleting field configuration:', error);
        message.error('Error deleting field configuration. Please try again later.');
      });
  };

  const handleFieldSelection = (record, rowIndex) => {
    setFormVisible(!isFormVisible);
    setSelectedFieldIndex(rowIndex);
    setSelectedFieldData(record);
    setFormData({
      field: record.attributeDetails.field,
      minRange: record.attributeDetails.minRange,
      maxRange: record.attributeDetails.maxRange,
      controlType: record.attributeDetails.controlType,
      numberOfBlocks: record.attributeDetails.numberOfBlocks
    });

    // Remove currently selected field from selectedFields if it exists
    setSelectedFields(selectedFields.filter(field => field !== record.attributeDetails.field));
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

  const columns = [
    {
      title: 'Field',
      dataIndex: ['attributeDetails', 'field'],
      key: 'field',
      sorter: (a, b) => a.attributeDetails.field.localeCompare(b.attributeDetails.field),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Min Range',
      dataIndex: ['attributeDetails', 'minRange'],
      key: 'minRange',
      sorter: (a, b) => parseInt(a.attributeDetails.minRange) - parseInt(b.attributeDetails.minRange),
    },
    {
      title: 'Max Range',
      dataIndex: ['attributeDetails', 'maxRange'],
      key: 'maxRange',
      sorter: (a, b) => parseInt(a.attributeDetails.maxRange) - parseInt(b.attributeDetails.maxRange),
    },
    {
      title: 'Control Type',
      dataIndex: ['attributeDetails', 'controlType'],
      key: 'controlType',
      sorter: (a, b) => a.attributeDetails.controlType.localeCompare(b.attributeDetails.controlType),
    },
    {
      title: 'Number of Blocks',
      dataIndex: ['attributeDetails', 'numberOfBlocks'],
      key: 'numberOfBlocks',
      sorter: (a, b) => parseInt(a.attributeDetails.numberOfBlocks) - parseInt(b.attributeDetails.numberOfBlocks),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record, index) => (
        <Space>
          <Button type="link" onClick={() => handleFieldSelection(record, index)}>Edit</Button>
          <Popconfirm
            title="Are you sure delete this configuration?"
            onConfirm={() => handleDelete(record.fieldConfigurationId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table change:', pagination, filters, sorter);
    // Implement sorting logic
    const { field, order } = sorter;
    if (order === 'ascend') {
      setSavedData([...savedData.sort((a, b) => a[field] > b[field] ? 1 : -1)]);
    } else if (order === 'descend') {
      setSavedData([...savedData.sort((a, b) => a[field] < b[field] ? 1 : -1)]);
    }
  };

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
                {fields.map((field) => (
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
            <Button type="primary" className="btn mb-2 text-center" onClick={handleSave}>
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
          <Table
            columns={columns}
            dataSource={savedData}
            rowKey={record => record.fieldConfigurationId}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </div>
      )}
    </div>
  );
};

export default FieldConfiguration;