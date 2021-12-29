const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const port = 8000
const handleBars = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: __dirname + '/views/component'
});
const router = require('./router/router');
const session = require('express-session');
const passport = require('passport');

app.engine('.hbs', handleBars.engine);

app.set('view engine', 'hbs');
app.set('views', './views')

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'kov',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', router);

app.listen(port, () => console.log(`see project => http://localhost:${port}`))