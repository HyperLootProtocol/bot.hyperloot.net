import React from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import moment from 'moment';

const API = '/api?query=getLog';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logs: [],
        };
    }

    componentDidMount() {
        fetch(API)
            .then(response => response.json())
            .then(data => this.setState({ logs: data.response.data }));
    }

    renderData(logs) {
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
    renderDataUser(logs) {
        console.log('logs', logs);

        const groupedUser = _.filter(logs, ['userId', '509115709704372243']);
        const groupedData = _.groupBy(groupedUser, item => moment(item.date).format('DD.MM.YY'));
        const labels = _.keys(groupedData).sort();
        let data = [];
        labels.forEach(key => data.push(groupedData[key].length));
        console.log('Grouped Data:' + groupedData);
        console.log('Data: ' + data);
        console.log('Labels: ' + labels);

        return {
            labels,
            datasets: [
                {
                    label: 'Number of messages User per day',
                    data,
                    backgroundColor: ['rgba(233, 235, 0, 0.4)'],
                    borderColor: ['rgba(233, 235, 0, 1)'],
                    borderWidth: 1,
                    lineTension: 0.1,
                },
            ],
        };
    }

    render() {
        return (
            <>
                <p>Here! {this.state.logs.length ? 'loaded' : 'loading'}</p>

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
                <Line
                    data={this.renderDataUser(this.state.logs)}
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
