const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/public'));

const apiRouter = require('./routes/api');
app.use('/api', apiRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listenning on port ${PORT}`);
});


