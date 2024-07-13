import { Tabs, TabsProps } from 'antd';
import { Iconify } from '@/components/icon';
import PermissionTab from './permission';
import GeneralTab from './general-tab';

function UserAccount() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <div className="flex items-center">
          <Iconify icon="solar:user-id-bold" size={24} className="mr-2" />
          <span>General</span>
        </div>
      ),
      children: <GeneralTab />,
    },
    
    {
      key: '4', // Updated key to be unique
      label: (
        <div className="flex items-center">
          <Iconify icon="solar:key-minimalistic-square-3-bold-duotone" size={24} className="mr-2" />
          <span>Permission</span>
        </div>
      ),
      children: <PermissionTab />,
    }
  ];

  return <Tabs defaultActiveKey="1" items={items} />;
}

export default UserAccount;
