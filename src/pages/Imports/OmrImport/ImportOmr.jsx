// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button, Progress } from 'antd';
// import localforage from 'localforage';

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

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const storedFiles = await localforage.getItem('uploadFiles') || [];
//         const storedIndex = await localforage.getItem('currentFileIndex') || 0;
//         setFiles(storedFiles);
//         setCurrentFileIndex(storedIndex);
//       } catch (error) {
//         console.error('Error fetching data from localforage:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleFileChange = async (e) => {
//     const selectedFiles = [...e.target.files];

//     try {
//       await localforage.setItem('uploadFiles', selectedFiles);
//       setFiles(selectedFiles);
//     } catch (error) {
//       console.error('Error storing data in localforage:', error);
//     }
//   };

//   const removeFromLocalForage = async (file) => {
//     try {
//       let storedFiles = await localforage.getItem('uploadFiles') || [];
//       storedFiles = storedFiles.filter((f) => f.name !== file.name);
//       await localforage.setItem('uploadFiles', storedFiles);
//     } catch (error) {
//       console.error('Error removing data from localforage:', error);
//     }
//   };

//   const removeCurrentFileIndex = async () => {
//     try {
//       await localforage.removeItem('currentFileIndex');
//     } catch (error) {
//       console.error('Error removing currentFileIndex from localforage:', error);
//     }
//   };

//   const handleSubmit = async (e, replace = false) => {
//     e.preventDefault();
//     if (currentFileIndex >= files.length) {
//       setAlertMessage('All files uploaded successfully!');
//       setAlertType('success');
//       setLoading(false);
//       setProgress(100);
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append('file', files[currentFileIndex]);

//     try {
//       const response = await axios.post(
//         `${apiurl}/OMRData/upload-request?WhichDatabase=Local&replace=${replace}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
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

//       console.log(`File ${currentFileIndex + 1} uploaded successfully:`, response);

//       await removeFromLocalForage(files[currentFileIndex]);

//       const nextFileIndex = currentFileIndex + 1;
//       setCurrentFileIndex(nextFileIndex);
//       await localforage.setItem('currentFileIndex', nextFileIndex);

//       if (nextFileIndex < files.length) {
//         handleNextFileUpload(nextFileIndex);
//       } else {
//         await localforage.removeItem('currentFileIndex');
//         await removeCurrentFileIndex();
//         setAlertMessage('All files uploaded successfully!');
//         setAlertType('success');
//         setProgress(100);
//       }
//     } catch (error) {
//       if (error.response && error.response.status === 409) {
//         setShowSkipBtn(true);
//         setShowReplaceBtn(true);
//         setCurrentFileName(files[currentFileIndex].name);
//         setAlertMessage('File with the same name already exists!');
//         setAlertType('danger');
//       } else {
//         console.error(`Error uploading file ${currentFileIndex + 1}:`, error);
//         setAlertMessage('Error uploading file!');
//         setAlertType('danger');
//       }
//       setLoading(false);
//     }
//   };

//   const handleNextFileUpload = (nextFileIndex) => {
//     setLoading(false);
//     setTimeout(() => {
//       setProgress(((nextFileIndex / files.length) * 100).toFixed(2));
//       handleSubmit({ preventDefault: () => {} });
//     }, 1000); // Delay to prevent rapid recursive calls
//   };

//   const skipFile = async () => {
//     await removeFromLocalForage(files[currentFileIndex]);

//     const nextFileIndex = currentFileIndex + 1;
//     setCurrentFileIndex(nextFileIndex);
//     await localforage.setItem('currentFileIndex', nextFileIndex);
//     handleNextFileUpload(nextFileIndex);
//     setShowSkipBtn(false);
//     setShowReplaceBtn(false);
//   };

//   const replaceFile = async () => {
//     handleSubmit({ preventDefault: () => {} }, true); // Pass true only for the current file index
//     setShowReplaceBtn(false);
//     setShowSkipBtn(false);
//   };

//   const handleResume = () => {
//     setLoading(true);
//     handleSubmit({ preventDefault: () => {} });
//   };

//   return (
//     <>
//       <h3 className="head text-center">Upload OMR Data</h3>
//       <form className="text-center mb-5 mt-4" onSubmit={(e) => handleSubmit(e)}>
//         <input type="file" multiple onChange={handleFileChange} />
//         {files.length > 0 && currentFileIndex < files.length && (
//           <Button type="primary" htmlType="submit" disabled={loading}>
//             {loading ? 'Uploading...' : 'Upload'}
//           </Button>
//         )}
//       </form>
//       {loading && (
//         <Progress
//           percent={progress}
//           size="small"
//           status={loading ? 'active' : 'normal'}
//         />
//       )}
//       {loading && <p>Loading...</p>}
//       {showSkipBtn && (
//         <>
//           <Button type="primary" onClick={skipFile}>
//             Skip {currentFileName}
//           </Button>
//           <Button type="primary" onClick={replaceFile}>
//             Replace {currentFileName}
//           </Button>
//         </>
//       )}
//       {alertMessage && (
//         <div className={`alert alert-${alertType} mt-3`} role="alert">
//           {alertMessage}
//         </div>
//       )}
//     </>
//   );
// };

// export default ImportOmr;




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
      console.log('Removing file:', file); // Debugging log
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

  const uploadFile = async (index, replace = false) => {
    setProgress(0);
    const formData = new FormData();
    formData.append('file', files[index]);
    try {
      const response = await axios.post(
        `${apiurl}/OMRData/upload-request?WhichDatabase=Local&replace=${replace}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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
    console.log('Skipping file:', files[currentFileIndex]); // Debugging log
    await removeFromLocalForage(files[currentFileIndex]);
    const nextFileIndex = currentFileIndex + 1;
    setCurrentFileIndex(nextFileIndex);
    await localforage.setItem('currentFileIndex', nextFileIndex);
    setShowSkipBtn(false);
    setShowReplaceBtn(false);
    setAlertMessage('');
    await handleSubmit({ preventDefault: () => {} });
  };

  const replaceFile = async () => {
    setShowSkipBtn(false);
    setShowReplaceBtn(false);
    setAlertMessage('');
    const replaceSuccess = await uploadFile(currentFileIndex, true);
    if (replaceSuccess) {
      await handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleResume = () => {
    setLoading(true);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <>
      <h3 className="head text-center">Upload OMR Data</h3>
      <form className="text-center mb-5 mt-4" onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        {files.length > 0 && currentFileIndex < files.length && (
          <Button type="primary" htmlType="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </form>
      {loading && (
        <Progress
          percent={progress}
          size="small"
          status={loading ? 'active' : 'normal'}
        />
      )}
      {loading && <p>Loading...</p>}
      {showSkipBtn && (
        <>
          <Button type="primary" onClick={skipFile}>
            Skip {currentFileName}
          </Button>
          <Button type="primary" onClick={replaceFile}>
            Replace {currentFileName}
          </Button>
        </>
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




