import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Navi from './Navigation';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {default as theme} from './branding.json';
import { EvaIconPack } from '@ui-kitten/eva-icons';

export default function App() {
  return (
    <>
    {/* <IconRegistry icons={EvaIconPack} /> */}
    <ApplicationProvider {...eva} theme={{...eva.dark, ...theme}}>
    <Navi />
    </ApplicationProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
