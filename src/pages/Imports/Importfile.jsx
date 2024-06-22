import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import localforage from 'localforage';

const FileUploadContext = createContext();

const useFileUpload = () => {
  const { uploadFiles, resumeFileUpload } = useContext(FileUploadContext);
  return { uploadFiles, resumeFileUpload };
}

const ENDPOINTS = {
  UPLOAD: 'http://localhost:5071/api/OMRData/upload',
  UPLOAD_STATUS: 'http://localhost:5071/api/OMRData/upload-status',
  UPLOAD_REQUEST: 'http://localhost:5071/api/OMRData/upload-request?WhichDatabase=Local',
};

const defaultOptions = {
  url: ENDPOINTS.UPLOAD,
  startingByte: 0,
  fileId: '',
  onAbort: () => {},
  onProgress: () => {},
  onError: () => {},
  onComplete: () => {},
};

const FileUploadProvider = ({ children }) => {
  const fileRequests = useRef(new WeakMap());

  const uploadFileChunks = (file, options) => {
    const formData = new FormData();
    const req = new XMLHttpRequest();
    const chunk = file.slice(options.startingByte);

    formData.append('chunk', chunk, file.name);
    

    // Log the Content-Range header for debugging
    const contentRange = `bytes ${options.startingByte}-${options.startingByte + chunk.size - 1}/${file.size}`;
    

    req.open('POST', options.url, true);
    req.setRequestHeader('Content-Range', contentRange);
    
    req.setRequestHeader('X-File-Name', file.name);



    req.onload = (e) => {
      if (req.status === 200) {
        options.onComplete(e, file);
      } else {
        options.onError(e, file);
      }
    };

    req.upload.onprogress = (e) => {
      const loaded = options.startingByte + e.loaded;
      options.onProgress(
        {
          ...e,
          loaded,
          total: file.size,
          percentage: (loaded * 100) / file.size,
        },
        file
      );
    };

    req.ontimeout = (e) => options.onError(e, file);
    req.onabort = (e) => options.onAbort(e, file);
    req.onerror = (e) => options.onError(e, file);

    fileRequests.current.get(file).request = req;

    req.send(formData);
  };

  const uploadFile = async (file, options) => {
    try {
      const res = await fetch(ENDPOINTS.UPLOAD_REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: file.name,
        }),
      });
      const res_1 = await res.json();
      options = { ...options, ...res_1 };
      fileRequests.current.set(file, { request: null, options });

      uploadFileChunks(file, options);

      // Save the initial state to localforage
      localforage.setItem(`${file.name}-upload`, {
        fileId: options.fileId,
        startingByte: 0,
      });
    } catch (e) {
      options.onError({ ...e, file });
    }
  };

  const abortFileUpload = async (file) => {
    const fileReq = fileRequests.current.get(file);

    if (fileReq && fileReq.request) {
      fileReq.request.abort();
      return true;
    }

    return false;
  };

  const retryFileUpload = (file) => {
    const fileReq = fileRequests.current.get(file);

    if (fileReq) {
      return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
        .then((res) => res.json())
        .then((res) => {
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });

          // Update the localforage state
          localforage.setItem(`${file.name}-upload`, {
            fileId: fileReq.options.fileId,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch((e) => {
          fileReq.options.onError({ ...e, file });
        });
    }

    return false;
  };

  const resumeFileUpload = async (file) => {
    console.log(`Resumed upload of file: ${file.name}`);
    const savedUpload = await localforage.getItem(`${file.name}-upload`);
    if (savedUpload) {
      const { fileId, startingByte } = savedUpload;

      const options = {
        ...defaultOptions,
        fileId,
        startingByte,
      };

      fileRequests.current.set(file, { request: null, options });

      uploadFileChunks(file, options);
    }
  };

  const clearFileUpload = (file) => {
    fileRequests.current.delete(file);
    localforage.removeItem(`${file.name}-upload`);
  };

  const uploadFiles = (files, options) => {
    const uploadQueue = [...files];
    let isErrorOccurred = false; // Flag to track if an error occurred
    let currentFileIndex = 0; // Track the index of the current file being uploaded
    let lastSuccessfulFileIndex = -1; // Track the index of the last successfully uploaded file
  
    const uploadNextFile = () => {
      if (uploadQueue.length === 0 || isErrorOccurred) return; // Stop if there are no more files or an error occurred
  
      const file = uploadQueue[currentFileIndex]; // Get the current file from the queue
      currentFileIndex++;
  
      uploadFile(file, {
       ...defaultOptions,
       ...options,
        onComplete: (e, file) => {
          options.onComplete(e, file);
          lastSuccessfulFileIndex = currentFileIndex - 1; // Update the last successful file index
          console.log( + currentFileIndex)

          localforage.setItem('lastSuccessfulFileIndex', lastSuccessfulFileIndex); // Store in localForage
          uploadNextFile(); // Move to the next file after completion
        },
        onError: (e, file) => {
          options.onError(e, file);
          isErrorOccurred = true; // Set the flag to true when an error occurs
          return lastSuccessfulFileIndex; // Return the last successful file index
        },
      });
    };
  
    localforage.getItem('lastSuccessfulFileIndex').then((index) => {
      if (index!== null) {
        lastSuccessfulFileIndex = index;
        currentFileIndex = index + 1;
      }
    });
  
    uploadNextFile(); // Start the upload process
  
    const resumeUpload = () => {
      isErrorOccurred = false; // Reset the error flag
      uploadNextFile(); // Resume uploading from the point where it stopped
    };
  
    return {
      abortFileUpload,
      retryFileUpload,
      resumeFileUpload: resumeUpload, // Include the resumeUpload function in the return object
      clearFileUpload,
    };
  };
  
  return (
    <FileUploadContext.Provider value={{ uploadFiles,resumeFileUpload }}>
      {children}
    </FileUploadContext.Provider>
  );
};

const FILE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const FileUploadComponent = () => {
  const { uploadFiles } = useFileUpload();
  const [files, setFiles] = useState(new Map());
  const [uploader, setUploader] = useState(null);

  useEffect(() => {
    // Load files from localforage
    localforage.getItem('uploadState').then((savedFiles) => {
      if (savedFiles) {
        const filesMap = new Map(savedFiles);
        setFiles(filesMap);

        // Initialize uploader based on savedFiles
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
          }
        });
      }
    });
  }, [uploadFiles]);

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

    const newUploader = uploadFiles(uploadedFiles, {
      onProgress: handleProgress,
      onError: handleError,
      onAbort: handleAbort,
      onComplete: handleComplete,
    });

    setUploader(newUploader);
    setFiles(filesMap);
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
      localforage.removeItem(`${file.name}-upload`);
      return new Map(prevFiles);
    });
  };

  const handleError = (e, file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (!fileObj) return prevFiles; // Check if fileObj is defined

      fileObj.status = FILE_STATUS.FAILED;
      return new Map(prevFiles);
    });
  };

  const handleAbort = (e, file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (!fileObj) return prevFiles; // Check if fileObj is defined

      fileObj.status = FILE_STATUS.PAUSED;
      return new Map(prevFiles);
    });
  };

  const handleRetry = (file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (fileObj) {
        fileObj.status = FILE_STATUS.PENDING;
        return new Map(prevFiles);
      }
      return prevFiles; // Return the previous state if fileObj is not found
    });

    uploader.retryFileUpload(file);
  };

  const handleResume = (file) => {
    
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (fileObj) {
        fileObj.status = FILE_STATUS.UPLOADING;
        return new Map(prevFiles);
      }
      return prevFiles; // Return the previous state if fileObj is not found
    });

    uploader.resumeFileUpload(file);
  };

  const handleClear = (file) => {
    setFiles((prevFiles) => {
      const fileObj = prevFiles.get(file);
      if (fileObj) {
        fileObj.status = FILE_STATUS.PENDING;
        return new Map(prevFiles);
      }
      return prevFiles; // Return the previous state if fileObj is not found
    });

    uploader.clearFileUpload(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFilesChange} multiple />
      <ul>
        {Array.from(files.values()).map((fileObj) => (
          <li key={fileObj.file.name}>
            {fileObj.file.name} - {fileObj.percentage.toFixed(2)}%
            {fileObj.status === FILE_STATUS.UPLOADING && (
              <button onClick={() => handleClear(fileObj.file)}>Pause</button>
            )}
            {fileObj.status === FILE_STATUS.PAUSED && (
              <button onClick={() => handleResume(fileObj.file)}>Resume</button>
            )}
            {fileObj.status === FILE_STATUS.FAILED && (
              <button onClick={() => handleRetry(fileObj.file)}>Retry</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export { FileUploadProvider, useFileUpload, FileUploadComponent };



