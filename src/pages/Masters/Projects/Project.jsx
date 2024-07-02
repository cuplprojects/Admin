import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm, Table, Typography, message } from 'antd';
import './Project.css';

const apiurl = import.meta.env.VITE_API_URL;

function EditableCell({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function Project() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      projectName: record.projectName,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    const lastRow = data[data.length - 1];
    if (lastRow && lastRow.projectName.trim() === '') {
      // Remove the last row if Project Name is blank
      const newData = [...data];
      newData.pop();
      setData(newData);
      setHasUnsavedChanges(false);
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        // Check for duplicate projectName
        const isDuplicate = newData.some((item, idx) => idx !== index && item.projectName === row.projectName);
        if (isDuplicate) {
          message.error('Project name already exists. Please enter a unique name.');
          return;
        }

        const item = newData[index];
        if (item.method === 'POST') {
          await addRow({ ...item, ...row });
        } else {
          newData.splice(index, 1, { ...item, ...row });
          await updateRow(newData[index]);
        }
        setData(newData);
        setEditingKey('');
        setHasUnsavedChanges(false);
      } else {
        // Check for duplicate projectName before adding
        const isDuplicate = newData.some((item) => item.projectName === row.projectName);
        if (isDuplicate) {
          message.error('Project name already exists. Please enter a unique name.');
          return;
        }

        await addRow(row);
        setData([...newData, row]);
        setEditingKey('');
        setHasUnsavedChanges(false);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const updateRow = async (updatedRow) => {
    try {
      const response = await fetch(
        `${apiurl}/Projects/${updatedRow.projectId}?WhichDatabase=Local`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRow),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      // Handle success
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const addRow = async (newRow) => {
    try {
      const response = await fetch(`${apiurl}/Projects?WhichDatabase=Local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });
      if (!response.ok) {
        cancel();
        throw new Error('Failed to add new project');
      }
      fetchData();
      // Handle success
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Filter data based on projectName containing searchTerm
    const filteredData = data.filter(item =>
      item.projectName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setData(filteredData);
  };

  const handleAdd = () => {
    const newRowKey = data.length + 1;
    const newData = {
      key: newRowKey.toString(),
      serialNo: newRowKey,
      projectName: '', // Start with blank projectName
      method: 'POST',
    };
    setData([...data, newData]);
    setEditingKey(newRowKey.toString());
    setHasUnsavedChanges(true);
  };

  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      width: '15%',
      sorter: (a, b) => a.serialNo - b.serialNo,
      sortOrder: sortedInfo.columnKey === 'serialNo' && sortedInfo.order,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: '70%',
      editable: true,
      sorter: (a, b) => a.projectName.length - b.projectName.length,
      sortOrder: sortedInfo.columnKey === 'projectName' && sortedInfo.order,
      render: (_, record) => <span>{record.projectName}</span>,
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                  Save
                </Typography.Link>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <a>Cancel</a>
                </Popconfirm>
              </span>
            ) : (
              <Typography.Link
                disabled={editingKey !== '' && editingKey !== record.key}
                onClick={() => edit(record)}
              >
                Edit
              </Typography.Link>
            )}
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'projectId' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="mt-5">
      <div className="d-flex align-items-center justify-content-between w-100"  style={{ marginBottom: 16 }}>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{ marginBottom: 16 }}
        disabled={hasUnsavedChanges}
        >
        Add Project
      </Button>
        <Input
          placeholder="Search Project"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 100, marginRight: 8 }}
        />
      
        </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
          onChange={handleChange}
        />
      </Form>
    </div>
  );
}

export default Project;
