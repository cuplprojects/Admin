import React from 'react';

const Scanned = ({ handleFileUpload, handleScannedUpload, selectedFile }) => {
  return (
    <div className="tab-pane active d-flex align-items-center justify-content-around py-3 mt-5" id="scanned">
      <h3 className="head text-center fs-3">Upload Scanned Data</h3>
      <div className="d-flex justify-content-center align-items-center ">
        <p>
          <input type="file" onChange={handleFileUpload} accept=".csv,.dat,.xlsx" />
        </p>
        {selectedFile && (
          <button className="btn btn-primary align-items-center" onClick={handleScannedUpload}>
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default Scanned;