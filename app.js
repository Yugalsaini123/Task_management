//app.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

AWS.config.update({ region: 'ap-south-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(session({
  secret: '7851887249',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    const params = {
      TableName: 'Users',
      Key: {
        username: username
      }
    };

    dynamodb.get(params, (err, data) => {
      if (err) {
        return done(err);
      }
      if (!data.Item) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      const user = data.Item;

      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  const params = {
    TableName: 'Users',
    Key: {
      username: username
    }
  };

  dynamodb.get(params, (err, data) => {
    if (err) {
      return done(err);
    }
    if (!data.Item) {
      return done(null, false);
    }
    const user = data.Item;
    return done(null, user);
  });
});

app.use(express.static('public'));

app.post('/signup', async (req, res) => {
  try {
    let { username, password } = req.body;
    const userExistsParams = {
      TableName: 'Users',
      Key: {
        'username': username
      },
    };
    const userExists = await dynamodb.get(userExistsParams).promise();
    if (userExists.Item) {
      return res.status(400).send('User already exists with this username, please login..');
    }
    const createUserParams = {
      TableName: 'Users',
      Item: {
        'username' : username,
        'password' : password // Assuming password is already hashed or encrypted
      }
    };
    await dynamodb.put(createUserParams).promise();
    res.json({ message: 'Successful Signup' });
  } catch(err){
    console.error("Unable to add item", err);
    res.status(500).send('Error saving data');
  }
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure' }), (req, res) => {
  // Fetch tasks after successful login
  const tasksParams = {
    TableName: 'Tasks',
    FilterExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':userId': req.user.username
    }
  };

  dynamodb.scan(tasksParams, (err, data) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ message: 'Error fetching tasks' });
    } else {
      const tasks = Array.isArray(data.Items) ? data.Items : [];
      res.json({ message: 'Login successful', tasks }); // Include tasks in the response
    }
  });
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ message: 'Logout failed' });
    } else {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({ message: 'Logout failed' });
        } else {
          res.redirect('/login'); // Redirect to the login page after successful logout
        }
      });
    }
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/api/tasks', (req, res) => {
  if (req.isAuthenticated()) {
    const params = {
      TableName: 'Tasks',
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': req.user.username
      },
      ScanIndexForward: false // Set to false for descending order
    };

    dynamodb.scan(params, (err, data) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Error fetching tasks' });
      } else {
        if (Array.isArray(data.Items)) {
          data.Items.forEach((task) => {
            // Do something with each task
          });
          res.json(data.Items);
        } else {
          res.status(500).json({ message: 'Error fetching tasks: Invalid data format' });
        }
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/tasks', (req, res) => {
  if (req.isAuthenticated()) {
    const { name } = req.body;
    const taskId = uuidv4(); // Generate a new UUID for each task

    const task = {
      id: taskId, // Use the generated taskId
      name,
      userId: req.user.username,
      timestamp: Date.now() // Adding timestamp attribute with current timestamp
    };

    const params = {
      TableName: 'Tasks',
      Item: task
    };

    dynamodb.put(params, (err, data) => {
      if (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Error creating task' });
      } else {
        res.json(task);
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  if (req.isAuthenticated()) {
    const { id } = req.params;
    const params = {
      TableName: 'Tasks',
      Key: {
        id,
        userId: req.user.username
      }
    };

    dynamodb.delete(params, (err, data) => {
      if (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Error deleting task' });
      } else {
        res.json({ message: 'Task deleted successfully' });
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/tasks/reorder', async (req, res) => {
  try {
    const reorderedTasks = Array.isArray(req.body) ? req.body : [];
    // Define oldTasksParams within the scope of this function
    const oldTasksParams = {
      TableName: 'Tasks',
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': req.user.username
      }
    };

    const oldTasksResult = await dynamodb.query(oldTasksParams).promise();
    const oldTasks = oldTasksResult.Items;

    const updatePromises = reorderedTasks.map(async (task, index) => {
      const taskId = task.id;
      const taskToUpdate = oldTasks.find(t => t.id === taskId);
      if (taskToUpdate) {
        taskToUpdate.order = index;
        const updateParams = {
          TableName: 'Tasks',
          Key: {
            userId: req.user.username,
            id: taskId
          },
          UpdateExpression: 'SET #order = :order',
          ExpressionAttributeNames: {
            '#order': 'order'
          },
          ExpressionAttributeValues: {
            ':order': index
          }
        };
        return dynamodb.update(updateParams).promise();
      } else {
        throw new Error(`Task with id ${taskId} not found.`);
      }
    });

    await Promise.all(updatePromises);
    res.status(200).json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ message: 'Failed to reorder tasks', error: error.message });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
