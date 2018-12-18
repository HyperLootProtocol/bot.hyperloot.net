
const cors = require('cors');
const bodyParser = require('body-parser');

const server = require('./src');

const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

server.use(cors());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.listen(port, () => {
    console.log(`Express server listnening port: ${port}`);
});
