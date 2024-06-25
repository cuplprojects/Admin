import { Button, Col, Form, Input, Row, Select, notification, Modal, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from '@/router/hooks';
import { Icon } from '@iconify/react';
import editOutlined from '@iconify/icons-ant-design/edit-outlined';
import deleteOutlined from '@iconify/icons-ant-design/delete-outlined';

export default function GeneralTab() {
  const { push } = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    roleName: '',
  });

  const [userList, setUserList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
       axios.get('https://localhost:7290/api/Users?WhichDatabase=Local')
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchUsersAndRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    const selectedRole = roles.find(role => role.roleId === value);
    setUserData((prev) => ({ ...prev, roleId: value, roleName: selectedRole?.roleName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7290/api/Users?WhichDatabase=Local', userData);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
        roleName: '',
      });
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users?WhichDatabase=Local');
      setUserList(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.userId);
    setUserData(user);
  };

  const handleSave = async (userId) => {
    try {
      await axios.put(`https://localhost:7290/api/Users/${userId}?WhichDatabase=Local`, userData);
      setEditingUserId(null);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
        roleName: '',
      });
      notification.success({
        message: 'User updated successfully!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users?WhichDatabase=Local');
      setUserList(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setUserData({
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      roleName: '',
    });
  };

  const showDeleteConfirm = (userId) => {
    setUserIdToDelete(userId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7290/api/Users/${userIdToDelete}?WhichDatabase=Local`);
      notification.success({
        message: 'User deleted successfully!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users?WhichDatabase=Local');
      setUserList(res.data);
      setDeleteModalVisible(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  return (
    <Row>
      <Col span={24}>
        <Col span={24} style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <Button type="primary" onClick={() => push('/management/user/AddUser')}>Add User</Button>
        </Col>
        <div className="card">
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">SN.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr key={user.userId}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="firstName" value={userData.firstName} onChange={handleChange} />
                      ) : (
                        user.firstName
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="lastName" value={userData.lastName} onChange={handleChange} />
                      ) : (
                        user.lastName
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="email" value={userData.email} onChange={handleChange} />
                      ) : (
                        user.email
                      )}
                    </td>
                    
                    <td>
                      {editingUserId === user.userId ? (
                        <Select
                          value={userData.roleId}
                          onChange={handleRoleChange}
                          style={{ width: 120 }}
                        >
                          {roles.map((role) => (
                            <Select.Option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        user.roleName
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <>
                          <Popconfirm
                            title="Are you sure you want to save changes?"
                            onConfirm={() => handleSave(user.userId)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="primary">Save</Button>
                          </Popconfirm>
                          <Button danger onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button type="primary" icon={<Icon icon={editOutlined} />} onClick={() => handleEdit(user)} />
                          <Popconfirm
                            title="Are you sure you want to delete this user?"
                            onConfirm={() => showDeleteConfirm(user.userId)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button danger icon={<Icon icon={deleteOutlined} />} style={{ marginLeft: 8 }} />
                          </Popconfirm>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Col>
      <Modal
        title="Confirm Deletion"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Yes, Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </Row>
  );
}
