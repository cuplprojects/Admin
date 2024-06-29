import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Upload, Button } from 'antd';

const apiurl = import.meta.env.VITE_API_URL;

const GenerateScore = () => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [file, setFile] = useState(null);

  

  const beforeUpload = (file) => {
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      message.error('You can only upload XLSX file!');
      return false;
    }
    return isXlsx;
  };

  const handleFileChange = ({ file }) => {
    if (beforeUpload(file)) {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch(`${apiurl}/Key/upload?WhichDatabase=Local`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.message) {
        setAlertMessage('All files uploaded successfully!');
          setAlertType('success');
        getBase64(file, (url) => {
          setLoading(false);
         
          setFile(null); // Reset file after successful upload
        });
      } else {
        setAlertMessage('Error uploading file!');
          setAlertType('danger');
        setLoading(false);
        setFile(null); // Reset file after unsuccessful upload
      }
    } catch (error) {
      
      setLoading(false);
      setFile(null); // Reset file after unsuccessful upload
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload Key
      </div>
    </div>
  );

  return (
    <div>
      <Upload
        name="file"
        listType="picture-card"
        className="file-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={({ file }) => handleFileChange({ file })}
      >
        {file ? file.name : uploadButton}
      </Upload>
      {file && (
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      )}
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default GenerateScore;
