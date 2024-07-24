import { App, Button, Col, Form, Row, Switch, Table } from 'antd';
import Card from '@/components/card';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';



export default function PermissionTab() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { userId } = useParams();

  const [modules, setModules] = useState([]);
  const [selectAll, setSelectAll] = useState({
    canView: false,
    canAdd: false,
    canUpdate: false,
    canDelete: false,
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get('https://localhost:7290/api/Modules');
        const modulesData = response.data.map(module => ({
          ...module,
          canView: false,
          canAdd: false,
          canUpdate: false,
          canDelete: false,
        }));
        setModules(modulesData);
      } catch (error) {
        notification.error({
          message: 'Failed to fetch modules',
          description: error.message,
          duration: 3,
        });
      }
    };

    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`https://localhost:7290/api/Permissions?userId=${userId}`);
        const permissions = response.data;
        setModules(prevModules =>
          prevModules.map(module => ({
            ...module,
            ...permissions.find(p => p.moduleId === module.moduleId),
          }))
        );
      } catch (error) {
        notification.error({
          message: 'Failed to fetch permissions',
          description: error.message,
          duration: 3,
        });
      }
    };

    fetchModules();
    fetchPermissions();
  }, [notification, userId]);

  const handlePermissionChange = async (moduleId, permissionType, checked) => {
    const updatedModules = modules.map(module =>
      module.moduleId === moduleId ? { ...module, [permissionType]: checked } : module
    );
    setModules(updatedModules);

    try {
      await axios.put('https://localhost:7290/api/Permissions', { userId, modules: updatedModules });
      notification.success({
        message: 'Permissions updated successfully!',
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to update permissions',
        description: error.message,
        duration: 3,
      });
    }
  };

  const handleSelectAllChange = async (permissionType, checked) => {
    const updatedModules = modules.map(module => ({
      ...module,
      [permissionType]: checked,
    }));
    setModules(updatedModules);
    setSelectAll(prevState => ({ ...prevState, [permissionType]: checked }));

    try {
      await axios.put('https://localhost:7290/api/Permissions', { userId, modules: updatedModules });
      notification.success({
        message: 'Permissions updated successfully!',
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to update permissions',
        description: error.message,
        duration: 3,
      });
    }
  };

  const columns = [
    {
      title: 'Module',
      dataIndex: 'moduleName',
      key: 'moduleName',
    },
    {
      title: (
        <div>
          View <Switch checked={selectAll.canView} onChange={checked => handleSelectAllChange('canView', checked)} />
        </div>
      ),
      dataIndex: 'canView',
      key: 'canView',
      render: (text, record) => (
        <Switch
          checked={record.canView}
          onChange={checked => handlePermissionChange(record.moduleId, 'canView', checked)}
        />
      ),
    },
    {
      title: (
        <div>
          Add <Switch checked={selectAll.canAdd} onChange={checked => handleSelectAllChange('canAdd', checked)} />
        </div>
      ),
      dataIndex: 'canAdd',
      key: 'canAdd',
      render: (text, record) => (
        <Switch
          checked={record.canAdd}
          onChange={checked => handlePermissionChange(record.moduleId, 'canAdd', checked)}
        />
      ),
    },
    {
      title: (
        <div>
          Update <Switch checked={selectAll.canUpdate} onChange={checked => handleSelectAllChange('canUpdate', checked)} />
        </div>
      ),
      dataIndex: 'canUpdate',
      key: 'canUpdate',
      render: (text, record) => (
        <Switch
          checked={record.canUpdate}
          onChange={checked => handlePermissionChange(record.moduleId, 'canUpdate', checked)}
        />
      ),
    },
    {
      title: (
        <div>
          Delete <Switch checked={selectAll.canDelete} onChange={checked => handleSelectAllChange('canDelete', checked)} />
        </div>
      ),
      dataIndex: 'canDelete',
      key: 'canDelete',
      render: (text, record) => (
        <Switch
          checked={record.canDelete}
          onChange={checked => handlePermissionChange(record.moduleId, 'canDelete', checked)}
        />
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24} lg={16}>
        <Card>
          <Table
            columns={columns}
            dataSource={modules}
            rowKey="moduleId"
            pagination={false}
          />
        </Card>
      </Col>
    </Row>
  );
}
