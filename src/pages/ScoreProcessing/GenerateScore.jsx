import React, { useState,useEffect } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Upload, Button } from 'antd';
import ViewScore from './ViewScore';
import { useProjectId } from '@/store/ProjectState';

const apiurl = import.meta.env.VITE_API_URL;

const GenerateScore = () => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [file, setFile] = useState(null);
  const [processing,setProcessing] = useState(false);
  const [scores,setScores] = useState(null);
  const [showScores, setShowScores] = useState(false);

  const [entryCount, setEntryCount] = useState(0);
  const ProjectId = useProjectId();
  const [keyCount,setKeyCount] = useState(0);
  




  useEffect(() => {
    const fetchEntryCount = async () => {
      try {
        const response = await fetch(`${apiurl}/Score/count?WhichDatabase=Local&projectId=${ProjectId}`);
      
        if (!response.ok) {
          throw new Error('Failed to fetch entry count');
        }
        const result = await response.json();
        console.log(result)
        setEntryCount(result.count);
      } catch (error) {
        message.error('Failed to fetch entry count');
      }
    };

    fetchEntryCount();
  }, [ProjectId]);



  useEffect(() => {
    const fetchEntryCount = async () => {
      try {
        const response = await fetch(`${apiurl}/Key/count?WhichDatabase=Local&projectId=${ProjectId}`);
      
        if (!response.ok) {
          throw new Error('Failed to fetch entry count');
        }
        const result = await response.json();
        

        setKeyCount(result);
        console.log(result)
      } catch (error) {
        message.error('Failed to fetch entry count');
      }
    };

    fetchEntryCount();
  }, [ProjectId]);

  

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

 const handleProcessScore = async ()=> {
  try {
    setProcessing(true);
    const response = await fetch(`${apiurl}/Score/omrdata/${ProjectId}/details`);
    if (!response.ok) {
      throw new Error('Failed to fetch scores');
    }
    const result = await response.json();
    setScores(result); // Assuming the result is an array of scores
    setProcessing(false);
  } catch (error) {
    error.message('Failed to fetch scores');
    setProcessing(false);
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
      const response = await fetch(`${apiurl}/Key/upload?WhichDatabase=Local&ProjectId=${ProjectId}`, {
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
    <>
    <div>
      <div  className='d-flex align-items-center justify-content-between'>
        
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

         
        <a href="/template.xlsx"> <Button
          type="primary"
         
          disabled={loading}
        >
         Download Key Template
        </Button></a>
      </div>
      
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

      {(keyCount && (entryCount <= 1)) ? (

          <Button
            type="primary"
            onClick={handleProcessScore}
            disabled={processing}
            style={{ marginTop: 16}}
          >
            {processing ? 'Processing...' : 'Process Score'}
          </Button>
        ):(
          <></>
        )}
        <div className='text-end'>
        <Button
          type="primary"
          onClick={() => setShowScores(!showScores)}
          style={{ marginTop: 10 }}
          >
          View Score
        </Button>
          </div> 
    </div>
    {showScores && <ViewScore scores={scores} />}
    </>
  );
};

export default GenerateScore;
