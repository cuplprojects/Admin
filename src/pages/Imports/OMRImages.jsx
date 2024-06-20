import React from 'react';

const OMRImages = ({ handleFileUpload, handleImagesUpload, selectedFile }) => {
  return (
    <div className="tab-pane active" id="OMRImages">
      <h3 className="head text-center">Upload OMR Images</h3>
      <div className="d-flex justify-content-center mt-4">
        <p>
          <input type="file" onChange={handleFileUpload} multiple accept=".jpg,.jpeg" />
        </p>
        {selectedFile && (
          <button className="btn btn-primary" onClick={handleImagesUpload}>
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default OMRImages;
