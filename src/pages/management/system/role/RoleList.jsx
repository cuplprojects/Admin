import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Popconfirm, message, Spin } from 'antd';
import RoleModal from './RoleModal';
import axios from 'axios';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';
import { BasicStatus } from '#/enum';
import {t} from '@/locales/i18n'


const apiurl = import.meta.env.VITE_API_URL;

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleModalProps, setRoleModalProps] = useState({
    visible: false,
    title: 'New',
    role: null,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${apiurl}/Roles?WhichDatabase=Local`);
        setRoles(response.data);
      } catch (error) {
        setError(error);
        message.error('Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'roleName',
      width: 300,
    },
    {
      title: 'Label',
      dataIndex: 'label',
    },
    { title: 'Order', dataIndex: 'order', width: 60 },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => (
        <ProTag color={status === 'DISABLE' ? 'error' : 'success'}>
          {status === 'DISABLE' ? 'Disable' : 'Enable'}
        </ProTag>
      ),
    },
    { title: 'Description', dataIndex: 'desc' },
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
            title="Delete the Role"
            onConfirm={() => onDelete(record.roleId)}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <IconButton>
              <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onCreate = () => {
    setRoleModalProps({
      visible: true,
      title: 'Create New',
      role: {
        roleId: 0,
        roleName: '',
        label: '',
        order: 0,
        status: 'enable',
        desc: '',
      },
    });
  };

  const onEdit = (role) => {
    setRoleModalProps({
      visible: true,
      title: 'Edit',
      role,
    });
  };

  const handleRoleModalOk = async (updatedRole) => {
    const { roleId, roleName, label, order, status, desc } = updatedRole;
    const rolePayload = { roleId, roleName, label, order, status, desc };

    try {
      if (roleModalProps.role && roleModalProps.role.roleId !== 0) {
        await axios.put(`${apiurl}/Roles/${roleModalProps.role.roleId}?WhichDatabase=Local`, rolePayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setRoles((prevRoles) =>
          prevRoles.map((role) => (role.roleId === updatedRole.roleId ? updatedRole : role))
        );
        message.success('Role updated successfully');
      } else {
        const response = await axios.post(`${apiurl}/Roles?WhichDatabase=Local`, rolePayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setRoles((prevRoles) => [...prevRoles, response.data]);
        message.success('Role created successfully');
      }
    } catch (error) {
      console.error('Error saving role:', error.response?.data || error.message);
      message.error('Failed to save role');
    } finally {
      setRoleModalProps({
        visible: false,
        title: 'New',
        role: null,
      });
    }
  };

  const handleRoleModalCancel = () => {
    setRoleModalProps({
      visible: false,
      title: 'New',
      role: null,
    });
  };

  const onDelete = async (roleId) => {
    try {
      await axios.delete(`${apiurl}/${roleId}?WhichDatabase=Local`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.roleId !== roleId));
      message.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error.response?.data || error.message);
      message.error('Failed to delete role');
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <p className='text-center text-danger mt-4'>{t('pagedata.rolepage.failedtoloaderror')}</p>;
  }

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
        rowKey="roleId"
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={false}
        columns={columns}
        dataSource={roles}
      />
      <RoleModal
        visible={roleModalProps.visible}
        title={roleModalProps.title}
        role={roleModalProps.role}
        permissions={[]} // You can fetch and pass permissions here
        onOk={handleRoleModalOk}
        onCancel={handleRoleModalCancel}
      />
    </Card>
  );
};

export default RoleList;
