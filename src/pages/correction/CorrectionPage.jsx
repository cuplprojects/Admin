import { Button, Image } from 'antd';
import React from 'react';
import { Table } from 'react-bootstrap';

const CorrectionPage = () => {
  return (
    <>
      <div className="text-end">
        <Button type="primary">Expand OMR</Button>
      </div>
      <p className="text-danger fs-5 m-1 text-center">Remaining Flags: 10</p>

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
              <td>123</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className=" w-75 h-75 m-auto border">
        {/* <img src={} /> */}
      </div>
      <div className="text-end m-1">
        <Button type="primary">Save and Next</Button>
      </div>
    </>
  );
};

export default CorrectionPage;
