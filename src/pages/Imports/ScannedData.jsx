import React from 'react';

const Scanned = ({
  handleFileUpload,
  handleScannedUpload,
  selectedFile,
  alertMessage,
  alertType,
  loading,
}) => {
  return (
    <>
      <div
        className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3"
        id="scanned"
      >
        <h3 className="head fs-3 text-center">Upload Scanned Data</h3>
        <div className="d-flex justify-content-center align-items-center ">
          <p>
            <input type="file" onChange={handleFileUpload} accept=".csv,.dat,.xlsx" />
          </p>
          {selectedFile && (
            <button className="btn btn-primary" onClick={handleScannedUpload} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default Scanned;
