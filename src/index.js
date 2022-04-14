const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const userAccount = users.find((user) => user.username === username);

  if(!userAccount) {
    return response.status(400).json({error: "User not found"});
  }

  request.userAccount = userAccount;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User Already Exists!" });
  }

  const newUser = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  
  return response.status(200).json(userAccount.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { userAccount } = request;

  const index = userAccount.todos.findIndex(todo => todo.id === id);

  if(index === -1) {
    return response.status(404).json({error: "Todo não existente"});
  }
  
  userAccount.todos[index] = {
    ...userAccount.todos[index],
    title,
    deadline: new Date(deadline),
    done: false,
  }
  
  return response.status(200).send(userAccount.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const index = userAccount.todos.findIndex(todo => todo.id === id);
  
  if(index === -1) {
    return response.status(404).json({error: "Todo não existente"});
  }
  
  userAccount.todos[index] = {
    ...userAccount.todos[index],
    done: true,
  }
  
  return response.status(200).send(userAccount.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const index = userAccount.todos.findIndex(todo => todo.id === id);

  if(index === -1) {
    return response.status(404).json({error: "Todo não existente"});
  }
  
  userAccount.todos.splice(index,1);
  
  return response.status(204).send();
});

module.exports = app;