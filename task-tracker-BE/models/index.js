// models/index.js
const Activity = require('./Activity');
const { Project } = require('./Project');
const Task = require('./Task');
const User = require('./User');

module.exports = {
  User, Task, Project, Activity
};