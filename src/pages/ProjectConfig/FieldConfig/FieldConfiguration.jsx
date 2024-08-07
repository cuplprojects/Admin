import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldConfig.css';
import { Button, Table, Input, Select, Space, Popconfirm, notification, Tooltip } from 'antd';
import { DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { useThemeToken } from '@/theme/hooks';
import { Col, Row } from 'react-bootstrap';
import { useProjectId } from '@/store/ProjectState';
import { usePreferredResponse } from '@/utils/PreferredResponse/PreferredResponseContext';
import { handleDecrypt, handleEncrypt } from '@/Security/Security';

const APIURL = import.meta.env.VITE_API_URL;
const { Option } = Select;

const FieldConfiguration = () => {
  const { colorPrimary } = useThemeToken();
  const [isFormVisible, setFormVisible] = useState(false);
  const { fetchPreferredResponse } = usePreferredResponse();
  const [formData, setFormData] = useState({
    minRange: '',
    maxRange: '',
    responses: '',
    numberOfBlocks: '',
    canBlank: false,
  });
  const [fieldName, setFieldName] = useState(''); // New state for fieldName
  const [savedData, setSavedData] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '50'],
  });
  const [rangeError, setRangeError] = useState(false);
  const ProjectId = useProjectId();

  useEffect(() => {
    getFields();
  }, []);

  useEffect(() => {
    getFieldConfig()
  }, []);

  const getFieldConfig = async() =>{
    axios
    .get(`${APIURL}/FieldConfigurations/GetByProjectId/${ProjectId}?WhichDatabase=Local`)
    .then((response) => {
      console.log(response.data)
      let decryptedData = handleDecrypt(response.data)
      console.log(decryptedData)
      let Jsondata = JSON.parse(decryptedData)
      console.log(Jsondata)
      setSavedData(Jsondata);
      setPagination({ ...pagination, total: Jsondata.length });
    })
    .catch((error) => {
      console.error('Error fetching field configurations:', error);
    });
  }

  console.log(savedData)
  const getFields = () => {
    axios
      .get(`${APIURL}/Fields?WhichDatabase=Local`)
      .then((response) => {
        setFields(response.data);
      })
      .catch((error) => {
        console.error('Error fetching fields:', error);
      });
  };

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleInputChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [id]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

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

    if (!fieldName || !formData.numberOfBlocks) {
      notification.error({
        message: 'Please fill in all fields!',
        duration:3
       })
      return;
    }

    if (parseInt(formData.minRange) > parseInt(formData.maxRange)) {
      notification.error({
        message: 'Maximum range cannot be less than minimum range!',
        duration:3
       })
      return;
    }

    if (formData.maxRange) {
      if (formData.numberOfBlocks !== formData.maxRange.toString().length.toString()) {
        notification.error({
          message: 'Number of blocks must match the length of the max range!',
          duration:3
         })
        
        return;
      }
    }

    const newConfig = {
      fieldConfigurationId:
        selectedFieldIndex !== -1 ? savedData[selectedFieldIndex].fieldConfigurationId : 0,
      projectId: ProjectId,
      fieldName: fieldName, // Add fieldName here
      fieldAttributesJson: '',
      canBlank: formData.canBlank,
      fieldAttributes: [
        {
          minRange: formData.minRange,
          maxRange: formData.maxRange,
          responses: formData.responses,
          numberOfBlocks: formData.numberOfBlocks.toString(),
        },
      ],
    };

    console.log('Payload to be sent:', JSON.stringify(newConfig, null, 2));

    let newConfigJson = JSON.stringify(newConfig)
    let encrypteddata = handleEncrypt(newConfigJson)

    const encrypteddatatosend = {
      cyphertextt : encrypteddata
    }

    if (selectedFieldIndex !== -1) {
      axios
        .put(
          `${APIURL}/FieldConfigurations/${newConfig.fieldConfigurationId}?WhichDatabase=Local`,
          encrypteddatatosend,
        )
        .then((response) => {
          getFieldConfig()
          updatedData[selectedFieldIndex] = { ...updatedData[selectedFieldIndex], ...newConfig };
          setSavedData(updatedData);
          setSelectedFieldIndex(-1);
          notification.success({
            message: 'Field configuration updated successfully!',
            duration:3
           })
        })
        .catch((error) => {
          console.error('Error updating field configuration:', error);
          notification.error({
            message: 'Error updating field configuration. Please try again later!',
            duration:3
           })
          
        });
    } else {
      axios
        .post(`${APIURL}/FieldConfigurations?WhichDatabase=Local`, encrypteddatatosend)
        .then((response) => {
          const newFieldConfig = response.data;
          setSavedData([...savedData, newFieldConfig]);
          notification.success({
            message:'Field configuration saved successfully.',
            duration:3,
          })
         
          setPagination({ ...pagination, total: savedData.length + 1 });
        })
        .catch((error) => {
          console.error('Error saving field configuration:', error);
          notification.error({
            message:'Error saving field configuration. Please try again later.',
            duration:3,
          })
          if (error.response) {
            console.error('Response data:', error.response.data);
          }
        });
    }

    setFormData({
      minRange: '',
      maxRange: '',
      responses: '',
      numberOfBlocks: '',
      canBlank: false,
    });
    setFieldName(''); // Reset fieldName
  };

  useEffect(() => {
    if (savedData.length > 0) {
      const savedFieldNames = savedData.map((item) => item.fieldName);
      const filteredFields = fields.filter((field) => !savedFieldNames.includes(field.fieldName));
      setFields(filteredFields);
    }
  }, [savedData]);

  const handleDelete = (FieldConfigurationId) => {
    axios
      .delete(`${APIURL}/FieldConfigurations/${FieldConfigurationId}?WhichDatabase=Local`)
      .then(() => {
        setSavedData(
          savedData.filter((item) => item.FieldConfigurationId !== FieldConfigurationId),
        );
        notification.success({
          message:'Field configuration deleted successfully.',
          duration:3,
        })
        
      })
      .catch((error) => {
        console.error('Error deleting field configuration:', error);
        notification.success({
          message:'Error deleting field configuration. Please try again later.',
          duration:3,
        })
        
      });
  };

  const handleFieldSelection = (record, rowIndex) => {
    setFormVisible(true);
    setSelectedFieldIndex(rowIndex);
    setFormData({
      minRange: record.fieldAttributes[0].minRange,
      maxRange: record.fieldAttributes[0].maxRange,
      responses: record.fieldAttributes[0].responses,
      numberOfBlocks: record.fieldAttributes[0].numberOfBlocks,
    });
    setFieldName(record.fieldName); // Set the fieldName state
  };

  // get autofill data
  const getAutofillData = async (fieldName) => {
    const preferredResponse = await fetchPreferredResponse(fieldName);
    if (preferredResponse) {
      setFormData((prevData) => ({
        ...prevData,
        responses: preferredResponse || '',
      }));
    }
    else{
      setFormData((prevData) => ({
        ...prevData,
        responses: '',
      }));
    }
  };

 

  const columns = [
    {
      title: 'Field',
      dataIndex: 'FieldName', // Use fieldName directly
      key: 'fieldName',
      sorter: (a, b) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: 'Min Range',
      dataIndex: ['FieldAttributes', 0, 'MinRange'],
      key: 'minRange',
      sorter: (a, b) =>
        parseInt(a.fieldAttributes[0].minRange) - parseInt(b.fieldAttributes[0].minRange),
    },
    {
      title: 'Max Range',
      dataIndex: ['FieldAttributes', 0, 'MaxRange'],
      key: 'maxRange',
      sorter: (a, b) =>
        parseInt(a.fieldAttributes[0].maxRange) - parseInt(b.fieldAttributes[0].maxRange),
    },
    {
      title: 'Preferred Responses',
      dataIndex: ['FieldAttributes', 0, 'Responses'],
      key: 'responses',
      sorter: (a, b) =>
        a.fieldAttributes[0].responses.localeCompare(b.fieldAttributes[0].responses),
    },
    {
      title: 'Number of Blocks',
      dataIndex: ['FieldAttributes', 0, 'NumberOfBlocks'],
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
            onConfirm={() => handleDelete(record.FieldConfigurationId)}
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

  return (
    <div className="field-configuration">
      <Button
        type="primary"
        onClick={toggleFormVisibility}
        style={{ marginBottom: 16, backgroundColor: colorPrimary }}
      >
        {isFormVisible ? 'Hide Form' : 'Add New Configuration'}
      </Button>
      {isFormVisible && (
        <form onSubmit={handleSave} className="config-form">
          <Row>
            <Col>
              <label htmlFor="field">Field:</label>
              <Select
                id="field"
                value={fieldName}
                onChange={setFieldName}
                style={{ width: '100%' }}
              >
                {fields.map((field) => (
                  <Option key={field.fieldName} value={field.fieldName}>
                    {field.fieldName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <label htmlFor="minRange">Min Range:</label>
              <Input
                type="number"
                id="minRange"
                value={formData.minRange}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="maxRange">Max Range:</label>
              <Input
                type="number"
                id="maxRange"
                value={formData.maxRange}
                onChange={handleInputChange}
              />
            </Col>
            <Col>
              <label htmlFor="responses">Preferred Responses:</label>
              <Input
                id="responses"
                value={formData.responses}
                onChange={handleInputChange}
                suffix={
                  <Tooltip title="Autofill by registered data">
                    <span className="c-pointer" onClick={() => getAutofillData(fieldName)}>
                      <RedoOutlined style={{ fontSize: '16px', color: colorPrimary }} />
                    </span>
                  </Tooltip>
                }
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="numberOfBlocks">Number of Blocks:</label>
              <Input
                type="number"
                id="numberOfBlocks"
                value={formData.numberOfBlocks}
                onChange={handleInputChange}
              />
            </Col>
            <Col>
              <label htmlFor="canBlank">Can Be Blank:</label>
              <Input
                type="checkbox"
                id="canBlank"
                checked={formData.canBlank}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </form>
      )}
      <Table
        columns={columns}
        dataSource={savedData}
        rowKey="fieldConfigurationId"
        pagination={pagination}
        onChange={(pag) => setPagination(pag)}
      />
    </div>
  );
};

export default FieldConfiguration;
