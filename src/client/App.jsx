import React from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import moment from 'moment';
import Calendar from 'react-calendar';

const API = '/api?query=getLog';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logs: [],
            value: '',
            selectedDate: '',
            valueRangeTime: '',
            countMessage: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.calendarChange = this.calendarChange.bind(this);
        this.changeRangeTime = this.changeRangeTime.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    calendarChange(date) {
        this.setState({ selectedDate: date });
    }

    changeRangeTime(event) {
        this.setState({ valueRangeTime: event.target.value });
    }

    componentDidMount() {
        fetch(API)
            .then(response => response.json())
            .then(data => this.setState({ logs: data.response.data }));
    }

    renderData(logs) {
        // const groupedUser = _.filter(logs, [ userId: userIdVariable]); Для фильтра по userId
        let defaultData = logs;

        // let countDates = logs.reduce((acc, el) => {
        //     acc[el] = (acc[el] || 0) + 1;
        //     return acc;
        // }, {});

        if (this.state.value) {
            defaultData = _.filter(defaultData, { _id: this.state.value });
        }

        if (this.state.selectedDate) {
            defaultData = _.filter(defaultData, item =>
                moment(item.date).isBetween(moment(this.state.selectedDate[0]), moment(this.state.selectedDate[1])),
            );
            console.log(defaultData);
        }

        if (this.state.valueRangeTime) {
            defaultData = _.filter(defaultData, item => moment(item.date));
            console.log(defaultData);
        }

        const groupedData = _.groupBy(defaultData, item => moment(item.date).format('DD.MM.YY'));
        const labels = _.keys(groupedData).sort();
        let data = [];
        labels.forEach(key => data.push(groupedData[key].length));

        return {
            labels,
            datasets: [
                {
                    label: 'Number of messages per day',
                    data,
                    backgroundColor: ['rgba(54, 162, 235, 0.4)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1,
                    lineTension: 0.1,
                },
            ],
            options: {
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                displayFormats: {
                                    quarter: 'MMM YYYY',
                                },
                            },
                        },
                    ],
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            },
        };
    }
    renderDataHour(logs) {
        let defaultData = logs;
        if (this.state.value) {
            defaultData = _.filter(defaultData, { _id: this.state.value });
        }

        if (this.state.selectedDate) {
            defaultData = _.filter(defaultData, item =>
                moment(item.date).isBetween(moment(this.state.selectedDate[0]), moment(this.state.selectedDate[1])),
            );
            console.log(defaultData);
        }

        const groupedData = _.groupBy(defaultData, item => moment(item.date).format('HH:00'));
        const labels = _.keys(groupedData).sort();
        let data = [];
        labels.forEach(key => data.push(groupedData[key].length));

        return {
            labels,
            datasets: [
                {
                    label: 'Number of messages per hour',
                    data,
                    backgroundColor: ['rgba(233, 235, 0, 0.4)'],
                    borderColor: ['rgba(233, 235, 0, 1)'],
                    borderWidth: 1,
                    lineTension: 0.1,
                },
            ],
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            },
        };
    }

    render() {
        return (
            <>
                <div className="mainWrap">
                    <div className="blockSearch">
                        <div className="search">
                            <p>Поиск по ID:</p>
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                        </div>
                        {/* <div className="search">
                            <p>Range Time:</p>
                            <input type="time" value={this.state.valueRangeTime} onChange={this.changeRangeTime} />
                        </div> */}
                        <Calendar onChange={this.calendarChange} value={this.state.selectedDate} selectRange />
                    </div>
                    <div className="daysChart">
                        <Line
                            data={this.renderData(this.state.logs)}
                            width={100}
                            height={20}
                            options={{
                                maintainAspectRatio: true,
                            }}
                        />
                        <Line
                            data={this.renderDataHour(this.state.logs)}
                            width={80}
                            height={20}
                            options={{
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                    <p>Общее количество сообщений: </p>
                </div>
            </>
        );
    }
}
