import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';

const apiurl = import.meta.env.VITE_API_URL;

const columns = [
  {
    title: 'Roll Number',
    dataIndex: 'roll',
    sorter: {
      compare: (a, b) => a.roll - b.roll,
    },
  },
  {
    title: 'Barcode',
    dataIndex: 'barcode',
    sorter: {
      compare: (a, b) => a.barcode - b.barcode,
    },
  },
  {
    title: 'Booklet Set',
    dataIndex: 'correctScore',
    sorter: {
      compare: (a, b) => a.correctScore - b.correctScore,
    },
  },
  {
    title: 'Total Score',
    dataIndex: 'totalScore',
    sorter: {
      compare: (a, b) => a.totalScore - b.totalScore,
    },
  },
];

const ViewScore = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiurl}/Score?WhichDatabase=Local`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        // Transform the data if necessary
        const transformedData = result.map(item => ({
          roll: item.scoreId,
          barcode: item.barCode,
          correctScore: item.scoreData,
          totalScore: item.totalScore,
        }));

        setData(transformedData);
        setLoading(false);
      } catch (error) {
        message.error('Failed to fetch scores');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      onChange={onChange}
      rowKey="roll"
    />
  );
};

export default ViewScore;
