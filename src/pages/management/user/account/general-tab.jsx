import { App, Button, Col, Form, Input, Row, Space, Switch, Select } from 'antd';
import Card from '@/components/card';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function GeneralTab() {
  const { notification } = App.useApp();

  // Initialize userData with valid initial values
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get('https://localhost:7290/api/Roles'); // Adjust the API endpoint as needed
        setRoles(res.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setUserData((prev) => ({ ...prev, roleId: value }));
  };

  // submit user 
  const handleSubmit = async () => {
    try {
      await axios.post("https://localhost:7290/api/Users1", userData);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
      });
      notification.success({
        message: 'Update success!',
        duration: 3,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24} lg={8}>
        <Card className="flex-col !px-6 !pb-10 !pt-20">
          <Space className="py-6">
            <div>Public Profile</div>
            <Switch size="small" />
          </Space>
          <Button type="primary" danger>
            Delete User
          </Button>
        </Card>
      </Col>
      <Col span={24} lg={16}>
        <Card>
          <Form
            layout="vertical"
            initialValues={userData} // Set initialValues to populate the form
            labelCol={{ span: 8 }}
            className="w-full"
            onFinish={handleSubmit} // Added onFinish event handler
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: 'Please enter your first name!' },
                  ]}
                >
                  <Input
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true, message: 'Please enter your last name!' },
                  ]}
                >
                  <Input
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                  ]}
                >
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="roleId"
                  rules={[
                    { required: true, message: 'Please select a role!' },
                  ]}
                >
                  <Select
                    value={userData.roleId}
                    onChange={handleRoleChange}
                  >
                    {roles.map((role) => (
                      <Select.Option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex w-full justify-end">
              <Button type="primary" htmlType="submit">
                ADD
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
