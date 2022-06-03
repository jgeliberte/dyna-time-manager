import React, { useEffect, useState } from 'react';
import {View, StyleSheet} from 'react-native';
import { Layout, Input, Text, Button} from '@ui-kitten/components';
import MobileCaching from './MobileCaching';
import moment from 'moment';

const TimeManager = () => {
    const [config, setConfig] = useState(null);
    const [timeInEnabled, setTimeInEnabled] = useState(true);
    const [timeOutEnabled, setTimeOutEnabled] = useState(true);
    const [currentSession, setCurrentSession] = useState({});
    const [sessionContainer, setSessionContainer] = useState([]);
    const [timeClock, setTimeClock] = useState([moment().format("YYYY-MM-DD hh:mm:ss")]);
    
    
    useEffect (() => {
        MobileCaching.getItem('config').then(response => {
            setConfig(response);})
        }, []);

    const currencyFormat = (num) => {
        return '₱ ' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const toggleTime = (type) => {
        switch(type){
            case "in":
                setTimeInEnabled (false);
                setTimeOutEnabled (true);
                setCurrentSession ({
                    in: moment().format("YYYY-MM-DD hh:mm:ss"),
                });
                break;
            case "out":
                setTimeInEnabled (true);
                setTimeOutEnabled (false);
                setCurrentSession ({
                    ...currentSession,
                    out: moment().format("YYYY-MM-DD hh:mm:ss"),
                });
                break;
            default:
                break;
        }
    }

    useEffect (() => {
        if ('in' in currentSession && 'out' in currentSession){
            let current_month = moment().format('MMMM');
            MobileCaching.getItem(current_month).then(response =>{
                if (response == null || response.length == 0) {
                    MobileCaching.setItem(current_month, [currentSession]);
                } else {
                    let merged = [...response, currentSession];
                    MobileCaching.setItem(current_month, merged)
                }
            });
        }
    }, [currentSession]);

    useEffect (() => {
        let current_month = moment().format('MMMM');
        MobileCaching.getItem(current_month).then(response =>{
                console.log("response:", response);
            });
        }, []);

    return (
        <View style={{flex: 1}}>
            <View style={styles.notch} />
                <Layout style={styles.layout}>
                    <Text category= "p1">Current date: {moment().format("LL")}</Text>
                    <Text category= "p1">Rate: {config == null ? "XXX,XXX.XX" : currencyFormat(config.rate)}</Text>
                    <Text category= "p1">Deductions</Text>
                    <Text category= "p1" style={{paddingLeft: 50}}>SSS: {config == null ? "XXX,XXX.XX" : currencyFormat(config.sss)}</Text>
                    <Text category= "p1" style={{paddingLeft: 50}}>Philhealth: {config == null ? "XXX,XXX.XX" : currencyFormat(config.philhealth)}</Text>
                    <Text category= "p1">Tax 5%: {config == null ? "XXX,XXX.XX" : currencyFormat(config.tax)}</Text>
                </Layout>
            <Layout style={{flex: 3, padding: 20}}>
                <View style={{padding: 10}}>
                    <Button status="success" style={{height: 100}} disabled={!timeInEnabled} onPress={()=> {
                        toggleTime('in')}}>
                            <Text>Time in</Text>
                    </Button>
                </View>
                <View style={{padding: 10}}>
                    <Button status="danger" style={{height: 100}} disabled={!timeOutEnabled} onPress={()=> {
                        toggleTime('out')}}>
                            <Text>Time out</Text>
                    </Button>
                </View>
                <Text category= "p1" style={{padding: 20, textAlign: 'center'}}>As of {timeClock}, your salary is PHP XXXXXX</Text>
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
});

export default TimeManager;