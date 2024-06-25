import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'antd';
import localforage from 'localforage';

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

  // UseEffect to load files and currentFileIndex from localforage on component mount
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

  // Function to handle file selection
  const handleFileChange = async (e) => {
    const selectedFiles = [...e.target.files];

    try {
      // Save files in localforage
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

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileCount = files.length;

    // Iterate through each file and upload sequentially
    for (let i = currentFileIndex; i < fileCount; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        // Make sure to update your API endpoint accordingly
        const response = await axios.post(
          `${apiurl}/OMRData/upload-request?WhichDatabase=Local`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // Handle success (for demonstration, we're logging the response)
        console.log(`File ${i + 1} uploaded successfully:`, response);

        // Remove the uploaded file from localStorage
        await removeFromLocalForage(files[i]);

        // Update current file index in state and localforage
        const nextFileIndex = i + 1;
        setCurrentFileIndex(nextFileIndex);
        await localforage.setItem('currentFileIndex', nextFileIndex);
      } catch (error) {
        // Handle specific error for file with same name already exists
        if (error.response && error.response.status === 409) {
          setShowSkipBtn(true);
          setCurrentFileName(files[i].name);
          break;
        } else {
          console.error(`Error uploading file ${i + 1}:`, error);
          setLoading(false);
          break; // Stop upload process on error
        }
      }
    }

    setLoading(false);
  };

  // Function to skip the current file
  const skipFile = async () => {
    setShowSkipBtn(false); // Hide the skip button after skipping
    await removeFromLocalForage(files[currentFileIndex]); // Remove from localStorage anyway

    // Move to the next file
    const nextFileIndex = currentFileIndex + 1;
    setCurrentFileIndex(nextFileIndex);
    await localforage.setItem('currentFileIndex', nextFileIndex);
    handleSubmit({ preventDefault: () => {} });
  };

  // Function to resume upload process from where it stopped
  const handleResume = () => {
    setLoading(true);
    handleSubmit({ preventDefault: () => {} }); // Call handleSubmit to resume
  };

  return (
    <>
      <form className="text-center" onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        {files.length > 0 && (
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
    </>
  );
};

export default ImportOmr;
