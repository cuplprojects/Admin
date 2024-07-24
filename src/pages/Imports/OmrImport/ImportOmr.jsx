
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress,notification } from 'antd';
import localforage from 'localforage';
import { useProjectId } from '@/store/ProjectState';

const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [showReplaceBtn, setShowReplaceBtn] = useState(false);
  const [showSkipAllBtn, setShowSkipAllBtn] = useState(false);
  const [showReplaceAllBtn, setShowReplaceAllBtn] = useState(false);
  const [conflictingFiles, setConflictingFiles] = useState([]);
  const [lastUploadedFile, setLastUploadedFile] = useState('');
  const [progress, setProgress] = useState(0);
  
  const ProjectId = useProjectId();

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

  useEffect(() => {
    fetchLastOmrImageName(ProjectId);
  }, [ProjectId])

  const fetchLastOmrImageName = async (ProjectId) => {
    try {
      const response = await axios.get(`${apiurl}/OMRData/omrdata/${ProjectId}/last-image-name?WhichDatabase=Local`);
      setLastUploadedFile(response.data);
      return response.data; // This is the last omrImagesName

    } catch (error) {
      console.error("Error fetching the last OMR image name:", error);
      return null;
    }
  };

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
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file, replace = false) => {
    let progressPercent=0;
    try {
      const base64File = await readFileAsBase64(file);
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      const response = await axios.post(
        `${apiurl}/OMRData/upload-request?ProjectId=${ProjectId}&WhichDatabase=Local`,
        { omrImagesName: fileNameWithoutExtension, filePath: base64File, replace: replace },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        
        }
      );
      await removeFromLocalForage(file);
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
  
    const totalFiles = files.length;
    let uploadedCount = 0;
    let conflicts = [];
  
    for (let index = 0; index < totalFiles; index++) {
      const file = files[index];
  
      try {
        const result = await uploadFile(file);
        uploadedCount++;
  
        // Calculate overall progress
        const progress = Math.round((uploadedCount / totalFiles) * 100);
        setProgress(progress);
  
        // Check for conflicts
        if (result.conflict) {
          conflicts.push(file);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  
    // Update state based on conflicts
    setConflictingFiles(conflicts);
  
    // Update UI based on conflict status
    if (conflicts.length > 0) {
      setShowSkipBtn(true);
      setShowReplaceBtn(true);
      setShowSkipAllBtn(true);
      setShowReplaceAllBtn(true);
      notification.warning({
        message: 'Some files have conflicts.',
        duration: 3,
      });
    } else {
      await removeCurrentFileIndex();
      notification.success({
        message: 'All files uploaded successfully.',
        duration: 3,
      });
    }
  
    setLoading(false);
  };
  

  const resolveConflict = async (file, action) => {
    if (action === 'skip') {
      await removeFromLocalForage(file);
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
      setLoading(false);
    }
  };

  const resolveAllConflicts = async (action) => {
    setLoading(true);

    if (action === 'skip') {
      for (const file of conflictingFiles) {
        await removeFromLocalForage(file);
      }
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
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={files.length === 0}
        >
          Upload Files
        </Button>
      </form>
      <div className='d-flex gap-4'>
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
      {loading && (
        <Progress percent={progress} status="active" />
      )}
      {lastUploadedFile && (
        <p>Last Uploaded File: {lastUploadedFile}</p>
      )}
    </div>
  );
};

export default ImportOmr;


