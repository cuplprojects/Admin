import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'antd';
import localforage from 'localforage';


//const apiurl = import.meta.env.VITE_API_URL_PROD;
const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedFiles = await localforage.getItem('uploadFiles') || [];
        const storedIndex = await localforage.getItem('currentFileIndex') || 0;
        setFiles(storedFiles);
        setCurrentFileIndex(storedIndex);
      } catch (error) {
        console.error('Error fetching data from localforage:', error);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFiles = [...e.target.files];

    try {
      await localforage.setItem('uploadFiles', selectedFiles);
      setFiles(selectedFiles);
    } catch (error) {
      console.error('Error storing data in localforage:', error);
    }
  };

  const removeFromLocalForage = async (file) => {
    try {
      let storedFiles = await localforage.getItem('uploadFiles') || [];
      storedFiles = storedFiles.filter((f) => f.name !== file.name);
      await localforage.setItem('uploadFiles', storedFiles);
    } catch (error) {
      console.error('Error removing data from localforage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileCount = files.length;

    for (let i = currentFileIndex; i < fileCount; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await axios.post(
          `${apiurl}/OMRData/upload-request?WhichDatabase=Local`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log(`File ${i + 1} uploaded successfully:`, response);

        await removeFromLocalForage(files[i]);

        const nextFileIndex = i + 1;
        setCurrentFileIndex(nextFileIndex);
        await localforage.setItem('currentFileIndex', nextFileIndex);
        if (nextFileIndex >= fileCount) {
          await localforage.removeItem('currentFileIndex');
          setAlertMessage('All files uploaded successfully!');
          setAlertType('success');
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setShowSkipBtn(true);
          setCurrentFileName(files[i].name);
          setAlertMessage('File with same name already exists!');
          setAlertType('danger');
          break;
        } else {
          console.error(`Error uploading file ${i + 1}:`, error);
          setLoading(false);
          setAlertMessage('Error uploading file!');
          setAlertType('danger');
          break;
        }
      }
    }

    setLoading(false);
  };

  const skipFile = async () => {
    setShowSkipBtn(false);
    await removeFromLocalForage(files[currentFileIndex]);

    const nextFileIndex = currentFileIndex + 1;
    setCurrentFileIndex(nextFileIndex);
    await localforage.setItem('currentFileIndex', nextFileIndex);
    handleSubmit({ preventDefault: () => {} });
  };

  const handleResume = () => {
    setLoading(true);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <>

   
   <h3 className="head text-center">Upload OMR Data</h3>
      <form className="text-center mb -5 mt-4" onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        {files.length > 0 && currentFileIndex < files.length && (
          <Button type="primary" htmlType="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </form>
 
      {loading && <p>Loading...</p>}
      {showSkipBtn && (
        <Button type="primary" onClick={skipFile}>
          Skip {currentFileName}
        </Button>
      )}
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default ImportOmr;
