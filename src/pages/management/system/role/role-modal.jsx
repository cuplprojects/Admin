import React, { useEffect, useState } from 'react';
import { Form, Modal, Input, InputNumber, Radio, Tree, message } from 'antd';
import { flattenTrees } from '@/utils/tree';
import { BasicStatus, PermissionType } from '#/enum';
import { PERMISSION_LIST } from '@/_mock/assets';

// const PERMISSIONS = [
//   {
//     id: '1',
//     parentId: '',
//     label: 'sys.menu.management',
//     name: 'Management',
//     icon: 'ic-management',
//     type: PermissionType.CATALOGUE,
//     route: 'management',
//     order: 2,
//     children: [
//       {
//         id: '1.1',
//         parentId: '1',
//         label: 'sys.menu.user.index',
//         name: 'User',
//         type: PermissionType.CATALOGUE,
//         route: 'user',
//         children: [
//           {
//             id: '1.1.1',
//             parentId: '1.1',
//             label: 'sys.menu.user.AddUser',
//             name: 'AddUser',
//             type: PermissionType.MENU,
//             route: 'AddUser',
//             component: '/management/user/account/index.tsx',
//           },
//         ],
//       },
//       {
//         id: '1.2',
//         parentId: '1',
//         label: 'sys.menu.system.index',
//         name: 'System',
//         type: PermissionType.CATALOGUE,
//         route: 'system',
//         children: [
//           {
//             id: '1.2.1',
//             parentId: '1.2',
//             label: 'sys.menu.system.permission',
//             name: 'Permission',
//             type: PermissionType.MENU,
//             route: 'permission',
//             component: '/management/system/permission/index.tsx',
//           },
//           {
//             id: '1.2.2',
//             parentId: '1.2',
//             label: 'sys.menu.system.role',
//             name: 'Role',
//             type: PermissionType.MENU,
//             route: 'role',
//             component: '/management/system/role/index.tsx',
//           },
//           {
//             id: '1.2.3',
//             parentId: '1.2',
//             label: 'sys.menu.user.allusers',
//             name: 'allusers',
//             type: PermissionType.MENU,
//             route: 'allusers',
//             component: '/management/system/user/index.tsx',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: '2',
//     parentId: '',
//     label: 'sys.menu.another.management',
//     name: 'Another Management',
//     icon: 'ic-another-management',
//     type: PermissionType.CATALOGUE,
//     route: 'another-management',
//     order: 3,
//     children: [
//       {
//         id: '2.1',
//         parentId: '2',
//         label: 'sys.menu.another.user.index',
//         name: 'Another User',
//         type: PermissionType.CATALOGUE,
//         route: 'another-user',
//         children: [
//           {
//             id: '2.1.1',
//             parentId: '2.1',
//             label: 'sys.menu.another.user.AddUser',
//             name: 'Another AddUser',
//             type: PermissionType.MENU,
//             route: 'another-AddUser',
//             component: '/another-management/user/account/index.tsx',
//           },
//         ],
//       },
//     ],
//   },
// ];
const PERMISSIONS = PERMISSION_LIST

const RoleModal = ({ title, show, formValue, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
    // Automatically check permissions based on formValue.permission
    const initialCheckedKeys = flattenTrees(PERMISSIONS, 'children')
      .filter((permission) => formValue.permission.includes(permission.id))
      .map((permission) => permission.id);
    setCheckedKeys(initialCheckedKeys);
  }, [formValue, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Merge form values with checkedKeys (permissions)
        const updatedRole = {
          ...values,
          permission: checkedKeys,
        };
        
        // Call onOk with updated role
        onOk(updatedRole)
          .then(() => {
            message.success('Role saved successfully');
          })
          .catch((error) => {
            message.error('Failed to save role');
            console.error('Error saving role:', error);
          });
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const onTreeCheck = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue);
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
            onCheck={onTreeCheck}
            treeData={PERMISSIONS}
            fieldNames={{ key: 'id', children: 'children', title: 'name' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
