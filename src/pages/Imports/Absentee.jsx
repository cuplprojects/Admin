import React, { useEffect, useState } from 'react';

const Absentee = ({ handleFileUpload, handleAbsenteeUpload, selectedFile, headers, mapping, handleMappingChange }) => {
    const [isValidData, setIsValidData] = useState(false);
    useEffect(() => {
        // Check if all properties in mapping have a corresponding header in headers
        const isValid = Object.values(mapping).every(value => headers.includes(value));
        setIsValidData(isValid);
      }, [headers, mapping]);



  return (
    <div className={`tab-pane active d-flex align-items-center justify-content-around py-3 mt-5`}  id="absentee">
      <h3 className="head text-center fs-3">Upload Absentee </h3>
      <div className="d-flex justify-content-center align-items-center">
        <p>
          <input type="file" onChange={handleFileUpload} accept=".xlsx" />
        </p>
      </div>
      {headers.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Model Property</th>
                <th>Excel Header</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mapping).map((property) => (
                <tr key={property}>
                  <td>{property}</td>
                  <td>
                    <select value={mapping[property]} onChange={(e) => handleMappingChange(e, property)}>
                      <option value="">Select Header</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
     {selectedFile && headers.length > 0 && isValidData && (
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-primary align-items-center" onClick={handleAbsenteeUpload}>
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default Absentee;
