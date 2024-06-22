import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import './Project.css';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
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
};

const Project = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5071/api/Projects');
      const data = await response.json();
      setData(data.map((item, index) => ({ ...item, key: index.toString(), serialNo: index + 1 })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const edit = (record) => {
    form.setFieldsValue({
      projectName: record.projectName,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
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
      const response = await fetch(`http://localhost:5071/api/Projects/${updatedRow.projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRow),
      });
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
      const response = await fetch('http://localhost:5071/api/Projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });
      if (!response.ok) {
        throw new Error('Failed to add new project');
      }
      // Handle success
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };

  const handleAdd = () => {
    const newRowKey = data.length + 1;
    const newData = {
      key: newRowKey.toString(),
      serialNo: newRowKey,
      projectName: '',
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
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: '70%',
      editable: true,
      render: (_, record) => (
        <span>{record.projectName}</span>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <Typography.Link
                  onClick={() => save(record.key)}
                  style={{ marginRight: 8 }}
                >
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
    }
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
    <div className='mt-5'>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }} disabled={hasUnsavedChanges}>
        Add a row
      </Button>
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
        />
      </Form>
    </div>
  );
};

export default Project;
