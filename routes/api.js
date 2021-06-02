const apiRouter = require('express').Router();
const pool = require('../db');

module.exports = apiRouter;

// create a new user
apiRouter.post('/users', async (req, res) => {
    const { username } = req.body;
    try {
        await pool.query('INSERT INTO users (username, _id) VALUES ($1, uuid_generate_v4())', [username]);
        const newUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        res.status(201).send(newUser.rows[0]);
    } catch (error) {
        console.error(error.message);
    };
});


// get all users
apiRouter.get('/users', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users');
        res.status(200).send(allUsers.rows);
    } catch (error) {
        console.error(error.message);
    };
});


// create an exercice for an user
apiRouter.post('/users/:_id/exercises', async (req, res) => {
    let { description, duration, date } = req.body;
    const _id = req.params._id;
    //date is optional
    if(date == undefined) {
        date = new Date().toUTCString();
    };
    try {
        const user = await pool.query('SELECT * FROM users WHERE _id = $1', [_id]);
        if (user.rowCount < 1) {
            return res.status(404).send({
                message: "There is no user with this id"
            });
        };
        await pool.query('INSERT INTO exercices (user_id, description, duration, date) VALUES ($1, $2, $3, $4)',
        [_id, description, duration, date]);
        const newExercise = await pool.query('SELECT * FROM exercices WHERE user_id = $1 AND description = $2',
        [_id, description]);
        res.status(201).send(newExercise.rows[0]);
    } catch (error) {
        console.error(error.message);
    };  
})


// get all exercices by users
apiRouter.get('/users/:_id/logs', async (req, res) => {
    const _id = req.params._id;
    try {
        const user = await pool.query('SELECT * FROM users WHERE _id = $1', [_id]);
        if (user.rowCount < 1) {
            return res.status(404).send({
                message: "There is no user with this id"
            });
        };
        const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1', [_id]);
        const count = await pool.query('SELECT COUNT(*) from exercices WHERE user_id = $1', [_id]);
        res.status(200).json({
            _id: user.rows[0]._id,
            username: user.rows[0].username,
            count: count.rows[0].count,
            log: exercices.rows
        });
    } catch (error) {
        console.error(error.message);
    };
});

/*You can add from, to and limit parameters to a /api/users/:_id/logs request to retrieve part of the log
 of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.*/
apiRouter.get('/:_id/logs?[from][&to][&limit]', async (req, res) => {

});