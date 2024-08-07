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
