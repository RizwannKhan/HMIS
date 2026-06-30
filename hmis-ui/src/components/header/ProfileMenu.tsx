import { Menu, Button, Text, Avatar } from '@mantine/core';
import { GearSixIcon, MagnifyingGlassIcon, ImageIcon, ChatCircleIcon, TrashIcon, ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ProfileMenu = () => {
  const user = useSelector((state: any) => state.user);
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <div className="flex items-center gap-2 cursor-pointer">
          <span className='font-medium text-lg text-green-900'>{user.name}</span>
          <Avatar variant='filled' src="/Avatar.png" size={'45'} alt="Profile" />
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item leftSection={<GearSixIcon size={14} />}>
          Settings
        </Menu.Item>
        <Menu.Item leftSection={<ChatCircleIcon size={14} />}>
          Messages
        </Menu.Item>
        <Menu.Item leftSection={<ImageIcon size={14} />}>
          Gallery
        </Menu.Item>
        <Menu.Item
          leftSection={<MagnifyingGlassIcon size={14} />}
          rightSection={
            <Text size="xs" c="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          leftSection={<ArrowsLeftRightIcon size={14} />}
        >
          Transfer my data
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<TrashIcon size={14} />}
        >
          Delete my account
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default ProfileMenu;