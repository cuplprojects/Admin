import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Radio } from 'antd';
import PermissionTree from './PermissionTree';

const RoleModal = ({ visible, title, role, permissions, onOk, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(role);
    } else {
      form.resetFields();
    }
  }, [visible, role, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedRole = {
        ...role,
        ...values,
      };
      onOk(updatedRole);
    } catch (error) {
      console.error('Validation Error:', error);
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      afterClose={() => form.resetFields()} // Reset form when modal is closed
    >
      <Form
        form={form}
        initialValues={role}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="Name"
          name="roleName"
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true, message: 'Please enter label' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Order" name="order">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Radio.Group>
            <Radio value="ENABLE">Enable</Radio>
            <Radio value="DISABLE">Disable</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Desc" name="desc">
          <Input.TextArea />
        </Form.Item>
        {permissions && permissions.length > 0 && (
          <Form.Item label="Permissions">
            <PermissionTree permissions={permissions} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default RoleModal;
