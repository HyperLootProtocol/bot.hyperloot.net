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
            axisX: [],
            axisY: [],
            selectedUsername: '',
            selectedUserId: '',
            value: '',
        };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.setState({ value: event.target.value });
    }
    componentDidMount() {
        fetch(API)
            .then(response => response.json())
            .then(data => this.setState({ logs: data.response.data }));
    }

    renderData(logs) {
        // const groupedUser = _.filter(logs, [ userId: userIdVariable]); Для фильтра по userId
        const groupedData = _.groupBy(logs, item => moment(item.date).format('DD.MM.YY'));
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
        const groupedData = _.groupBy(logs, item => moment(item.date).format('HH:00'));
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
                <p>Here! {this.state.logs.length ? 'loaded' : 'loading'}</p>
                <input type="text" value={this.state.value} onChange={this.handleChange} />
                <p onChange={this.handleChange}>{this.state.value}</p>
                <Calendar />
                <Line
                    data={this.renderData(this.state.logs)}
                    width={80}
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
            </>
        );
    }
}
