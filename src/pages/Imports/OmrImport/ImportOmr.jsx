import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'antd';

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

  // UseEffect to load files from localStorage on component mount
  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('uploadFiles')) || [];
    setFiles(storedFiles);
    console.log(storedFiles);
  }, []);

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const jsondata = JSON.stringify(selectedFiles);
    // Store files in localStorage immediately after selection
    localStorage.setItem('uploadFiles', jsondata);
    console.log(jsondata);
    // Update state to reflect selected files
    setFiles(selectedFiles);
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
          'http://localhost:5071/api/OMRData/upload-request?WhichDatabase=Local',
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
        removeFromLocalStorage(files[i]);

        // Update current file index in state
        setCurrentFileIndex(i + 1);
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
  const skipFile = () => {
    setShowSkipBtn(false); // Hide the skip button after skipping
    removeFromLocalStorage(files[currentFileIndex]); // Remove from localStorage anyway

    // Move to the next file
    setCurrentFileIndex(currentFileIndex + 1);
    handleSubmit({ preventDefault: () => {} });
  };

  // Function to remove file from localStorage
  const removeFromLocalStorage = (file) => {
    let storedFiles = JSON.parse(localStorage.getItem('uploadFiles')) || [];
    storedFiles = storedFiles.filter((f) => f.name !== file.name);
    localStorage.setItem('uploadFiles', JSON.stringify(storedFiles));
  };

  // Function to resume upload process from where it stopped
  const handleResume = () => {
    // Set current file index to resume from where it stopped
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
