import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const _ = require('lodash');
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
        console.log('logs', logs);
        let dates = logs.reduce((prev, curr) => [...prev, curr.date.split('T')[0]], []); // Метод который обрабатывает элементы и создает массив из date; split('T')[0] - обрезает дату начиная с буквы Т;
        // console.log(_.groupBy(dates, item => moment(item.date).format('YYYY-MM-DD')));

        // Считает количество дат в массиве
        let countDates = dates.reduce((acc, el) => {
            acc[el] = (acc[el] || 0) + 1;
            return acc;
        }, {});

        //Функция для сортировки
        function sortObject(item) {
            return Object.keys(item)
                .sort()
                .reduce((a, v) => {
                    a[v] = item[v];
                    return a;
                }, {});
        }
        //Сортируем дату
        let sortDates = sortObject(countDates);

        //Собирает даты с объекта countDates для оси Х
        let xDate = Object.keys(sortDates).map(function(key) {
            return String(key);
        });

        //Собирает количество дат с объекта countDates для оси У
        let yDate = Object.keys(sortDates).map(function(key) {
            return sortDates[key];
        });

        return {
            labels: xDate,
            datasets: [
                {
                    label: 'Number of messages per day',
                    data: yDate,
                    backgroundColor: ['rgba(54, 162, 235, 0.4)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
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
                    width={100}
                    height={100}
                    options={{
                        maintainAspectRatio: false,
                    }}
                />
            </>
        );
    }
}
