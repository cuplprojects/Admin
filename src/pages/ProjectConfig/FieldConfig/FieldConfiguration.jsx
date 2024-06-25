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
    responses: '',
    numberOfBlocks: ''
  });
  const [savedData, setSavedData] = useState([]);
  const [fields, setFields] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);
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
    axios.get('http://localhost:5071/api/Fields?WhichDatabase=Local')
      .then(response => {
        setFields(response.data);
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    axios.get('http://localhost:5071/api/FieldConfigurations?WhichDatabase=Local')
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

    if ((id === 'minRange' && value > formData.maxRange) ||
      (id === 'maxRange' && value < formData.minRange)) {
      showAlert('Maximum range cannot be less than minimum range.', 'danger');
      setFormData(prevState => ({
        ...prevState,
        [id]: id === 'minRange' ? formData.minRange : formData.maxRange
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.field || !formData.maxRange || !formData.numberOfBlocks) {
        showAlert('Please fill in all fields.', 'danger');
        return;
    }

    if (parseInt(formData.minRange) > parseInt(formData.maxRange)) {
        showAlert('Maximum range cannot be less than minimum range.', 'danger');
        return;
    }

    const newConfig = {
        fieldConfigurationId: 0, // Adjust as needed
        projectId: 1, // Adjust as needed
        fieldAttributesJson: "",
        fieldAttributes: [{
            field: formData.field,
            minRange: formData.minRange,
            maxRange: formData.maxRange,
            responses: formData.responses,
            numberOfBlocks: formData.numberOfBlocks.toString()
        }]
    };

    // Log the payload to the console for debugging
    console.log("Payload to be sent:", JSON.stringify(newConfig, null, 2));

    if (selectedFieldIndex !== -1) {
        const updatedData = [...savedData];
        updatedData[selectedFieldIndex] = { ...updatedData[selectedFieldIndex], ...newConfig };
        setSavedData(updatedData);
        setSelectedFieldIndex(-1);
        showAlert('Field configuration updated successfully.', 'success');
    } else {
        axios.post('http://localhost:5071/api/FieldConfigurations?WhichDatabase=Local', newConfig)
            .then(response => {
                const newFieldConfig = response.data;
                setSavedData([...savedData, newFieldConfig]);
                showAlert('Field configuration saved successfully.', 'success');
                setPagination({ ...pagination, total: savedData.length + 1 });
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
        responses: '',
        numberOfBlocks: ''
    });
};


  useEffect(() => {
    if (savedData.length > 0) {
      const savedFieldNames = savedData.map(item => item.fieldAttributes[0].field);
      const filteredFields = fields.filter(field => !savedFieldNames.includes(field.fieldName));
      setFields(filteredFields);
    }
  }, [savedData]);

  const handleDelete = (fieldConfigurationId) => {
    axios.delete(`http://localhost:5071/api/FieldConfigurations/${fieldConfigurationId}?WhichDatabase=Local`)
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
    setFormVisible(true);
    setSelectedFieldIndex(rowIndex);
    setFormData({
      field: record.fieldAttributes[0].field,
      minRange: record.fieldAttributes[0].minRange,
      maxRange: record.fieldAttributes[0].maxRange,
      responses: record.fieldAttributes[0].responses,
      numberOfBlocks: record.fieldAttributes[0].numberOfBlocks
    });
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  const columns = [
    {
      title: 'Field',
      dataIndex: ['fieldAttributes', 0, 'field'],
      key: 'field',
      sorter: (a, b) => a.fieldAttributes[0].field.localeCompare(b.fieldAttributes[0].field),
    },
    {
      title: 'Min Range',
      dataIndex: ['fieldAttributes', 0, 'minRange'],
      key: 'minRange',
      sorter: (a, b) => parseInt(a.fieldAttributes[0].minRange) - parseInt(b.fieldAttributes[0].minRange),
    },
    {
      title: 'Max Range',
      dataIndex: ['fieldAttributes', 0, 'maxRange'],
      key: 'maxRange',
      sorter: (a, b) => parseInt(a.fieldAttributes[0].maxRange) - parseInt(b.fieldAttributes[0].maxRange),
    },
    {
      title: 'Preferred Responses',
      dataIndex: ['fieldAttributes', 0, 'responses'],
      key: 'responses',
      sorter: (a, b) => a.fieldAttributes[0].responses.localeCompare(b.fieldAttributes[0].responses),
    },
    {
      title: 'Number of Blocks',
      dataIndex: ['fieldAttributes', 0, 'numberOfBlocks'],
      key: 'numberOfBlocks',
      sorter: (a, b) => parseInt(a.fieldAttributes[0].numberOfBlocks) - parseInt(b.fieldAttributes[0].numberOfBlocks),
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
    const { field, order } = sorter;
    if (order === 'ascend') {
      setSavedData([...savedData].sort((a, b) => a[field] - b[field]));
    } else if (order === 'descend') {
      setSavedData([...savedData].sort((a, b) => b[field] - a[field]));
    }
    setPagination({ ...pagination });
  };

  return (
    <div className="field-config-container">

      <div className='text-end'>
      <Button type="primary" onClick={toggleFormVisibility} style={{ marginBottom: 16 }}>
        {isFormVisible ? 'Hide Form' : 'Add New Configuration'}
      </Button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="field">Field Name</label>
            <Select
              id="field"
              style={{width: '140px', marginLeft: '2rem'}}
              value={formData.field}
              onChange={(value) => setFormData({ ...formData, field: value })}
            >
              {fields.map((field, index) => (
                <Option key={index} value={field.fieldName}>{field.fieldName}</Option>
              ))}
            </Select>
          </div>
          <div className="form-group">
            <label htmlFor="maxRange">Max Range</label>
            <Input
              id="maxRange"
              type="number"
              value={formData.maxRange}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="minRange">Min Range</label>
            <Input
              id="minRange"
              type="number"
              value={formData.minRange}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="responses">Preferred Responses</label>
            <Input
              id="responses"
              type="text"
              value={formData.responses}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="numberOfBlocks">Number of Blocks</label>
            <Input
              id="numberOfBlocks"
              type="text"
              value={formData.numberOfBlocks}
              readOnly
              disabled
            />
          </div>
          <div className='text-end mt-2 mb-2'>
          <Button type="primary" htmlType="submit">
            Save Configuration
          </Button>
          </div>
        </form>
      )}

      {alertMessage && (
        <div className={`alert alert-${alertType}`}>
          {alertMessage}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={savedData}
        rowKey="fieldConfigurationId"
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default FieldConfiguration;
