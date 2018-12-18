const CsvReader = require('promised-csv');
const sample = require('lodash/sample');

const reader = new CsvReader();

const rawData = {};

reader.on('row', ([key, value]) => {
    if (rawData[key]) {
        rawData[key].push(value);
    } else {
        rawData[key] = [value];
    }
});

const newlines = str => str.replace(/\\n/g, '\n');

function i18nFactory() {
    reader.read('i18n.csv', rawData);

    return (key, props = {}) => {
        const parsed = rawData[key] || [''];
        let string = sample(parsed);

        if (!string && !props.strict) {
            string = key;
        }

        Object
            .entries(props)
            .forEach(([k, v]) => {
                string = string.replace(`\${${k}}`, v);
            });

        string = newlines(string);

        return string;
    };
}

module.exports = {
    i18nFactory,
};
