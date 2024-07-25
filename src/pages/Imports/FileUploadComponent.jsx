import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress } from 'antd';
import localforage from 'localforage';

const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [showReplaceBtn, setShowReplaceBtn] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [progress, setProgress] = useState(0);

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

  const removeCurrentFileIndex = async () => {
    try {
      await localforage.removeItem('currentFileIndex');
    } catch (error) {
      console.error('Error removing currentFileIndex from localforage:', error);
    }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get the base64 string without the metadata prefix
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (index, replace = false) => {
    setProgress(0);
    try {
      const base64File = await readFileAsBase64(files[index]);
      const response = await axios.post(
        `${apiurl}/OMRData/upload-request`,
        { omrImagesName: files[index].name, filePath: base64File, replace: replace },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          onUploadProgress: (progressEvent) => {
            const totalLength = progressEvent.lengthComputable
              ? progressEvent.total
              : progressEvent.target.getResponseHeader('content-length') ||
                progressEvent.target.getResponseHeader('x-decompressed-content-length');
            if (totalLength !== null) {
              setProgress(Math.round((progressEvent.loaded * 100) / totalLength));
            }
          }
        },
      );
      console.log(`File ${index + 1} uploaded successfully:`, response);
      await removeFromLocalForage(files[index]); // Remove the file from localforage after successful upload
      const nextFileIndex = index + 1;
      setCurrentFileIndex(nextFileIndex);
      await localforage.setItem('currentFileIndex', nextFileIndex);

      if (nextFileIndex >= files.length) {
        await removeCurrentFileIndex();
      }

      setAlertMessage('');
      setAlertType('');
      setShowSkipBtn(false);
      setShowReplaceBtn(false);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setShowSkipBtn(true);
        setShowReplaceBtn(true);
        setCurrentFileName(files[index].name);
        setAlertMessage('File with the same name already exists!');
        setAlertType('danger');
      } else {
        console.error(`Error uploading file ${index + 1}:`, error);
        setAlertMessage('Error uploading file!');
        setAlertType('danger');
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileCount = files.length;
    for (let i = currentFileIndex; i < fileCount; i++) {
      const uploadSuccess = await uploadFile(i);
      if (!uploadSuccess) {
        break;
      }
    }
    setLoading(false);
  };

  const skipFile = async () => {
    await removeFromLocalForage(files[currentFileIndex]);
    const nextFileIndex = currentFileIndex + 1;
    setCurrentFileIndex(nextFileIndex);
    await localforage.setItem('currentFileIndex', nextFileIndex);
    if (nextFileIndex >= files.length) {
      await removeCurrentFileIndex();
    }
    setShowSkipBtn(false);
    setShowReplaceBtn(false);
    setAlertMessage('');
    setAlertType('');
  };

  const replaceFile = async () => {
    setShowReplaceBtn(false);
    setShowSkipBtn(false);
    await uploadFile(currentFileIndex, true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="files"
          onChange={handleFileChange}
          multiple
          accept=".jpg,.jpeg"
          required
        />
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={files.length === 0}
        >
          Upload Files
        </Button>
      </form>
      {alertMessage && (
        <div className={`alert alert-${alertType}`} role="alert">
          {alertMessage}
        </div>
      )}
      {showSkipBtn && (
        <Button type="danger" onClick={skipFile}>
          Skip
        </Button>
      )}
      {showReplaceBtn && (
        <Button type="primary" onClick={replaceFile}>
          Replace
        </Button>
      )}
      {loading && (
        <Progress percent={progress} status="active" />
      )}
    </div>
  );
};

export default ImportOmr;
