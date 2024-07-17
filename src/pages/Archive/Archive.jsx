import React, { useState, useEffect } from 'react';
import { Table, Typography, Input } from 'antd';
import './../Masters/Projects/Project.css';

const apiurl = import.meta.env.VITE_API_URL;

function Archive() {
  const [data, setData] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiurl}/Projects?WhichDatabase=Local`);
      const data = await response.json();
      setData(data.map((item, index) => ({ ...item, key: index.toString(), serialNo: index + 1 })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setSortedInfo({
      order: sorter.order,
      columnKey: sorter.field,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = data.filter(item =>
      item.projectName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setData(filteredData);
  };

  const handleArchive = async (key) => {
    try {
      // Implement your archive logic here
      console.log('Archive project with key:', key);
      // Assuming you want to fetch updated data after archiving
      fetchData();
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  };

  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      width: '10%',
      sorter: (a, b) => a.serialNo - b.serialNo,
      sortOrder: sortedInfo.columnKey === 'serialNo' && sortedInfo.order,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: '35%',
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      sortOrder: sortedInfo.columnKey === 'projectName' && sortedInfo.order,
    },
    {
      title: 'User Assigned',
      dataIndex: 'userAssigned',
      width: '35%',
      render: (_, record) => (
        <span>
          {Array.isArray(record.userAssigned) ? record.userAssigned.join(', ') : record.userAssigned}
        </span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record) => (
        <Typography.Link
          onClick={() => handleArchive(record.key)}
        >
          Unarchive
        </Typography.Link>
      ),
    },
  ];

  return (
    <div className="mt-5">
      <div className="d-flex align-items-center justify-content-between w-100" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search Project"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 200, marginRight: 8 }}
        />
      </div>
      <Table
        bordered
        dataSource={data}
        columns={columns}
        rowKey="key"
        onChange={handleChange}
      />
    </div>
  );
}

export default Archive;
