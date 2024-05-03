//const express = require('express');
//const session = require('express-session');
//const app = express();
//const sequelize = require('sequelize');
//const passport = require('passport');
//const jwt = require('jsonwebtoken');
//const LocalStrategy = require('passport-local').Strategy;
//// Import DataTypes from sequelize
//const { DataTypes } = sequelize;
//
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
//
//// Add session support
//app.use(session({
//  secret: 'your-secret-key',
//  resave: false,
//  saveUninitialized: true
//}));
//
//const sequelizeInstance = new sequelize('database', 'username', 'password', {
//  host: 'localhost',
//  dialect: 'mysql'
//});
//
//const Task = sequelizeInstance.define('Task', {
//  id: {
//    type: DataTypes.INTEGER,
//    primaryKey: true,
//    autoIncrement: true
//  },
//  name: {
//    type: DataTypes.STRING
//  }
//});
//
//// Implement user authentication and authorization using Passport.js
//const users = [
//  { id: 1, username: 'user', password: 'password' }
//];
//
//passport.use(new LocalStrategy(
//  (username, password, done) => {
//    const user = users.find(u => u.username === username && u.password === password);
//    if (!user) {
//      return done(null, false, { message: 'Incorrect username or password.' });
//    }
//    return done(null, user);
//  }
//));
//
//passport.serializeUser((user, done) => {
//  done(null, user.id);
//});
//
//passport.deserializeUser((id, done) => {
//  // implement user deserialization logic here
//  done(null, user);
//});
//
//// Add authenticate function
//function authenticate(req, res, next) {
//  if (req.isAuthenticated()) {
//    return next();
//  }
//  res.status(401).json({ message: 'Unauthorized' });
//}
//
//app.use(passport.initialize());
//app.use(passport.session());
//
//// Implement RESTful API endpoints for CRUD operations on tasks
//app.get('/api/tasks', authenticate, (req, res) => {
//  Task.findAll()
//    .then(tasks => res.json(tasks))
//    .catch(err => res.status(500).json({ message: 'Error fetching tasks' }));
//});
//
//app.post('/api/tasks', authenticate, (req, res) => {
//  const task = Task.build(req.body);
//  task.save()
//    .then(task => res.json(task))
//    .catch(err => res.status(500).json({ message: 'Error creating task' }));
//});
//
//app.get('/api/tasks/:id', authenticate, (req, res) => {
//  Task.findByPk(req.params.id)
//    .then(task => res.json(task))
//    .catch(err => res.status(404).json({ message: 'Task not found' }));
//});
//
//app.put('/api/tasks/:id', authenticate, (req, res) => {
//  Task.update(req.body, { where: { id: req.params.id } })
//    .then(task => res.json(task))
//    .catch(err => res.status(500).json({ message: 'Error updating task' }));
//});
//
//app.delete('/api/tasks/:id', authenticate, (req, res) => {
//  Task.destroy({ where: { id: req.params.id } })
//    .then(() => res.json({ message: 'Task deleted successfully' }))
//    .catch(err => res.status(500).json({ message: 'Error deleting task' }));
//});
//
//app.get('/', (req, res) => {
//  res.json({ message: 'Welcome to the Task Management API!' });
//});
//
//// Implement error handling middleware
//app.use((err, req, res, next) => {
//  console.error(err);
//  res.status(500).json({ message: 'Internal Server Error' });
//});
//
//app.listen(3000, () => {
//  console.log('Server listening on port 3000');
//});




// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const sequelize = new Sequelize('task_management', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    }
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        // Your authentication logic here
        // This is where you validate the user's credentials
        // For example:
        // if (username === validUsername && password === validPassword) {
        //     return done(null, user); // user is an object representing the authenticated user
        // } else {
        //     return done(null, false, { message: 'Incorrect username or password.' });
        // }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Your deserialization logic here
    // This is where you retrieve the user object based on the id
    // For example:
    // User.findById(id, (err, user) => {
    //     done(err, user); // user is an object representing the authenticated user
    // });
});

app.use(passport.initialize());
app.use(passport.session());

function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

app.get('/api/tasks', authenticate, (req, res) => {
    Task.findAll()
        .then(tasks => res.json(tasks))
        .catch(err => res.status(500).json({ message: 'Error fetching tasks' }));
});

app.post('/api/tasks', authenticate, (req, res) => {
    const task = Task.build(req.body);
    task.save()
        .then(task => res.json(task))
        .catch(err => res.status(500).json({ message: 'Error creating task' }));
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
    Task.destroy({ where: { id: req.params.id } })
        .then(() => res.json({ message: 'Task deleted successfully' }))
        .catch(err => res.status(500).json({ message: 'Error deleting task' }));
});

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
