import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

LogBox.ignoreLogs([
	'ProgressBarAndroid has been extracted from react-native core',
	'SafeAreaView has been deprecated',
	'Clipboard has been extracted from react-native core',
	'InteractionManager has been deprecated',
	'PushNotificationIOS has been extracted from react-native core',
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
