const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }
  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  newTodo = {
    id: uuidv4(),
    title: title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };
  user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todoToBeChanged = user.todos.find((todo) => todo.id === id);

  if (!todoToBeChanged) {
    return response
      .status(404)
      .json({ error: "No todo found with the given id" });
  }

  todoToBeChanged.title = title;
  todoToBeChanged.deadline = deadline;

  return response.status(200).send(todoToBeChanged);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoToComplete = user.todos.find((todo) => todo.id === id);

  if (!todoToComplete) {
    return response
      .status(404)
      .json({ error: "No todo found with the given id" });
  }

  todoToComplete.done = true;

  return response.status(200).json(todoToComplete);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoToDeleteIndex = user.todos.findIndex(
    (todo) => todo.id === id
  );

  if (todoToDeleteIndex === -1) {
    return response
      .status(404)
      .json({ error: "No todo found with the given id" });
  }

  // Delete todo
  user.todos.splice(todoToDeleteIndex, 1);

  return response.status(204).send();
});

module.exports = app;
