import React from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';
import './main.css';
import './layout.css';

const app = document.getElementById("app");

if (app) {
    ReactDOM.render(<App />, app);
}
