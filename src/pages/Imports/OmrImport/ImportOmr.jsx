// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button, Progress } from 'antd';
// import localforage from 'localforage';
// import { useProjectId } from '@/store/ProjectState';


// const apiurl = import.meta.env.VITE_API_URL;

// const ImportOmr = () => {
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentFileIndex, setCurrentFileIndex] = useState(0);
//   const [showSkipBtn, setShowSkipBtn] = useState(false);
//   const [showReplaceBtn, setShowReplaceBtn] = useState(false);
//   const [currentFileName, setCurrentFileName] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertType, setAlertType] = useState('');
//   const [progress, setProgress] = useState(0);
//   const [lastUploadedFile, setLastUploadedFile] = useState('');
//   const ProjectId = useProjectId();

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       const storedFiles = await localforage.getItem('uploadFiles') || [];
//   //       const storedIndex = await localforage.getItem('currentFileIndex') || 0;
//   //       setFiles(storedFiles);
//   //       setCurrentFileIndex(storedIndex);
//   //     } catch (error) {
//   //       console.error('Error fetching data from localforage:', error);
//   //     }
//   //   };
//   //   fetchData();
//   // }, []);

//   const handleFileChange = async (e) => {
//     const selectedFiles = [...e.target.files];
//     try {
//       // await localforage.setItem('uploadFiles', selectedFiles);
//       setFiles(selectedFiles);
//     } catch (error) {
//       console.error('Error storing data in localforage:', error);
//     }
//   };

//   // const removeFromLocalForage = async (file) => {
//   //   try {
//   //     let storedFiles = await localforage.getItem('uploadFiles') || [];
//   //     storedFiles = storedFiles.filter((f) => f.name !== file.name);
//   //     await localforage.setItem('uploadFiles', storedFiles);
//   //   } catch (error) {
//   //     console.error('Error removing data from localforage:', error);
//   //   }
//   // };

//   // const removeCurrentFileIndex = async () => {
//   //   try {
//   //     await localforage.removeItem('currentFileIndex');
//   //   } catch (error) {
//   //     console.error('Error removing currentFileIndex from localforage:', error);
//   //   }
//   // };



//   const fetchLastOmrImageName = async (projectId) => {
//     try {
//       const response = await axios.get(`${apiurl}/OMRData/${projectId}/last-image-name`);
//       return response.data; // This is the last omrImagesName
//     } catch (error) {
//       console.error("Error fetching the last OMR image name:", error);
//       return null;
//     }
//   };


//   const readFileAsBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result.split(',')[1]); // Get the base64 string without the metadata prefix
//       reader.onerror = (error) => reject(error);
//       reader.readAsDataURL(file);
//     });
//   };

//   useEffect(()=>{
//     if (files.length === currentFileIndex) {
//       setFiles([])
//     }
//   },[currentFileIndex])

//   const uploadFile = async (index, replace = false,projectId) => {
//     const lastOmrImageName = await fetchLastOmrImageName(projectId);
//     if (lastOmrImageName) {
//       console.log("Last OMR image name for project:", lastOmrImageName);
//       // Use lastOmrImageName as needed
//     }
//     setProgress(0);
//     try {
//       const base64File = await readFileAsBase64(files[index]);
//       const fileNameWithoutExtension = files[index].name.replace(/\.[^/.]+$/, ""); 
//       const response = await axios.post(
//         `${apiurl}/OMRData/upload-request`,
//         { omrImagesName: fileNameWithoutExtension, filePath: base64File, replace: replace },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           onUploadProgress: (progressEvent) => {
//             const totalLength = progressEvent.lengthComputable
//               ? progressEvent.total
//               : progressEvent.target.getResponseHeader('content-length') ||
//                 progressEvent.target.getResponseHeader('x-decompressed-content-length');
//             if (totalLength !== null) {
//               setProgress(Math.round((progressEvent.loaded * 100) / totalLength));
//             }
//           }
//         },
//       );
//       console.log(`File ${index + 1} uploaded successfully:`, response);
//       // await removeFromLocalForage(files[index]); // Remove the file from localforage after successful upload
//       const nextFileIndex = index + 1;
//       setCurrentFileIndex(nextFileIndex);
//       // await localforage.setItem('currentFileIndex', nextFileIndex);

