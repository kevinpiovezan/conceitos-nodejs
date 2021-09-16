const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((user) => user.username === username);
  if(!user || !username) return response.status(404).json({error: "User Does not exist!"});
  request.username = user;
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  } 
  for(let i = 0; i < users.length; i++) {
    if(users[i].username === username) return response.status(400).json({error: "User already exists"})
  }
  users.push(user)
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {title, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };
  username.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {title, deadline} = request.body;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      console.log(todos[i].title)
      todos[i].title = title;
      todos[i].deadline = deadline;
      return response.status(201).json(todos[i]);
    }
  }
  return response.status(404).json({error: 'ID not found!'});

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      todos[i].done = true;
      return response.status(201).json(todos[i]);
    }
  }
  return response.status(404).json({error: 'To Do not found!'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      todos.splice(i,1);
      return response.status(204).send()
    }
  }
  return response.status(404).json({error: 'To Do not found'})
});

module.exports = app;