import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, Pressable} from 'react-native';
import { Layout, Text, Button, Divider} from '@ui-kitten/components';
import MobileCaching from './MobileCaching';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";

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
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalWorkingDays, setTotalWorkingDays] = useState(0);
    const [totalWorkingDaysLast, setTotalWorkingDaysLast] = useState(0);
    const [hourlyRate, setHourlyRate] = useState(0);
    const [isTimeInPickerVisible, setTimeInPickerVisibility] = useState(false);
    const [isTimeOutPickerVisible, setTimeOutPickerVisibility] = useState(false);
    
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
        
        let per_hour_rate = parseFloat(config.rate) / (totalWorkingDays * 8);
        let hours = (total_duration / 60);
        let rhours = Math.floor(hours);
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        
        let temp_salary = hours * per_hour_rate;
        
        setTotalHours(rhours);
        setTotalMinutes(rminutes);
        setHourlyRate(per_hour_rate);
        setCurrentHalfSalary(currencyFormat(temp_salary))
    }

    useEffect(()=> {
        let startOfMonth = moment(moment().startOf('month').format('YYYY-MM-DD hh:mm'));
        let endOfMonth = moment(moment().format("YYYY-MM-15"));
        let startSecondHalf = moment(moment().format("YYYY-MM-16"));
        let endSecondHalf = moment(moment().endOf('month').format('YYYY-MM-DD'));;
        let temp = 0;
        if (15 > parseInt(moment().format("DD"))) {
            temp = workday_count(startOfMonth, endOfMonth);
        } else {
            temp = workday_count(startSecondHalf, endSecondHalf);
        }
        let overallWorkingHours = workday_count(startOfMonth, endOfMonth) + workday_count(startSecondHalf, endSecondHalf);
        setTotalWorkingDays(overallWorkingHours);
        
    }, []);

    const currencyFormat = (num) => {
        return '₱ ' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const recalculateSalary = (time_collection) => {
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
                    console.log(merged)
                }
            });
        }
    }, [currentSession]);

    const currentTimeInOut = [currentSession];
    
    const showTimeInPicker = () => {
        setTimeInPickerVisibility(true);
      };
    const hideTimePicker = () => {
        setTimeInPickerVisibility(false);
        setTimeOutPickerVisibility(false);
      };
    const showTimeOutPicker = () => {
        setTimeOutPickerVisibility(true);
      };

    const handleConfirm = (time) => {
        switch (time){
            case "timeIn":
                setCurrentSession ({
                    in: format("YYYY-MM-DD hh:mm:ss"),
                })
                break;
            case "timeOut":
                setCurrentSession ({
                    ...currentSession,
                    out: format("YYYY-MM-DD hh:mm:ss"),
                });
                break;
            default:
                break;
        }
        hideTimePicker();
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.notch} />
                <Layout style={styles.layout}>
                    <Text category= "p1">Current date: {moment().format("LL")}</Text>
                    <Text category= "p1">Rate: {config == null ? "XXX,XXX.XX" : currencyFormat(config.rate)}</Text>
                    <Text category= "p1">Deductions:</Text>
                    <Text category= "p1" style={{paddingLeft: 50}}>SSS: {config == null ? "XXX,XXX.XX" : currencyFormat(config.sss)}</Text>
                    <Text category= "p1" style={{paddingLeft: 50}}>Philhealth: {config == null ? "XXX,XXX.XX" : currencyFormat(config.philhealth)}</Text>
                    <Text category= "p1" style={{paddingBottom: 10, paddingLeft: 50}}>Tax 5%: {config == null ? "XXX,XXX.XX" : currencyFormat(config.tax)}</Text>
                    <Divider style={{marginBottom:5, marginTop:5}}/>
                    <Text category= "p1">Net 15th-day Salary: {config == null ? "XXX,XXX.XX" : currencyFormat(firstHalf)}</Text>
                    <Text category= "p1">Net 30th-day Salary: {config == null ? "XXX,XXX.XX" : currencyFormat(secondHalf)}</Text>
                    <Text category= "p1">Per hour rate: {currencyFormat(hourlyRate)}</Text>
                </Layout>
                <Layout style={{flex: 2.5, padding: 10}}>
                    <View style={{padding: 10}}>
                        <Button status="success" style={{height: 80}} disabled={!timeInEnabled} onPress={()=> {
                            toggleTime('in')}}>
                            <Text>Time in</Text>
                        </Button>
                    </View>
                <View style={{padding: 10}}>
                    <Button status="danger" style={{height: 80}} disabled={!timeOutEnabled} onPress={()=> {
                        toggleTime('out')}}>
                            <Text>Time out</Text>
                    </Button>
                </View>
                <Text category= "p1" style={{padding: 20, textAlign: 'center'}}>{
                    15 >= parseInt(moment(new Date).format("DD")) ? 
                    `As of ${timeClock} ${`\n`} Your gross salary for the first half of ${CURRENT_MONTH} is ${(currentHalfSalary)} PHP`
                    :
                    `As of ${timeClock} ${`\n`} Your gross salary for the second half of ${CURRENT_MONTH} is ${(currentHalfSalary)} PHP`
                }</Text>
                <Text category= "p1">Total time rendered: {totalHours} hour/s and {totalMinutes} minutes</Text>
                <View style={{textAlign:'center'}}>
                <FlatList
                    data={currentTimeInOut}
                    renderItem={({item, index}) =><Text key={`k-${index}`}>Your latest time-in is {item.in}</Text>}
                    keyExtractor={(item) => item.in}>
                </FlatList>
                </View>
                <View>
                <FlatList
                    data={currentTimeInOut}
                    renderItem={({item, index}) =><Text key={index}>Your latest time-out is {item.out}</Text>}
                    keyExtractor={(item) => item.out}>
                </FlatList>
                </View>
                <Divider style={{marginBottom:10, marginTop:10}}/>
                <View style={{flexDirection: "row", paddingTop: 10, justifyContent: "center"}}>

                    <Pressable style={{paddingRight: 10}} onPress={showTimeInPicker}>
                        <Text style={{textDecorationLine: 'underline'}}>Input time-in manually</Text>
                    </Pressable>
                    <DateTimePickerModal
                        isVisible={isTimeInPickerVisible}
                        mode="datetime"
                        onConfirm={()=> {handleConfirm('timeIn')}}
                        onCancel={hideTimePicker}/>

                    <Divider style={{width: 1, height: '100%'}}/>

                    <Pressable style={{paddingLeft: 10}} onPress={showTimeOutPicker}>
                        <Text style={{textDecorationLine: 'underline'}}>Input time-out manually</Text>
                    </Pressable>
                    <DateTimePickerModal
                        isVisible={isTimeOutPickerVisible}
                        mode="datetime"
                        onConfirm={()=> {handleConfirm('timeOut')}}
                        onCancel={hideTimePicker}/>
                </View>
            </Layout>
        </View>
    )
};

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