//       // if (nextFileIndex >= files.length) {
//       //   await removeCurrentFileIndex();
//       // }

//       setAlertMessage('');
//       setAlertType('');
//       setShowSkipBtn(false);
//       setShowReplaceBtn(false);
//       return true;
//     } catch (error) {
//       if (error.response && error.response.status === 409) {
//         setShowSkipBtn(true);
//         setShowReplaceBtn(true);
//         setCurrentFileName(files[index].name);
//         setAlertMessage('File with the same name already exists!');
//         setAlertType('danger');
//       } else {
//         console.error(`Error uploading file ${index + 1}:`, error);
//         setAlertMessage('Error uploading file!');
//         setAlertType('danger');
//       }
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const fileCount = files.length;
//     for (let i = currentFileIndex; i < fileCount; i++) {
//       const uploadSuccess = await uploadFile(i);
//       if (!uploadSuccess) {
//         break;
//       }
//     }
//     setLoading(false);
//   };

//   const skipFile = async () => {
//     // await removeFromLocalForage(files[currentFileIndex]);
//     const nextFileIndex = currentFileIndex + 1;
//     setCurrentFileIndex(nextFileIndex);
//     // await localforage.setItem('currentFileIndex', nextFileIndex);
//     // if (nextFileIndex >= files.length) {
//     //   await removeCurrentFileIndex();
//     // }
//     setShowSkipBtn(false);
//     setShowReplaceBtn(false);
//     setAlertMessage('');
//     setAlertType('');
//     handleSubmit({ preventDefault: () => {} })
//   };

//   const replaceFile = async () => {
//     setShowReplaceBtn(false);
//     setShowSkipBtn(false);
//     await uploadFile(currentFileIndex, true);
//     handleSubmit({ preventDefault: () => {} })
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="file"
//           name="files"
//           onChange={handleFileChange}
//           multiple
//           accept=".jpg,.jpeg"
//           required
//         />
//         <Button
//           type="primary"
//           htmlType="submit"
//           loading={loading}
//           disabled={files.length === 0}
//         >
//           Upload Files
//         </Button>
//       </form>
//       {alertMessage && (
//         <div className={`alert alert-${alertType}`} role="alert">
//           {alertMessage}
//         </div>
//       )}
//       {showSkipBtn && (
//         <Button type="danger" onClick={skipFile}>
//           Skip {currentFileName}
//         </Button>
//       )}
//       {showReplaceBtn && (
//         <Button type="primary" onClick={replaceFile}>
//           Replace {currentFileName}
//         </Button>
//       )}
//       {loading && (
//         <Progress percent={progress} status="active" />
//       )}
//     </div>
//   );
// };

// export default ImportOmr;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress, Alert } from 'antd';
import { useProjectId } from '@/store/ProjectState';

