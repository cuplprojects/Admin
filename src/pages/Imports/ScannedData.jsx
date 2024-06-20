import React from 'react';

const Scanned = ({ handleFileUpload, handleScannedUpload, selectedFile }) => {
  return (
    <div className="tab-pane active" id="scanned">
      <h3 className="head text-center">Upload Scanned Data</h3>
      <div className="d-flex justify-content-center mt-4">
        <p>
          <input type="file" onChange={handleFileUpload} accept=".csv,.dat,.xlsx" />
        </p>
        {selectedFile && (
          <button className="btn btn-primary" onClick={handleScannedUpload}>
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default Scanned;
