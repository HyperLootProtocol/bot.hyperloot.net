import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import _ from 'lodash';
import moment from 'moment';
import Calendar from 'react-calendar';

const API = '/api?query=getLog';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logs: [],
            calendarIsShown: false,
            value: '',
            selectedDate: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.calendarChange = this.calendarChange.bind(this);
        this.toggleCalendar = this.toggleCalendar.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    calendarChange(date) {
        this.setState({ selectedDate: date });
    }

    toggleCalendar() {
        this.setState({
            calendarIsShown: !this.state.calendarIsShown,
        });
    }

    componentDidMount() {
        fetch(API)
            .then(response => response.json())
            .then(data => this.setState({ logs: data.response.data }));
    }

    renderData(logs) {
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
                    xAxes: [{}],
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
        }
        console.log('amt:' + defaultData.length);
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
                    xAxes: [{}],
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

    renderTopTen(logs) {
        // Здесь храним данные, над которыми будем работать. Функция тестировалась на массиве из 20к элементов
        let data = logs;

        if (this.state.selectedDate) {
            data = _.filter(data, item =>
                moment(item.date).isBetween(moment(this.state.selectedDate[0]), moment(this.state.selectedDate[1])),
            );
        }

        // // Преобразуем даты в числовые значения чтобы удобнее было сравнивать
        let minDate = new Date('2019-01-02T21:53:58.515Z').getTime();
        let maxDate = new Date('2019-01-21T21:53:58.515Z').getTime();

        // // Хэш-таблица нам нужна для удобства работы с уникальными userId
        let hashMap = {};

        // // Создадим пустой массив, в котором будет храниться топ 10
        let topTenUsers = [];

        // // Отфильтруем исходный массив по критерию соответствия временному интервале между minDate и maxDate
        let dateFilteredData = data.filter(item => {
            return new Date(item.date).getTime() > minDate && new Date(item.date).getTime() < maxDate ? item : false;
        });

        // // Отфильтрованный по дате массив фильтруем по уникальным userId, далее, заполняем хэш таблицу
        _.uniqBy(dateFilteredData, 'userId').forEach(item => {
            hashMap[item.userId] = { messages: 0 };
        });

        // // Обходим отфильтрованный по дате массив и при увеличиваем счетчик сообщений при совпадении userId
        dateFilteredData.forEach(element => hashMap[element.userId].messages++);

        // // Трансформируем хэш таблицу в массив с объектами
        Object.keys(hashMap).forEach(key => {
            topTenUsers.push({
                userId: key,
                messages: hashMap[key].messages,
            });
        });

        // //Сортируем наш топ
        topTenUsers.sort((a, b) => b.messages - a.messages);
        let sliceTopTen = topTenUsers.slice(0, 10);

        console.log(sliceTopTen);
        let usersId = _.map(sliceTopTen, 'userId');
        let usersMessages = _.map(sliceTopTen, 'messages');

        return {
            labels: usersId,
            datasets: [
                {
                    label: 'Number of messages per user',
                    data: usersMessages,
                    backgroundColor: [
                        'rgba(100, 200, 0, 0.4)',
                        'rgba(111, 211, 0, 0.4)',
                        'rgba(122, 222, 0, 0.4)',
                        'rgba(133, 233, 0, 0.4)',
                        'rgba(144, 244, 0, 0.4)',
                        'rgba(155, 255, 0, 0.4)',
                        'rgba(166, 266, 0, 0.4)',
                        'rgba(177, 277, 0, 0.4)',
                        'rgba(188, 288, 0, 0.4)',
                        'rgba(199, 299, 0, 0.4)',
                    ],
                    borderColor: ['rgba(133, 235, 0, 1)'],
                    borderWidth: 1,
                    lineTension: 0.1,
                },
            ],
            options: {
                scales: {
                    xAxes: [{}],
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
        let calendarButtonText = this.state.calendarIsShown ? 'Скрыть календарь' : 'Показать календарь';
        return (
            <>
                <div className="mainWrap">
                    <div className="blockSearch">
                        <div className="search">
                            <p>Поиск по ID:</p>
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                        </div>
                        <button className="calendar-btn" onClick={this.toggleCalendar}>
                            {calendarButtonText}
                        </button>
                        {this.state.calendarIsShown && (
                            <Calendar onChange={this.calendarChange} value={this.state.selectedDate} selectRange />
                        )}
                    </div>
                    <div className="daysChart">
                        <Line
                            data={this.renderData(this.state.logs)}
                            width={100}
                            height={25}
                            options={{
                                maintainAspectRatio: true,
                            }}
                        />
                        <Line
                            data={this.renderDataHour(this.state.logs)}
                            width={100}
                            height={25}
                            options={{
                                maintainAspectRatio: true,
                            }}
                        />
                        <Bar
                            data={this.renderTopTen(this.state.logs)}
                            width={100}
                            height={25}
                            options={{
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                </div>
            </>
        );
    }
}
