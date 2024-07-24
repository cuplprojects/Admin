import { App, Button, Form, Input } from 'antd';
import { useState } from 'react';

import Card from '@/components/card';

const SecurityTab = () => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const initFormValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: 'New password and confirm password do not match!',
        duration: 3,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://localhost:7290/api/Login/ChangePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        notification.success({
          message: 'Update success!',
          duration: 3,
        });
      } else {
        notification.error({
          message: 'Update failed!',
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Update failed!',
        description: error.message,
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="!h-auto flex-col">
      <Form
        layout="vertical"
        initialValues={initFormValues}
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        className="w-full"
      >
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: 'Please input your old password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your new password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <div className="flex w-full justify-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Card>
  );
};
export default SecurityTab;
