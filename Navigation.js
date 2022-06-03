import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Settings from './Settings';
import TimeManager from './TimeManager';

const Stack = createStackNavigator();

const Navi = () => {
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name= "Settings" options={{
                    header: () => null
                }} component={Settings} />
                <Stack.Screen name= "TimeManager" options={{
                    header: () => null
                }} component={TimeManager} />
            </Stack.Navigator>
        </NavigationContainer>
        );
}

export default Navi;