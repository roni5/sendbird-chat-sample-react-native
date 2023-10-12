import {FlatList, TouchableOpacity} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {Text, useAlert} from '@sendbird/uikit-react-native-foundation';
import {User} from '@sendbird/chat';
import {Routes, useAppNavigation} from '../libs/navigation';
import {logger} from '../libs/logger';
import UserCell from '../components/UserCell';
import {GroupChannel} from '@sendbird/chat/groupChannel';

const GroupChannelInviteScreen = () => {
  const {sdk} = useRootContext();
  const {navigation, params} = useAppNavigation();

  const [query] = useState(() => sdk.createApplicationUserListQuery());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [channel, setChannel] = useState<GroupChannel>();

  useHeaderButtons(selectedUsers, channel);

  useEffect(() => {
    const initialFetch = async () => {
      if (!params?.channelUrl) {
        navigation.goBack();
      } else {
        const channel = await sdk.groupChannel.getChannel(params.channelUrl);
        setChannel(channel);

        if (query.hasNext) {
          const initialUsers = await query.next();
          setUsers(initialUsers);
        }
      }
    };

    initialFetch();
  }, []);

  const keyExtractor = (item: User) => item.userId;
  const onPressUserCell = (user: User) => {
    setSelectedUsers(([...draft]) => {
      const index = draft.indexOf(user);
      if (index > -1) {
        draft.splice(index, 1);
      } else {
        draft.push(user);
      }
      return draft;
    });
  };
  const renderItem = ({item}: {item: User}) => {
    if (!channel) return null;

    return (
      <UserCell
        onPress={onPressUserCell}
        user={item}
        selected={selectedUsers.indexOf(item) > -1 || channel.members.findIndex(it => it.userId === item.userId) > -1}
        me={item.userId === sdk.currentUser?.userId}
      />
    );
  };
  const onLoadMoreUsers = async () => {
    if (query.hasNext) {
      const fetchedUsers = await query.next();
      setUsers(prev => [...prev, ...fetchedUsers]);
    }
  };

  return <FlatList data={users} keyExtractor={keyExtractor} renderItem={renderItem} onEndReached={onLoadMoreUsers} />;
};

const useHeaderButtons = (selectedUsers: User[], channel?: GroupChannel) => {
  const {navigation} = useAppNavigation();
  const {alert} = useAlert();

  useLayoutEffect(() => {
    const onPressInviteUsers = async () => {
      logger.log('GroupChannelInviteScreen:', `invite ${selectedUsers.length} users`);

      if (selectedUsers.length > 0 && channel) {
        await channel.invite(selectedUsers);

        navigation.navigate(Routes.GroupChannel, {channelUrl: channel.url});
      } else {
        alert({
          title: 'No users selected',
          message: 'Please select at least one user to invite.',
        });
      }
    };

    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onPressInviteUsers}>
            <Text button>{'Invite'}</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [selectedUsers.length]);
};

export default GroupChannelInviteScreen;
