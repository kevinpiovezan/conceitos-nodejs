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
  if(!user) return response.status(400).json({errors: "User Does not exist!"});
  request.username = user;
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const user = {
    name,
    username,
    uuid: uuidv4(),
    todos: []
  } 
  users.push(user)
  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {tittle, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    tittle,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  username.todos.push(todo);
  return response.json(username);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {tittle, deadline} = request.body;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      console.log(todos[i].tittle)
      todos[i].tittle = tittle;
      todos[i].deadline = deadline;
    }
  }
  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      todos[i].done = true;
    }
  }
  return response.status(201).send();
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {todos} = request.username;
  const {id} = request.params;
  for(let i = 0; i < todos.length; i++) {
    if(todos[i].id === id) {
      todos.splice(i,1);
    }
  }
  return response.status(201).send()
});

module.exports = app;