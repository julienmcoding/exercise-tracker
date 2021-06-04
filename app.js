const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const apiRouter = require('./routes/api');
app.use('/api', apiRouter);


app.get('/', function(req, res) {
    res.render('index');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listenning on port ${PORT}`);
});


