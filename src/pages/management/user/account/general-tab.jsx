import { App, Button, Col, Form, Input, Row, Space, Switch, Select } from 'antd';
import Card from '@/components/card';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function GeneralTab() {
  const { notification } = App.useApp();
  const [form] = Form.useForm(); // Create form instance

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get('https://localhost:7290/api/Roles?WhichDatabase=Local'); // Adjust the API endpoint as needed
        setRoles(res.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (values) => {
    try {
      await axios.post("https://localhost:7290/api/Users?WhichDatabase=Local", values);
      form.resetFields(); // Reset form fields
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {/* <Col span={24} lg={8}>
        <Card className="flex-col !px-6 !pb-10 !pt-20">
          <Space className="py-6">
            <div>Public Profile</div>
            <Switch size="small" />
          </Space>
          <Button type="primary" danger>
            Delete User
          </Button>
        </Card>
      </Col> */}
      <Col span={24} lg={16}>
        <Card>
          <Form
            form={form} // Attach the form instance
            layout="vertical"
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              roleId: '',
              isActive: true
            }} // Set initialValues to populate the form
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
                  <Input />
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
                  <Input />
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
                  <Input />
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
                  <Select>
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
