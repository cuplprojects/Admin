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

  const handleFilesChange = (event) => {
    const uploadedFiles = event.target.files;
    const filesMap = new Map();

    [...uploadedFiles].forEach((file) => {
      filesMap.set(file, {
        file,
        status: FILE_STATUS.PENDING,
        percentage: 0,
        uploadedChunkSize: 0,
      });
    });

    setSelectedFiles(uploadedFiles);
    setFiles(filesMap);
    setResumeButtonVisible(false);
  };

  const handleUpload = () => {
    const newUploader = uploadFiles(selectedFiles, {
      onProgress: handleProgress,
      onError: handleError,
      onAbort: handleAbort,
      onComplete: handleComplete,
    });

    setUploader(newUploader);
  };

  const handleProgress = (e, file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (!fileObj) return prevFiles; // Check if fileObj is defined

      fileObj.status = FILE_STATUS.UPLOADING;
      fileObj.percentage = e.percentage;
      fileObj.uploadedChunkSize = e.loaded;
      return new Map(prevFiles);
    });
  };

  const handleComplete = (e, file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (!fileObj) return prevFiles; // Check if fileObj is defined

      fileObj.status = FILE_STATUS.COMPLETED;
      fileObj.percentage = 100;
      return new Map(prevFiles);
    });

    // Remove the completed file from localforage
    localforage.removeItem(`${file.name}-upload`);
  };

  const handleError = (error, file) => {
  
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (!fileObj) return prevFiles; // Check if fileObj is defined
    
      fileObj.status = FILE_STATUS.FAILED;
      return new Map(prevFiles);
    });
    setResumeButtonVisible(true);
  };
  
  
  
  
    const handleAbort = (e, file) => {
      setFiles((prevFiles) => {
        const fileObj = prevFiles.get(file);
        if (!fileObj) return prevFiles; // Check if fileObj is defined

        fileObj.status = FILE_STATUS.PAUSED;
        return new Map(prevFiles);
      });
      setResumeButtonVisible(true);
    };
    const handleResumeUpload = () => {

      const filesArray = Array.from(selectedFiles);
      localforage.getItem('lastSuccessfulFileIndex').then((lastUploadedFileIndex) => {
        if (lastUploadedFileIndex!== null) {
          const filesToResume = filesArray.slice(lastUploadedFileIndex); // get the files to resume from the last uploaded file
          filesToResume.forEach((file, index) => {
            try {
              resumeFileUpload(file, lastUploadedFileIndex + index); // pass the file and the correct chunk index
              setFiles((prevFiles) => {
                const fileObj = prevFiles.get(file);
                if (fileObj) {
                  fileObj.status = FILE_STATUS.UPLOADING;
                  return new Map(prevFiles);
                }
                return prevFiles;
              });
            } catch (error) {
              console.error(`Error resuming upload of file ${file.name}:`, error);
            }
          });
          setResumeButtonVisible(false);
        } else {
          console.log('No last uploaded file index found, cannot resume upload');
        }
      });
    };
    return (
      <div>
        <div className="tab-pane active d-flex align-items-center justify-content-around py-3 mt-5" id="OMRImages">
          <h3 className="head text-center fs-3">Upload OMR Images</h3>
          <div className="d-flex justify-content-center align-items-center">
            <p>
              <input type="file" multiple onChange={handleFilesChange} accept=".jpg,.jpeg" />
            </p>
          </div>
          <div className="d-flex justify-content-center mt-4">
            {selectedFiles.length > 0 && (
              <button className="btn btn-primary align-items-center" onClick={handleUpload}>Upload</button>
            )}
          </div>
          <div className="d-flex justify-content-center mt-4">
          {resumeButtonVisible && (
            <button className="btn btn-success align-items-center" onClick={handleResumeUpload}>Resume Upload</button>
          )}
        </div>
        </div>
        <div>Overall Progress: {overallProgress}%</div>
        {/* <div>
        {[...files.entries()].map(([file, fileObj]) => (
          <div key={file.name}>
            <div>{file.name}</div>
            <div>Status: {fileObj.status}</div>
            <div>Progress: {fileObj.percentage}%</div>
          </div>
        ))}
      </div> */}
      </div>
    );
  };

export default ImportOmr;
