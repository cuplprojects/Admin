import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { useFileUpload } from './Importfile';

const FILE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const FileUploadComponent = () => {
  const { uploadFiles, resumeFileUpload } = useFileUpload();
  const [files, setFiles] = useState(new Map());
  const [uploader, setUploader] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resumeButtonVisible, setResumeButtonVisible] = useState(false); 

  useEffect(() => {
    // Load files from localforage
    localforage.getItem('uploadState').then((savedFiles) => {
      if (savedFiles) {
        // Filter out completed files
        const incompleteFiles = savedFiles.filter(([file, fileObj]) => fileObj.status !== FILE_STATUS.COMPLETED);
        const filesMap = new Map(incompleteFiles);
        setFiles(filesMap);

        // Initialize uploader based on incomplete files
        const newUploader = uploadFiles(Array.from(filesMap.keys()), {
          onProgress: handleProgress,
          onError: handleError,
          onAbort: handleAbort,
          onComplete: handleComplete,
        });
        setUploader(newUploader);
        filesMap.forEach((fileObj, file) => {
          if (fileObj.status === FILE_STATUS.UPLOADING) {
            newUploader.resumeFileUpload(file);
          }else if (fileObj.status === FILE_STATUS.PAUSED) {
            setResumeButtonVisible(true);
          }
        });
      }
    });
  }, [uploadFiles]);


  useEffect(() => {
    // Calculate overall progress whenever files state changes
    const totalFiles = files.size;
    const completedFiles = [...files.values()].filter(fileObj => fileObj.status === FILE_STATUS.COMPLETED).length;
    const progress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;
    setOverallProgress(progress);
  }, [files]);


  useEffect(() => {
    // Save files to localforage whenever files state changes
    localforage.setItem('uploadState', Array.from(files.entries()));
  }, [files]);

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

  export default FileUploadComponent;
