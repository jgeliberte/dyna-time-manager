import React, { useState, useEffect } from 'react';
import { View, StyleSheet} from 'react-native';
import { Layout, Text, Input, Button, RangeDatepicker} from '@ui-kitten/components';
import MobileCaching from './MobileCaching';

const Settings = (props) => {
    const [rate, setRate] = useState("");
    const [sss, setSss] = useState("");
    const [philhealth, setPhilhealth] = useState("");

    useEffect (() => {
        MobileCaching.getItem('config').then(response => {
            if (response != null){
                props.navigation.navigate('TimeManager');
            }
        })
    }, []);

    return (
        <View style={{flex: 1}}>
            <View style={styles.notch} />
            <Layout style={styles.layout}>
                <Input
                    style={styles.input}
                    placeholder = 'E.G. 56,600'
                    value={rate}
                    label = {evaProps => <Text {...evaProps}>Rate</Text>}
                    caption={evaProps => <Text {...evaProps}>Required</Text>}
                    onChangeText={(e)=> setRate(e)}
                />
                <Input
                    style={styles.input}
                    placeholder = 'E.G. 1140.50'
                    value={sss}
                    label = {evaProps => <Text {...evaProps}>Philhealth</Text>}
                    caption={evaProps => <Text {...evaProps}>Required</Text>}
                    onChangeText={(e)=> setSss(e)}
                />
                <Input
                    style={styles.input}
                    placeholder = 'E.G. 660'
                    value={philhealth}
                    label = {evaProps => <Text {...evaProps}>SSS</Text>}
                    caption={evaProps => <Text {...evaProps}>Required</Text>}
                    onChangeText={(e)=> setPhilhealth(e)}
                />
                <Text category= "p1" style={{textAlign: 'center'}}>5% tax will be automatically deducted</Text>
                <Button status='info' style={{marginTop:10}} onPress={() => {
                    let  tax = parseFloat(parseInt(rate) * 0.05);
                    let config = {
                        tax: parseFloat(tax),
                        sss: parseFloat(sss),
                        philhealth: parseFloat(philhealth),
                        rate: parseFloat(rate)
                    }
                    MobileCaching.setItem('config', config);
                    props.navigation.navigate('TimeManager');
                }}>
                    <Text>Confirm</Text>
                </Button>
                <Button status='warning'style={{marginTop:10}} onPress={() => {
                    setRate("");
                    setSss("");
                    setPhilhealth("");
                }}>
                    <Text>Reset</Text>
                </Button>
            </Layout>
        </View>
        )
}

const styles = StyleSheet.create({
        notch: {
            backgroundColor: '#b7b7b7',
            padding: 25
        },
        layout: {
            flex: 1,
            padding: 20
        },
        input: {
            padding: 20,
            margin: 0,
            textAlign: 'center'
        },
});

export default Settings;