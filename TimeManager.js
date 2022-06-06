import React, { useEffect, useState } from 'react';
import {View, StyleSheet} from 'react-native';
import { Layout, Input, Text, Button} from '@ui-kitten/components';
import MobileCaching from './MobileCaching';
import moment from 'moment';

const TimeManager = () => {
    const CURRENT_MONTH = moment().format('MMMM');

    const [config, setConfig] = useState(null);
    const [timeInEnabled, setTimeInEnabled] = useState(true);
    const [timeOutEnabled, setTimeOutEnabled] = useState(true);
    const [currentSession, setCurrentSession] = useState({});
    const [sessionContainer, setSessionContainer] = useState([]);
    const [timeClock, setTimeClock] = useState(moment().format("YYYY-MM-DD hh:mm:ss"));
    const [currentHalfSalary, setCurrentHalfSalary] = useState(0);
    const [firstHalf, setFirstHalf] = useState(0);
    const [secondHalf, setSecondHalf] = useState(0);
    const [totalHours, setTotalHours] = useState(0);
    const [totalWorkingDays, setTotalWorkingDays] = useState(0);
    const [totalWorkingDaysLast, setTotalWorkingDaysLast] = useState(0);
    
    useEffect (() => {
        MobileCaching.getItem('config').then(response => {
            setConfig(response);})
        }, []);

    useEffect(()=> {
        setInterval(()=> {
            setTimeClock(moment().format("YYYY-MM-DD hh:mm:ss"));
        }, 1000)
    }, []);

    useEffect(() => {
        if (config) {
            setFirstHalf(((parseFloat(config.rate)/2) - (parseFloat(config.tax)/2)) - (parseFloat(config.sss) + parseFloat(config.philhealth)));
            setSecondHalf(((parseFloat(config.rate)/2) - (parseFloat(config.tax)/2)));
        }
    }, [config]);

    const workday_count = (start,end) => {
        var first = start.clone().endOf('week');
        var last = end.clone().startOf('week');
        var days = last.diff(first,'days') * 5 / 7;
        var wfirst = first.day() - start.day();
        if(start.day() == 0) --wfirst;
        var wlast = end.day() - last.day();
        if(end.day() == 6) --wlast;
        return wfirst + Math.floor(days) + wlast;
      }

    const updateCurrentSalary = (total_duration) => {
        setTotalHours(total_duration);
        let per_hour_rate = (parseFloat(firstHalf) + parseFloat(secondHalf)) / (totalWorkingDays*8);
        let hours = (total_duration / 60);
        let rhours = Math.floor(hours);
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);

        let temp_salary = rhours * per_hour_rate;
        setCurrentHalfSalary(currencyFormat(temp_salary))
    }

    useEffect(()=> {
        let startOfMonth = moment(moment().format("YYYY-MM-01"));
        let endOfMonth = moment(moment().format("YYYY-MM-15"));
        let startSecondHalf = moment(moment().format("YYYY-MM-16"));
        let endSecondHalf = moment(moment().format("YYYY-MM-") + moment().daysInMonth());
        let temp = 0;
        if (15 >= parseInt(moment().format("DD"))) {
            temp = workday_count(startOfMonth, endOfMonth);
        } else {
            temp = workday_count(startSecondHalf, endSecondHalf);
        }
        setTotalWorkingDays(temp);
    }, []);

    const currencyFormat = (num) => {
        return '₱ ' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const recalculateSalary = (time_collection) => {
        console.log("\n\n\n")
        let total_duration = null;
        time_collection.forEach(element => {
            if (element.month === CURRENT_MONTH) {
                let duration = moment.duration(moment(element.out).diff(moment(element.in)));
                if (total_duration == null) {
                    total_duration = parseInt(duration.asMinutes());
                } else {
                    total_duration += parseInt(duration.asMinutes());
                }
            }
        });

        updateCurrentSalary(total_duration.toFixed(0));
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
            MobileCaching.getItem(CURRENT_MONTH).then(response =>{
                if (response == null || response.length == 0) {
                    MobileCaching.setItem(CURRENT_MONTH, [{...currentSession, month: CURRENT_MONTH}]);
                } else {
                    let merged = [...response, {
                        ...currentSession,
                        month: CURRENT_MONTH
                    }];
                    MobileCaching.setItem(CURRENT_MONTH, merged)
                    recalculateSalary(merged);
                }
            });
        }
    }, [currentSession]);

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
                    <Text category= "p1">Net 15th-day Salary: {config == null ? "XXX,XXX.XX" : currencyFormat(firstHalf)}</Text>
                    <Text category= "p1">Net 30th-day Salary: {config == null ? "XXX,XXX.XX" : currencyFormat(secondHalf)}</Text>
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
                {/* As of {timeClock}, your salary is PHP XXXXXX */}
                <Text category= "p1" style={{padding: 20, textAlign: 'center'}}>{
                    15 >= parseInt(moment(new Date).format("DD")) ? 
                    `As of ${timeClock} ${`\n`} Your salary for the FIRST HALF of the month is PHP ${currencyFormat(currentHalfSalary)}`
                    :
                    `As of ${timeClock} ${`\n`} Your salary for the SECOND HALF of the month is PHP ${currencyFormat(currentHalfSalary)}`
                }</Text>
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