import {useRootContext} from '../contexts/RootContext';
import {ScrollView} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  useUIKitTheme,
} from '@sendbird/uikit-react-native-foundation';
import React, {useState} from 'react';

const ConnectScreen = () => {
  const {sdk, setUser} = useRootContext();
  const {colors} = useUIKitTheme();

  const [state, setState] = useState({
    id: '',
    accessToken: '',
  });

  const signIn = async () => {
    const user = await sdk.connect(state.id);
    setUser(user);
  };

  return (
    <ScrollView contentContainerStyle={{padding: 24}}>
      <Text caption3 color={colors.onBackground02}>
        {'User ID'}
      </Text>
      <TextInput
        placeholder={'Required'}
        value={state.id}
        onChangeText={id => setState(prev => ({...prev, id}))}
        style={{marginBottom: 12}}
      />
      <Text caption3 color={colors.onBackground02}>
        {'Access token'}
      </Text>
      <TextInput
        placeholder={'Optional'}
        value={state.accessToken}
        onChangeText={accessToken => setState(prev => ({...prev, accessToken}))}
        style={{marginBottom: 12}}
      />
      <Button onPress={signIn}>{'Connect'}</Button>
    </ScrollView>
  );
};

export default ConnectScreen;
