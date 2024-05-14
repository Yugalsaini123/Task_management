// index.js
document.addEventListener('DOMContentLoaded', () => {
    getUser();
    getTasks();

    // Initialize Sortable.js
    const taskList = document.getElementById('task-list');
    new Sortable(taskList, {
        animation: 150, // Animation speed
        onUpdate: (evt) => {
            // Get the updated order of tasks
            const tasks = Array.from(taskList.children).map(li => li.textContent.trim());

            // Send an AJAX request to update the order of tasks in the backend
            updateTasksOrder(tasks);
        }
    });
});

function updateTasksOrder(tasks) {
    // Extracting task IDs from the task list items
    const taskIds = tasks.map(task => task.id);

    fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskIds }), // Sending task IDs instead of task names
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            console.log('Tasks order updated successfully');
        } else {
            throw new Error('Failed to update tasks order');
        }
    })
    .catch(error => {
        console.error('Error updating tasks order:', error);
    });
}

  


function getUser() {
  fetch('/api/user', {
      method: 'GET',
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          return response.json();
      } else if (response.status === 401) {
          document.getElementById('login-section').style.display = 'block';
          document.getElementById('task-section').style.display = 'none';
          throw new Error('User is not authenticated');
      } else {
          throw new Error('Failed to fetch user data');
      }
  })
  .then(user => {
      if (user.username) {
          document.getElementById('login-section').style.display = 'none';
          document.getElementById('task-section').style.display = 'block';
      } else {
          document.getElementById('login-section').style.display = 'block';
          document.getElementById('task-section').style.display = 'none';
      }
  })
  .catch(error => {
      console.error('Error fetching user:', error);
      // Display error message or handle it accordingly
  });
}

function getTasks() {
  fetch('/api/tasks', {
      method: 'GET',
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          return response.json();
      } else {
          throw new Error('Error fetching tasks');
      }
  })
  .then(tasks => {
      // Sort tasks based on timestamp in descending order
      tasks.sort((a, b) => b.timestamp - a.timestamp);
      const taskList = document.getElementById('task-list');
      taskList.innerHTML = '';
      tasks.forEach(task => {
          const li = document.createElement('li');
          li.textContent = task.name;
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', () => deleteTask(task.id));
          li.appendChild(deleteButton);
          taskList.appendChild(li);
      });
  })
  .catch(error => {
      console.error('Error fetching tasks:', error);
      // Display error message or handle it accordingly
  });
}

function deleteTask(taskId) {
  fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          getTasks(); // Refresh task list after deletion
      } else {
          throw new Error('Error deleting task');
      }
  })
  .catch(error => console.error('Error deleting task:', error));
}

function addTask() {
  const taskName = document.getElementById('task-name').value;
  if (taskName.trim() !== '') {
      fetch('/api/tasks', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: taskName }),
          credentials: 'include'
      })
      .then(response => response.json())
      .then(() => {
          getTasks();
          document.getElementById('task-name').value = '';
      })
      .catch(error => console.error('Error adding task:', error));
  }
}

function signup() {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  fetch('/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          document.getElementById('signup-error').textContent = ''; // Clear any previous error messages
          document.getElementById('signup-success').textContent = 'Successfully signed up'; // Show success message
          getUser();
      } else {
          throw new Error('Signup failed');
      }
  })
  .catch(error => {
      document.getElementById('signup-error').textContent = error.message;
  });
}

function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  fetch('/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          return response.json();
      } else {
          throw new Error('Login failed');
      }
  })
  .then(data => {
      document.getElementById('login-error').textContent = ''; // Clear any previous error messages
      document.getElementById('login-success').textContent = 'Successfully logIn'; // Show success message
      getUser();
      displayTasks(data.tasks); // Display tasks
  })
  .catch(error => {
      document.getElementById('login-error').textContent = error.message;
  });
}

function displayTasks(tasks) {
  // Sort tasks based on timestamp in descending order
  tasks.sort((a, b) => b.timestamp - a.timestamp);
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  tasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.name;
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteTask(task.id));
      li.appendChild(deleteButton);
      taskList.appendChild(li);
  });
}

function logout() {
  fetch('/logout', {
      method: 'GET',
      credentials: 'include'
  })
  .then(response => {
      if (response.ok) {
          document.getElementById('logout-error').textContent = ''; 
          document.getElementById('logout-success').textContent = 'Successfully logout'; 
          getUser();
      } else {
          console.error('Logout failed');
      }
  })
  .catch(error => console.error('Error during logout:', error));
}


