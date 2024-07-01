import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Input, Row, Select, notification, Modal, Popconfirm, Switch } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from '@/router/hooks';
import { Icon } from '@iconify/react';
// import editOutlined from '@iconify/icons-ant-design/edit-outlined';
// import deleteOutlined from '@iconify/icons-ant-design/delete-outlined';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

export default function GeneralTab() {
  const { push } = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    roleName: '',
    isActive: false,
  });

  const [userList, setUserList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {

        const [usersRes, rolesRes] = await Promise.all([
          axios.get('https://localhost:7290/api/Users?WhichDatabase=Local'),
          axios.get('https://localhost:7290/api/Roles?WhichDatabase=Local'),
        ]);

        const roleMap = rolesRes.data.reduce((acc, role) => {
          acc[role.roleId] = role.roleName;
          return acc;
        }, {});

        const usersWithRoleNames = usersRes.data.map(user => ({
          ...user,
          roleName: roleMap[user.roleId],
          isActive: user.isActive,
        }));

        setUserList(usersWithRoleNames);
        setRoles(rolesRes.data);

      } catch (error) {
        console.error('Error fetching users and roles:', error.message);
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

  const handleStatusChange = async (checked, userId) => {
    try {
      const user = userList.find(user => user.userId === userId);

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = { ...user, isActive: checked };

      await axios.put(`https://localhost:7290/api/Users/${userId}?WhichDatabase=Local`, updatedUser);
      
      setUserList((prev) =>
        prev.map((user) => (user.userId === userId ? { ...user, isActive: checked } : user))
      );

      notification.success({
        message: 'User status updated successfully!',
        duration: 3,
      });
    } catch (error) {
      console.error('Error updating user status:', error.message);
    }
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
        isActive: false,
      });
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users?WhichDatabase=Local');
      setUserList(res.data);
    } catch (error) {
      console.error('Error adding user:', error.message);
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
        isActive: false,
      });
      notification.success({
        message: 'User updated successfully!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users?WhichDatabase=Local');
      setUserList(res.data);
    } catch (error) {
      console.error('Error updating user:', error.message);
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
      isActive: false,
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
      console.error('Error deleting user:', error.message);
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
                  <th scope="col">Status</th>
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
                        <Input name="roleName" value={userData.roleName} onChange={handleChange} />
                      ) : (
                        user.roleName
                      )}
                    </td>
                    
                    
                    <td>
                      <Switch
                        checked={user.isActive}
                        onChange={(checked) => handleStatusChange(checked, user.userId)}
                      />
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <>
                          <Button type="primary" onClick={() => handleSave(user.userId)} style={{ marginRight: 8 }}>Save</Button>
                          <Button onClick={handleCancel}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button type="primary" icon={<Icon icon={EditOutlined} />} onClick={() => handleEdit(user)} />
                          <Popconfirm
                            title="Are you sure you want to delete this user?"
                            onConfirm={() => showDeleteConfirm(user.userId)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button danger icon={<Icon icon={DeleteOutlined} />} style={{ marginLeft: 8 }} />
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
