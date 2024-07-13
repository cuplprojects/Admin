// RoleModal.tsx

import { Form, Modal, Input, InputNumber, Radio, Tree } from 'antd';
import { useEffect } from 'react';

import { PERMISSION_LIST } from '@/_mock/assets';
import { flattenTrees } from '@/utils/tree';

import { Permission, Role } from '#/entity';
import { BasicStatus } from '#/enum';

export type RoleModalProps = {
  formValue: Role;
  title: string;
  show: boolean;
  onOk: (role: Role) => void; // Receive onOk function with role parameter
  onCancel: VoidFunction;
};

const PERMISSIONS: Permission[] = PERMISSION_LIST;

const RoleModal: React.FC<RoleModalProps> = ({ title, show, formValue, onOk, onCancel }) => {
  const [form] = Form.useForm();

  const flattenedPermissions = flattenTrees(formValue.permission);
  const checkedKeys = flattenedPermissions.map((item) => item.id);

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedRole: Role = {
          ...formValue,
          ...values,
        };
        onOk(updatedRole); // Call onOk with updated role
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  return (
    <Modal title={title} visible={show} onOk={handleOk} onCancel={onCancel}>
      <Form form={form} initialValues={formValue} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Label" name="label" rules={[{ required: true, message: 'Please enter label' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Order" name="order">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status' }]}>
          <Radio.Group>
            <Radio value={BasicStatus.ENABLE}>Enable</Radio>
            <Radio value={BasicStatus.DISABLE}>Disable</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Description" name="desc">
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Permission" name="permission">
          <Tree
            checkable
            checkedKeys={checkedKeys}
            treeData={PERMISSIONS}
            fieldNames={{ key: 'id', children: 'children', title: 'name' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