const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [showReplaceBtn, setShowReplaceBtn] = useState(false);
  const [showSkipAllBtn, setShowSkipAllBtn] = useState(false);
  const [showReplaceAllBtn, setShowReplaceAllBtn] = useState(false);
  const [conflictingFiles, setConflictingFiles] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [lastUploadedFile, setLastUploadedFile] = useState('');
  const [alertType, setAlertType] = useState('');
  const [progress, setProgress] = useState(0);

  const ProjectId = useProjectId();

  useEffect(() => {
    fetchLastOmrImageName(ProjectId);
  }, [ProjectId]);

  const fetchLastOmrImageName = async (ProjectId) => {
    try {
      const response = await axios.get(
        `${apiurl}/OMRData/omrdata/${ProjectId}/last-image-name?WhichDatabase=Local`,
      );
      setLastUploadedFile(response.data);
    } catch (error) {
      console.error('Error fetching the last OMR image name:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
    setUploadStatus((prev) => ({
      ...prev,
      selected: selectedFiles.length,
      pending: selectedFiles.length,
    }));
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file, replace = false) => {
    let progressPercent = 0;
    try {
      const base64File = await readFileAsBase64(file);
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      await axios.post(
        `${apiurl}/OMRData/upload-request?ProjectId=${ProjectId}&WhichDatabase=Local`,
        { omrImagesName: fileNameWithoutExtension, filePath: base64File, replace: replace },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              progressPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(progressPercent);
            }
          },
        },
      );
      return { success: true, conflict: false };
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return { success: false, conflict: true };
      } else {
        console.error(`Error uploading file ${file.name}:`, error);
        return { success: false, conflict: false };
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0); // Reset progress

    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);

    const conflicts = results
      .map((result, index) => (result.conflict ? files[index] : null))
      .filter((file) => file !== null);

    setConflictingFiles(conflicts);

    if (conflicts.length > 0) {
      setShowSkipBtn(true);
      setShowReplaceBtn(true);
      setShowSkipAllBtn(true);
      setShowReplaceAllBtn(true);
      setAlertMessage('Some files have conflicts.');
      setAlertType('warning');
    } else {
      setAlertMessage('All files uploaded successfully.');
      setAlertType('success');
      setFiles([]);
    }
    setLoading(false);
  };

  const resolveConflict = async (file, action) => {
    if (action === 'skip') {
      setFiles(files.filter((f) => f.name !== file.name));
      setUploadStatus((prev) => ({
        ...prev,
        pending: prev.pending - 1,
      }));
    } else if (action === 'replace') {
      await uploadFile(file, true);
    }

    const remainingConflicts = conflictingFiles.filter((f) => f.name !== file.name);
    setConflictingFiles(remainingConflicts);

    if (remainingConflicts.length === 0) {
      setShowSkipBtn(false);
      setShowReplaceBtn(false);
      setShowSkipAllBtn(false);
      setShowReplaceAllBtn(false);
      setAlertMessage('');
      setAlertType('');
      setLoading(false);
    }
  };

  const resolveAllConflicts = async (action) => {
    setLoading(true);
    setProgress(0); // Reset progress

    if (action === 'skip') {
      setFiles(files.filter((file) => !conflictingFiles.includes(file)));
      setUploadStatus((prev) => ({
        ...prev,
        pending: prev.pending - conflictingFiles.length,
      }));
    } else if (action === 'replace') {
      for (const file of conflictingFiles) {
        await uploadFile(file, true);
      }
    }

    setConflictingFiles([]);
    setShowSkipBtn(false);
    setShowReplaceBtn(false);
    setShowSkipAllBtn(false);
    setShowReplaceAllBtn(false);
    setAlertMessage('');
    setAlertType('');
    setLoading(false);
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
        <Button type="primary" htmlType="submit" loading={loading} disabled={files.length === 0}>
          Upload Files
        </Button>
      </form>
      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          className="my-5"
          closable
          onClose={() => {
            setAlertMessage('');
            setAlertType('');
          }}
        />
      )}
      <div className="d-flex gap-4">
        {showSkipBtn && (
          <Button danger onClick={() => resolveConflict(conflictingFiles[0], 'skip')}>
            Skip {conflictingFiles[0].name}
          </Button>
        )}
        {showReplaceBtn && (
          <Button type="primary" onClick={() => resolveConflict(conflictingFiles[0], 'replace')}>
            Replace {conflictingFiles[0].name}
          </Button>
        )}
        {showSkipAllBtn && (
          <Button danger onClick={() => resolveAllConflicts('skip')}>
            Skip All Files
          </Button>
        )}
        {showReplaceAllBtn && (
          <Button type="primary" onClick={() => resolveAllConflicts('replace')}>
            Replace All Files
          </Button>
        )}
      </div>
      {loading && <Progress percent={progress} status="active" />}
      {lastUploadedFile && <p>Last Uploaded File: {lastUploadedFile}</p>}
    </div>
  );
};

export default ImportOmr;
