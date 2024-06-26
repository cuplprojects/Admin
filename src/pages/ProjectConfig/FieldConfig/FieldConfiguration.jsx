import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldConfig.css';
import { Button, Table, Input, Select, Space, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useThemeToken } from '@/theme/hooks';
import { Col, Row } from 'react-bootstrap';

const APIURL = import.meta.env.VITE_API_URL;
const { Option } = Select;

const FieldConfiguration = () => {
  const { colorPrimary } = useThemeToken();
  const [isFormVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    field: '',
    minRange: '',
    maxRange: '',
    responses: '',
    numberOfBlocks: '',
    canBlank: false,
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
    pageSizeOptions: ['10', '20', '30', '50'],
  });
  const [rangeError, setRangeError] = useState(false)


  // useEffect(() => {
  //   if (formData.maxRange) {
  //     setFormData(prevFormData => ({
  //       ...prevFormData,
  //       numberOfBlocks: formData.maxRange.toString().length
  //     }));
  //   }
  // }, [formData.maxRange]);
  useEffect(() => {
    getFields();
  }, []);
  
  useEffect(() => {
    axios
      .get(`${APIURL}/FieldConfigurations?WhichDatabase=Local`)
      .then((response) => {
        setSavedData(response.data);
        setPagination({ ...pagination, total: response.data.length });
      })
      .catch((error) => {
        console.error('Error fetching field configurations:', error);
      });
  }, []);


  const getFields = () => {
    axios
    .get(`${APIURL}/Fields?WhichDatabase=Local`)
    .then((response) => {
      setFields(response.data);
    })
    .catch((error) => {
      console.error('Error fetching fields:', error);
    });
  }

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleInputChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [id]: checked, // Update state with checked value for checkboxes
      });
    } else {
      setFormData({
        ...formData,
        [id]: value, // Update state with value for other input types
      });
    }
  };


  // if (id === 'inRange' && value > formData.maxRange) {
  //   showAlert('Minimum range cannot be greater than maximum range.', 'danger');
  //   setFormData((prevState) => ({
  //    ...prevState,
  //     [id]: formData.maxRange,
  //   }));
  // } else if (id === 'axRange' && value < formData.minRange) {
  //   showAlert('Maximum range cannot be less than minimum range.', 'danger');
  //   setFormData((prevState) => ({
  //    ...prevState,
  //     [id]: formData.minRange,
  //   }));
  // }

  useEffect(() => {
    const minRangeInt = parseInt(formData.minRange, 10);
    const maxRangeInt = parseInt(formData.maxRange, 10);

    if (minRangeInt > maxRangeInt) {
      setRangeError(true);
    } else {
      setRangeError(false);
    }
  }, [formData.minRange, formData.maxRange]);

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.field || !formData.numberOfBlocks) {
      showAlert('Please fill in all fields.', 'danger');
      return;
    }

    if (parseInt(formData.minRange) > parseInt(formData.maxRange)) {
      showAlert('Maximum range cannot be less than minimum range.', 'danger');
      return;
    }

    if (formData.maxRange) {
      if (formData.numberOfBlocks !== formData.maxRange.toString().length.toString()) {
        showAlert('Number of blocks must match the length of the max range.', 'danger');
        return;
      }
    }

    const newConfig = {
      fieldConfigurationId: selectedFieldIndex !== -1 ? savedData[selectedFieldIndex].fieldConfigurationId : 0, // Adjust as needed
      projectId: 1, // Adjust as needed
      fieldAttributesJson: '',
      canBlank: formData.canBlank,
      fieldAttributes: [
        {
          field: formData.field,
          minRange: formData.minRange,
          maxRange: formData.maxRange,
          responses: formData.responses,
          numberOfBlocks: formData.numberOfBlocks.toString(),
        },
      ],
    };

    console.log('Payload to be sent:', JSON.stringify(newConfig, null, 2));

    if (selectedFieldIndex !== -1) {
      // Update existing field configuration
      axios
        .put(`${APIURL}/FieldConfigurations/${newConfig.fieldConfigurationId}?WhichDatabase=Local`, newConfig)
        .then((response) => {
          const updatedData = [...savedData];
          updatedData[selectedFieldIndex] = { ...updatedData[selectedFieldIndex], ...newConfig };
          setSavedData(updatedData);
          setSelectedFieldIndex(-1);
          showAlert('Field configuration updated successfully.', 'success');
        })
        .catch((error) => {
          console.error('Error updating field configuration:', error);
          showAlert('Error updating field configuration. Please try again later.', 'danger');
        });
    } else {
      // Create new field configuration
      axios
        .post(`${APIURL}/FieldConfigurations?WhichDatabase=Local`, newConfig)
        .then((response) => {
          const newFieldConfig = response.data;
          setSavedData([...savedData, newFieldConfig]);
          showAlert('Field configuration saved successfully.', 'success');
          setPagination({ ...pagination, total: savedData.length + 1 });
        })
        .catch((error) => {
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
      numberOfBlocks: '',
      canBlank: false,
    });
  };


  useEffect(() => {
    if (savedData.length > 0) {
      const savedFieldNames = savedData.map((item) => item.fieldAttributes[0].field);
      const filteredFields = fields.filter((field) => !savedFieldNames.includes(field.fieldName));
      setFields(filteredFields);
    }
  }, [savedData]);

  const handleDelete = (fieldConfigurationId) => {
    axios
      .delete(`${APIURL}/FieldConfigurations/${fieldConfigurationId}?WhichDatabase=Local`)
      .then(() => {
        setSavedData(
          savedData.filter((item) => item.fieldConfigurationId !== fieldConfigurationId),
        );
        message.success('Field configuration deleted successfully.');
      })
      .catch((error) => {
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
      numberOfBlocks: record.fieldAttributes[0].numberOfBlocks,
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
      sorter: (a, b) =>
        parseInt(a.fieldAttributes[0].minRange) - parseInt(b.fieldAttributes[0].minRange),
    },
    {
      title: 'Max Range',
      dataIndex: ['fieldAttributes', 0, 'maxRange'],
      key: 'maxRange',
      sorter: (a, b) =>
        parseInt(a.fieldAttributes[0].maxRange) - parseInt(b.fieldAttributes[0].maxRange),
    },
    {
      title: 'Preferred Responses',
      dataIndex: ['fieldAttributes', 0, 'responses'],
      key: 'responses',
      sorter: (a, b) =>
        a.fieldAttributes[0].responses.localeCompare(b.fieldAttributes[0].responses),
    },
    {
      title: 'Number of Blocks',
      dataIndex: ['fieldAttributes', 0, 'numberOfBlocks'],
      key: 'numberOfBlocks',
      sorter: (a, b) =>
        parseInt(a.fieldAttributes[0].numberOfBlocks) -
        parseInt(b.fieldAttributes[0].numberOfBlocks),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record, index) => (
        <Space>
          <Button type="link" onClick={() => handleFieldSelection(record, index)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure delete this configuration?"
            onConfirm={() => handleDelete(record.fieldConfigurationId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
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
      <div className="text-end">
        <Button type="primary" onClick={toggleFormVisibility} style={{ marginBottom: 16 }}>
          {isFormVisible ? 'Hide Form' : 'Add New Configuration'}
        </Button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSave}>
          <div className="form-group d-flex align-items-center justify-content-between">
            <div>
              <label htmlFor="field">Field Name</label>
            <Select
              id="field"
              style={{ width: '140px', marginLeft: '2rem' }}
              value={formData.field}
              onChange={(value) => setFormData({ ...formData, field: value })}
            >
              {fields.map((field, index) => (
                <Option key={index} value={field.fieldName}>
                  {field.fieldName}
                </Option>
              ))}
            </Select>
            </div>
            
              <div className='d-flex align-items-center'>
              <label className='me-2' htmlFor="canBlank">Allow Blank Values?</label>
                 <input
              id="canBlank"
              type="checkbox"
              checked={formData.canBlank} // Use checked attribute instead of value
              onChange={handleInputChange}
            />
            

              </div>
           
          </div>
          <Row>
            <Col>
              <div className="form-group">
                <label htmlFor="minRange">Min Range</label>
                <Input
                  id="minRange"
                  type="number"
                  value={formData.minRange}
                  onChange={handleInputChange}
                />
              </div>
            </Col>
            <Col>
              <div className="form-group">
                <label htmlFor="maxRange">Max Range</label>
                <Input
                  id="maxRange"
                  type="number"
                  value={formData.maxRange}
                  onChange={handleInputChange}
                />
              </div>
            </Col>
            {
              rangeError && (
                <p className='text-danger'>
                  Minimum range cannot be more than maximum range
                </p>
              )
            }

          </Row>
          <Row>
            <Col>
              <div className="form-group">
                <label htmlFor="responses">Preferred Responses</label>
                <Input
                  id="responses"
                  type="text"
                  value={formData.responses}
                  onChange={handleInputChange}
                />
              </div>
            </Col>
            <Col>
              <div className="form-group">
                <label htmlFor="numberOfBlocks">Number of Blocks</label>
                <Input
                  id="numberOfBlocks"
                  type="text"
                  value={formData.numberOfBlocks}
                  onChange={handleInputChange}
                />
              </div>
            </Col>
          </Row>
          <div className="mb-2 mt-2 text-end">
            <Button type="primary" htmlType="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      )}

      {alertMessage && <div className={`alert alert-${alertType}`}>{alertMessage}</div>}

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
