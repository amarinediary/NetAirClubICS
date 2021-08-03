let fs = require(`fs`),
    scraper = require(`${__dirname}/scraper.js`);
let express = require(`express`),
    PORT = process.env.PORT || 8081;

app = express();
app.use(express.json());
app.use(express.static(`public`));

app.post('/form', (request, response) => {
    let aeroclub = request.body.aeroclub,
        login = request.body.login,
        password = request.body.password,
        host = request.get('host');

        if (aeroclub != '' && login != '' && password != '') {
            scraper(aeroclub, login, password, host)
                .then(results => {
                    response.status(200).json(results);
                });
        } else {
            response.status(404).end();
        };
});

app.listen(PORT);