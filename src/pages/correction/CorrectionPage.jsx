import { Button, Image } from 'antd';
import React from 'react';
import { Table } from 'react-bootstrap';
import omr1 from '@/assets/images/omrs/100001.jpg';
import ZoomedImage from './ZoomedImage';

const CorrectionPage = () => {

  const image = {
    src: 'path/to/your/image.jpg',
    projectId: 1,
    annotations: [
      {
        FieldName: 'Booklet No',
        coordinates: '{"x":38,"y":143,"width":142,"height":209}',
      },
    ],
  };
  
  const imageurl = omr1;
  const styles = {
    image: {
      width: '100%',
    },
    field:{
      width: '500px',
      top: '0',
      left: '0',
      backgroundColor:'red'
    }
  };
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
      <div className=" w-75 position-relative m-auto border" style={{ overflow: 'hidden' }}>
        {/* image zoom mode  */}
       <ZoomedImage src={imageurl}/>
        {/* <div className="position-absolute" style={styles.field}>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil, reprehenderit?
        </div> */}
      </div>
      <div className="m-1 text-end">
        <Button type="primary">Save and Next</Button>
      </div>
    </>
  );
};

export default CorrectionPage;
