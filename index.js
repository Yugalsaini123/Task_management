//import React from 'react';
//import ReactDOM from 'react-dom';
//import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import axios from 'axios';
//
//function App() {
//    return (
//        <BrowserRouter>
//            <Switch>
//                <Route path="/" exact component={TaskList} />
//                <Route path="/add" component={TaskForm} />
//                <Route path="/edit/:id" component={TaskForm} />
//            </Switch>
//        </BrowserRouter>
//    );
//}
//
//function TaskList() {
//    const [tasks, setTasks] = React.useState([]);
//
//    React.useEffect(() => {
//        axios.get('/api/tasks')
//          .then(response => {
//                setTasks(response.data);
//            })
//          .catch(error => {
//                console.error(error);
//            });
//    }, []);
//
//    const handleAddTask = () => {
//        // Redirect to the add task form
//        window.location.href = '/add';
//    };
//
//    const handleDeleteTask = (id) => {
//        axios.delete(`/api/tasks/${id}`)
//          .then(response => {
//                console.log(response.data);
//            })
//          .catch(error => {
//                console.error(error);
//            });
//    };
//
//    return (
//        <div>
//            <h1>Task List</h1>
//            <ul className="task-list">
//                {tasks.map(task => (
//                    <li key={task.id}>
//                        {task.name}
//                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
//                    </li>
//                ))}
//            </ul>
//            <button onClick={handleAddTask}>Add Task</button>
//        </div>
//    );
//}
//
//function TaskForm() {
//    const [task, setTask] = React.useState({ name: '' });
//    const [errors, setErrors] = React.useState({});
//
//    const handleSubmit = (event) => {
//        event.preventDefault();
//        axios.post('/api/tasks', task)
//          .then(response => {
//                console.log(response.data);
//                setTask({ name: '' });
//            })
//          .catch(error => {
//                setErrors(error.response.data);
//            });
//    };
//
//    return (
//        <div>
//            <h1>{task.id? 'Edit Task' : 'Add Task'}</h1>
//            <form onSubmit={handleSubmit}>
//                <input type="text" value={task.name} onChange={(event) => setTask({ name: event.target.value })} />
//                {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
//                <button type="submit">Save</button>
//            </form>
//        </div>
//    );
//}
//
//ReactDOM.render(<App />, document.getElementById('root'));





// index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';

function TaskList() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        axios.get('/api/tasks')
            .then(response => {
                setTasks(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const handleDeleteTask = (id) => {
        axios.delete(`/api/tasks/${id}`)
            .then(response => {
                console.log(response.data);
                setTasks(tasks.filter(task => task.id !== id));
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div>
            <h1>Task List</h1>
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id}>
                        {task.name}
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => window.location.href = '/add'}>Add Task</button>
        </div>
    );
}

function TaskForm() {
    const [task, setTask] = useState({ name: '' });
    const [errors, setErrors] = useState({});

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/api/tasks', task)
            .then(response => {
                console.log(response.data);
                window.location.href = '/';
            })
            .catch(error => {
                setErrors(error.response.data);
            });
    };

    return (
        <div>
            <h1>{task.id ? 'Edit Task' : 'Add Task'}</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={task.name} onChange={(event) => setTask({ name: event.target.value })} />
                {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={TaskList} />
                <Route path="/add" component={TaskForm} />
                {/* other routes */}
            </Switch>
        </BrowserRouter>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
