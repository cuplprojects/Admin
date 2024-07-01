import { Button } from 'antd';
import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import omr1 from '@/assets/images/omrs/100001.jpg';
import ZoomedImage from './ZoomedImage';

const CorrectionPage = () => {
  const [data, setData] = useState([
    {
      coordinates: { x: 402, y: 130.4375, width: 114, height: 136 },
      FieldName: 'Booklet No',
      FieldValue: 101,
    },
    {
      coordinates: { x: 29, y: 136.71875, width: 157, height: 222 },
      FieldName: 'Roll No',
      FieldValue: 20001,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDataCorrected, setAllDataCorrected] = useState(false);

  const handleUpdate = (index, newValue) => {
    const updatedData = [...data];
    updatedData[index].FieldValue = newValue;
    setData(updatedData);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log(data);
    } else {
      setAllDataCorrected(true);
      console.log('All data corrected:', data);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentData = data[currentIndex];
  const imageurl = omr1;
  const remainingFlags = allDataCorrected ? 0 : data.length - currentIndex;

  return (
    <>
      <div className="text-end">
        <Button type="primary">Expand OMR</Button>
      </div>
      <p className="text-danger fs-5 m-1 text-center">Remaining Flags: {remainingFlags}</p>

      <div className="table-responsive">
        <Table className="table-bordered table-striped text-center">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>OMR Barcode Number</th>
              <th>Flag Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Project A</td>
              <td>123456</td>
              <td>{currentIndex + 1}</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '75%' }}>
        {!allDataCorrected ? (
          <ZoomedImage
            src={imageurl}
            data={currentData}
            onUpdate={(newValue) => handleUpdate(currentIndex, newValue)}
            onNext={handleNext}
          />
        ) : (
          <div className="text-center">
            <p className="fs-3">All data corrected</p>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-evenly m-1">
        <Button type="primary" onClick={handlePrevious}>
          Previous
        </Button>
        <Button type="primary" onClick={handleNext} disabled={allDataCorrected}>
          Save and Next
        </Button>
      </div>
    </>
  );
};

export default CorrectionPage;
