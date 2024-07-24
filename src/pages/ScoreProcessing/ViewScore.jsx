import React, { useEffect, useState } from 'react';
import { Table, notification, Badge} from 'antd';
import { useProjectId } from '@/store/ProjectState';

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
    title: 'Course',
    dataIndex: 'course',
    sorter: {
      compare: (a, b) => a.course - b.course,
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

const expandedRowRender = (record) => {
  const nestedColumns = [
    {
      title: 'Section Name',
      dataIndex: 'sectionName',
      key: 'sectionName',
    },
    {
      title: 'Total Correct Answers',
      dataIndex: 'totalCorrectAnswers',
      key: 'totalCorrectAnswers',
    },
    {
      title: 'Total Wrong Answers',
      dataIndex: 'totalWrongAnswers',
      key: 'totalWrongAnswers',
    },
    {
      title: 'Total Score Sub',
      dataIndex: 'totalScoreSub',
      key: 'totalScoreSub',
      
    },
  ];


  const nestedData = record.sectionResult.map((section, index) => ({
    key: index, // Assuming 'key' is unique within section results
    sectionName: section.sectionName,
    totalCorrectAnswers: section.totalCorrectAnswers,
    totalWrongAnswers: section.totalWrongAnswers,
    totalScoreSub: section.totalScoreSub,
  }));
  return <Table columns={nestedColumns} dataSource={nestedData} pagination={false} />
}


const ViewScore = ({courseName}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const ProjectId = useProjectId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiurl}/Score?WhichDatabase=Local&ProjectId=${ProjectId}&courseName=${encodeURIComponent(courseName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        const transformedData = result.map(item => ({
          roll: item.rollNumber,
          course: item.courseName,
          correctScore: item.scoreData,
          totalScore: item.totalScore,
          sectionResult: item.sectionResult,
        }));

        setData(transformedData);
        setLoading(false);
      } catch (error) {
        notification.error({
          message: 'Failed to fetch scores!',
          duration: 3,
        });
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
      expandable={{
        expandedRowRender,
      }}
      rowKey="roll"
    />
  );
};

export default ViewScore;
