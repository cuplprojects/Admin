import React, { useState, useEffect } from 'react';
import Scanned from './ScannedData';
import Registration from './RegistrationData';
import Absentee from './Absentee';
import * as XLSX from 'xlsx';
import axios from 'axios';
import FileUploadComponent from './FileUploadComponent';
import './style.css';
import { useThemeToken } from '@/theme/hooks';
import { color } from 'framer-motion';
import ImportOmr from './OmrImport/ImportOmr';
import { useProjectId } from '@/store/ProjectState';

import { handleDecrypt, handleEncrypt } from '@/Security/Security';

import { Upload, Button, Table, notification, Modal } from 'antd';


const apiurl = import.meta.env.VITE_API_URL;

const Import = () => {
  const { colorPrimary } = useThemeToken();
  const [activetab, setActivetab] = useState('OMRImages');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [mapping, setMapping] = useState([]);
  const [registrationMapping, setRegistrationMapping] = useState([]);
  const [fieldNamesArray, setFieldNamesArray] = useState([]);
  const [lastUploadedFile, setLastUploadedFile] = useState('');
  const ProjectId = useProjectId();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && activetab === 'OMRImages') {
      setSelectedFile(file);
    } else if (file && ['scanned', 'registration', 'absentee'].includes(activetab)) {
      if (
        activetab === 'scanned' &&
        (file.type === 'text/csv' || file.type === 'application/dat')
      ) {
        setSelectedFile(file);
      } else if (
        (activetab === 'registration' || activetab === 'absentee') &&
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const excelHeaders = jsonData[0];
          setHeaders(excelHeaders);
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error('Invalid file format:', file.type);
      }
    } else {
      console.error('No file selected or unsupported tab:', activetab);
    }
  };

  useEffect(() => {
    // Fetch mapping fields from backend
    const fetchMappingFields = async () => {
      try {
        const response = await fetch(
          `${apiurl}/Absentee/absentee/mapping-fields?WhichDatabase=Local`,
        );
        const data = await response.json();

        // Transform array data into object format
        const initialMapping = data.reduce((acc, field) => {
          acc[field.toUpperCase()] = '';
          return acc;
        }, {});

        setMapping(initialMapping);
      } catch (error) {
        console.error('Error fetching mapping fields:', error);
      }
    };
    fetchMappingFields();
  }, []);

  const handleAbsenteeUpload = async (projectId) => {
    if (selectedFile) {
      setLoading(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rows = jsonData.slice(1); // Exclude headers
        const mappedData = rows.map((row) => {
          const rowData = {};
          for (let property in mapping) {
            const header = mapping[property];
            const index = jsonData[0].indexOf(header);
            // Ensure the value is converted to string before assigning
            rowData[property] = index !== -1 ? String(row[index]) : '';
          }
          // Add projectId to each row
          rowData['projectId'] = ProjectId;
          return rowData;
        });

        try {
          const jsonmappeddata = JSON.stringify(mappedData);
          const encryptedData = handleEncrypt(jsonmappeddata);
          const encrypteddatatosend = {
            cyphertextt: encryptedData,
          };

          const response = await axios.post(`${apiurl}/Absentee/upload`, encrypteddatatosend, {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              WhichDatabase: 'Local',
              ProjectId: ProjectId,
            },
          });
          
  
          notification.success({
            message: 'Upload successful!',
            duration: 3,
          });
        } catch (error) {
          console.error('Error uploading data:', error);
          notification.error({
            message: 'Error uploading data!',
            duration: 3,
          })
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      console.error('No file selected.');
      notification.error({
        message: 'No file selected!',
        duration: 3,
      })
      notification.error({
        message: 'No file selected!',
        duration: 3,
      })
      setLoading(false);
    }

    setSelectedFile(null); // Reset selected file after upload
  };

  useEffect(() => {
    if (activetab === 'scanned') {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const rows = content.split('\n').map((row) => row.split(','));
          const headersFromFile = rows[0].map((header) => header.trim().replace(/"/g, ''));
          setHeaders(headersFromFile);
        };
        reader.readAsText(selectedFile);
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    // Fetch field mappings from the backend
    const fetchFieldMappings = async () => {
      try {
        const response = await axios.get(
          `${apiurl}/FieldConfigurations/GetByProjectId/${ProjectId}?WhichDatabase=Local`,
        );
        if (response.data.length == 0) {

          throw new Error('Failed to fetch field mappings');
        }
        let decryptedData = handleDecrypt(response.data);
        let dataJson = JSON.parse(decryptedData);

        const mappings = dataJson?.map((item) => ({
          field: item.FieldName,
        }));

        mappings.push({ field: 'Answers' });
        mappings.push({ field: 'Barcode' });
        mappings.push({ field: 'NCS' });

        setFieldMappings(
          mappings.reduce((acc, current) => ({ ...acc, [current.field]: current }), {}),
        );
      } catch (error) {
        console.error('Error fetching field mappings:', error);
      }
    };
    fetchFieldMappings();
  }, []);

  useEffect(() => {
    const fetchRegistrationMappings = async () => {
      try {
        const response = await axios.get(
          `${apiurl}/FieldConfigurations/GetByProjectId/${ProjectId}?WhichDatabase=Local`,
        );
        if (response.data.length == 0) {
          throw new Error('Failed to fetch field mappings');
        }
        let decryptedData = handleDecrypt(response.data);
        let dataJson = JSON.parse(decryptedData);

        // Transform array data into object format
        const initialMapping = dataJson.reduce((acc, item) => {
          acc[item.FieldName] = '';
          return acc;
        }, {});

        setRegistrationMapping(initialMapping);
      } catch (error) {
        console.error('Error fetching field mappings:', error);
      }
    };
    fetchRegistrationMappings();
  }, []);

  const handleFieldMappingChange = (e, field) => {
    setFieldMappings((prevMappings) => ({ ...prevMappings, [field]: e.target.value || '' }));
  };

  const handleScannedUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const rows = content.split('\n').map((row) => row.split(','));
        const headers = rows[0].map((header) => header.trim().replace(/"/g, ''));
        const mappingObject = {};

        headers.forEach((header) => {
          const matchingField = Object.keys(fieldMappings).find(
            (key) => fieldMappings[key] === header,
          );
          if (matchingField) {
            mappingObject[header] = matchingField;
          } else {
            console.warn(`No matching field found for header "${header}"`);
          }
        });

        const parsedData = rows.slice(1, -1).map((row) => {
          const rowData = {};
          row.forEach((value, index) => {
            const cleanedValue = value.replace(/"/g, '');
            const matchingField = mappingObject[headers[index]];
            if (matchingField) {
              rowData[matchingField] = cleanedValue;
            }
          });


          if (rowData['Answers']) {
            const answers = {};
            const ansArray = rowData['Answers'].split('');
            for (let i = 0; i < 100; i++) {
              if (i < ansArray.length) {
                let answer = ansArray[i];
                // Trim trailing white spaces
                answer = answer.replace(/\s+$/, '');
                // Preserve leading white spaces and wrap in quotes
                answers[i + 1] = `'${answer}'`;
              } else {
                answers[i + 1] = "''";
              }
            }
            rowData['Answers'] = JSON.stringify(answers).replace(/"/g, '');
          }

          return rowData;
        });

        try {
          const jsonmappedscanneddata = JSON.stringify(parsedData);
          console.log(jsonmappedscanneddata);
          const encryptedData = handleEncrypt(jsonmappedscanneddata);
          console.log(encryptedData);
          const encryptedscanneddatatosend = {
            cyphertextt: encryptedData,
          };
          const response = await axios.post(`${apiurl}/OMRData/uploadcsv`, encryptedscanneddatatosend, {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              WhichDatabase: 'Local',
              ProjectId: ProjectId,
            },
          });
          const contentType = response.headers.get('content-type');

          if (contentType && contentType.indexOf('application/json') !== -1) {
           notification.success({
            message: 'Upload successful!',
            duration:3
           })           
          } else {
            notification.success({
              message: 'Upload successful!',
              duration:3
             })
          }
        } catch (error) {
          console.error('Error uploading data:', error);
          notification.error({
            message: 'Error uploading data!',
            duration:3
           })
         
        } finally {
          setLoading(false);

          setSelectedFile(null); // Reset selected file after upload
        }
      };
      reader.readAsText(selectedFile);
    } else {
      console.error('No file selected.');
      notification.warning({
        message: 'No file selected!',
        duration:3
       })
      setLoading(false);
    }
  };

  const handleRegistrationMappingChange = (e, field) => {
    setRegistrationMapping((prevMappings) => ({
      ...prevMappings,
      [field]: e.target.value || '',
    }));
  };

  useEffect(() => {}, [registrationMapping]);

  const handleRegistrationUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      console.error('No file selected.');
      notification.warning({
        message: 'No file selected!',
        duration:3
       })
      setLoading(false);
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = jsonData[0]; // Extract headers from the first row
        const rows = jsonData.slice(1); // Exclude headers

        const mappedData = rows.map((row) => {
          const rowData = {};
          for (let property in registrationMapping) {
            const header = registrationMapping[property];
            const index = headers.indexOf(header);
            if (index !== -1) {
              rowData[property] = String(row[index]); // Ensure data is converted to a string if necessary
            } else {
              console.warn(
                `Header '${header}' not found in Excel data. Skipping field '${property}'.`,
              );
            }
          }
          return rowData;
        });

        const validMappedData = mappedData.filter((row) => {
          // Check if all mapped fields have corresponding headers
          return Object.keys(row).every((field) => row[field] !== undefined && row[field] !== '');
        });

        if (validMappedData.length === 0) {
          console.warn('No valid data to upload. Ensure all required fields are mapped.');
          notification.warning({
            message: 'No valid data to upload.!',
            duration:3
           })
          setLoading(false);
          setSelectedFile(null);
          return;
        }

        const jsonmappedregdata = JSON.stringify(mappedData);
        const encryptedData = handleEncrypt(jsonmappedregdata);
        const encryptedregdatatosend = {
          cyphertextt: encryptedData,
        };

        // const response = await fetch(`${apiurl}/Registration?WhichDatabase=Local&ProjectId=${ProjectId}`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(validMappedData),
        // });
        const response = await axios.post(`${apiurl}/Registration?`, encryptedregdatatosend, {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            WhichDatabase: 'Local',
            ProjectId: ProjectId,
          },
        });
      notification.success({
          message: 'Upload successful!',
          duration:3
         })
      } catch (error) {
        console.error('Error uploading registration data:', error);
        notification.error({
          message: 'Error uploading data!',
          duration:3
         })
      } finally {
        setLoading(false);
        setSelectedFile(null);
      }
    };

    reader.readAsArrayBuffer(selectedFile); // Read file as ArrayBuffer
  };

  const handleMappingChange = (e, property) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [property]: e.target.value || '',
    }));
  };

  return (
    <div>
      <section
        style={{ minHeight: '70vh' }}
        className=" container-fluid rounded border border-2 pb-4"
      >
        <div className="container">
          <div className="row">
            <div className="board-pq">
              <div className="">
                <ul className="d-flex align-items-center justify-content-around my-4" id="myTab">
                  <li
                    style={{ border: `2px solid ${colorPrimary}` }}
                    className="tabcircle"
                    onClick={() => {
                      setActivetab('OMRImages');
                      setSelectedFile(null);
                    }}
                  >
                    <a data-toggle="tab" title="OMR Images">
                      <span className="round-tabs-pq one-pq">
                        <i className="fa-regular fa-image " style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className="tabline"></span>

                  <li
                    style={{ border: `2px solid ${colorPrimary}` }}
                    className="tabcircle"
                    onClick={() => {
                      setActivetab('scanned');
                      setSelectedFile(null);
                      setAlertMessage(null);
                      setAlertType(null);
                      setHeaders([]);
                    }}
                  >
                    <a data-toggle="tab" title="Scanned Data">
                      <span className="round-tabs-pq two-pq">
                        <i className="fa-solid fa-file-csv" style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className="tabline"></span>

                  <li
                    style={{ border: `2px solid ${colorPrimary}` }}
                    className="tabcircle"
                    onClick={() => {
                      setActivetab('registration');
                      setSelectedFile(null);
                      setHeaders([]);
                      setAlertMessage(null);
                      setAlertType(null);
                    }}
                  >
                    <a data-toggle="tab" title="Registration Data">
                      <span className="round-tabs-pq three-pq">
                        <i className="fa-regular fa-id-card" style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className="tabline"></span>

                  <li
                    style={{ border: `2px solid ${colorPrimary}` }}
                    className="tabcircle"
                    onClick={() => {
                      setActivetab('absentee');
                      setSelectedFile(null);
                      setHeaders([]);
                      setAlertMessage(null);
                      setAlertType(null);
                    }}
                  >
                    <a data-toggle="tab" title="Absentee Data">
                      <span className="round-tabs-pq four-pq ">
                        <i className="fa-solid fa-file-excel" style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="tab-content-pq">
                {fieldNamesArray.map((item) => {})}
                {activetab === 'OMRImages' && <ImportOmr />}
                {activetab === 'scanned' && (
                  <Scanned
                    handleFileUpload={handleFileUpload}
                    handleScannedUpload={handleScannedUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    loading={loading}
                    headers={headers}
                    fieldMappings={fieldMappings}
                    handleFieldMappingChange={handleFieldMappingChange}
                  />
                )}
                {activetab === 'registration' && (
                  <Registration
                    handleFileUpload={handleFileUpload}
                    handleRegistrationUpload={handleRegistrationUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    headers={headers}
                    registrationMapping={registrationMapping}
                    handleRegistrationMappingChange={handleRegistrationMappingChange}
                    loading={loading}
                  />
                )}
                {activetab === 'absentee' && (
                  <Absentee
                    handleFileUpload={handleFileUpload}
                    handleAbsenteeUpload={handleAbsenteeUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    headers={headers}
                    mapping={mapping}
                    handleMappingChange={handleMappingChange}
                    loading={loading}
                  />
                )}
                <div className="clearfix-pq"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Import;
