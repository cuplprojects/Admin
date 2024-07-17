import React, { useState } from 'react';
import { Button, Card, Table, Popconfirm, message } from 'antd';
import { IconButton, Iconify } from '@/components/icon';
import RoleModal from './role-modal';
import { BasicStatus } from '#/enum'; // Assuming this is correctly imported

// Mock data for roles (replace with actual data handling logic)
let ROLES = [
  {
    id: '1',
    name: 'Role A',
    label: 'Role A Label',
    status: BasicStatus.ENABLE,
    permission: ['1.1', '1.1.1', '1.2', '1.2.1', '1.2.2', '1.2.3'],
    desc: 'Description for Role A',
    order: 1,
  },
  {
    id: '2',
    name: 'Role B',
    label: 'Role B Label',
    status: BasicStatus.DISABLE,
    permission: ['2.1', '2.1.1', '2.2', '2.2.1', '2.2.2'],
    desc: 'Description for Role B',
    order: 2,
  },
];

const DEFAULT_ROLE_VALUE = {
  id: '',
  name: '',
  label: '',
  status: BasicStatus.ENABLE,
  permission: [],
  desc: '',
  order: 0,
};

const RolePage = () => {
  const [roleModalProps, setRoleModalProps] = useState({
    formValue: { ...DEFAULT_ROLE_VALUE },
    title: 'New',
    show: false,
    onOk: (role) => {
      if (role.id) {
        // Update existing role
        console.log('Updated Role:', role); // Log updated role data
        message.success('Role updated successfully');
      } else {
        // Add new role
        // role.id = String(ROLES.length + 1); // Replace with actual ID logic
        // ROLES.push(role);
        console.log('Created Role:', role); // Log newly created role data
        message.success('Role created successfully');
      }
      setRoleModalProps((prev) => ({ ...prev, show: false }));
    },
    onCancel: () => {
      setRoleModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Label',
      dataIndex: 'label',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      width: 60,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status) => (
        <span>{status === BasicStatus.DISABLE ? 'Disable' : 'Enable'}</span>
      ),
    },
    {
      title: 'Desc',
      dataIndex: 'desc',
    },
    {
      title: 'Action',
      key: 'operation',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray">
          <IconButton onClick={() => onEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            title="Delete the Role?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record.id)}
            placement="left"
          >
            <IconButton>
              <Iconify
                icon="mingcute:delete-2-fill"
                size={18}
                className="text-error"
              />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onCreate = () => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Create New',
      formValue: { ...DEFAULT_ROLE_VALUE },
    }));
  };

  const onEdit = (formValue) => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Edit',
      formValue,
    }));
  };

  const onDelete = (roleId) => {
    // Delete logic here (e.g., call API or update state)
    const updatedRoles = ROLES.filter((role) => role.id !== roleId);
    ROLES = updatedRoles; // Update the ROLES array
    message.success('Role deleted successfully');
  };

  return (
    <Card
      title="Role List"
      extra={
        <Button type="primary" onClick={onCreate}>
          New
        </Button>
      }
    >
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        columns={columns}
        dataSource={ROLES}
      />
      <RoleModal {...roleModalProps} />
    </Card>
  );
};

export default RolePage;
