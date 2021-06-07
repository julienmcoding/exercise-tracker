const apiRouter = require('express').Router();
const pool = require('../db');

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};


module.exports = apiRouter;

// create a new user
apiRouter.post('/users', async (req, res) => {
    console.log('accessing to the post user request');
    const { username } = req.body;
    const uuid = create_UUID();
    console.log(username);
    try {
        await pool.query('INSERT INTO users (username, _id) VALUES ($1, $2)', [username, uuid]);
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
    if(req.body.date == '') {
        let convert = new Date().toISOString().substring(0,10);
        date = new Date(convert).toDateString();
    } else {
        date = new Date(date).toDateString();
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
        res.status(201).json({
            _id: user.rows[0]._id,
            username: user.rows[0].username,
            date: date,
            duration: duration,
            description: description
        });
    } catch (error) {
        console.error(error.message);
    };  
})


// get all exercices by users
// you can add optional parameters (from, to and limit)
apiRouter.get('/users/:_id/logs', async (req, res) => {
    const _id = req.params._id;
    const { from, to, limit } = req.query;
    try {
        const user = await pool.query('SELECT * FROM users WHERE _id = $1', [_id]);
        if (user.rowCount < 1) {
            return res.status(404).send({
                message: "There is no user with this id"
            });
        };
        if(from == undefined && to == undefined && limit == undefined) {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1', [_id]);
            const count = await pool.query('SELECT COUNT(*) from exercices WHERE user_id = $1', [_id]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });
        } else if(to == undefined && limit == undefined) {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1 AND date >= $2', [_id, from]);
            const count = await pool.query('SELECT COUNT(*) from exercices WHERE user_id = $1 AND date >= $2', [_id, from]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });
        } else if(from == undefined && to == undefined) {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1 LIMIT $2', [_id, limit]);
            const count = await pool.query('SELECT COUNT(*) from (SELECT * from exercices WHERE user_id = $1 LIMIT $2) AS derivedTable', [_id, limit]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });
        } else if (limit == undefined) {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1 AND date >= $2 AND date <= $3', [_id, from, to]);
            const count = await pool.query('SELECT COUNT(*) from exercices WHERE user_id = $1 AND date >= $2 AND date <= $3', [_id, from, to]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });  
        } else if (to == undefined) {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1 AND date >= $2 ORDER BY date LIMIT $3', [_id, from, limit]);
            const count = await pool.query('SELECT COUNT(*) from (SELECT * from exercices WHERE user_id = $1 AND date >= $2 LIMIT $3) AS derivedTable', [_id, from, limit]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });
        } else {
            const exercices = await pool.query('SELECT description, duration, date from exercices WHERE user_id = $1 AND date >= $2 AND date <= $3 LIMIT $4', [_id, from, to, limit]);
            const count = await pool.query('SELECT COUNT(*) from (SELECT * from exercices WHERE user_id = $1 AND date >= $2 AND date <= $3 LIMIT $4) AS derivedTable', [_id, from, to, limit]);
            res.status(200).json({
                _id: user.rows[0]._id,
                username: user.rows[0].username,
                count: count.rows[0].count,
                log: exercices.rows
            });
        };
    } catch (error) {
        console.error(error.message);
    };
});