import { USER_LIST } from '@/_mock/assets';
import Card from '@/components/card';
import { useParams } from '@/router/hooks';

const USERS = USER_LIST;

export default function UserDetail() {
  const { id } = useParams();
  const user = USERS.find((user) => user.id === id);
  return (
    <Card>
      <p>This is the detail page for user {user?.username}</p>
    </Card>
  );
}
