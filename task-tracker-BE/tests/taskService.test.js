const TaskService = require('../services/taskService');
const { Task, User } = require('../models');

jest.mock('../models', () => ({
  Task: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn()
  },
  User: {
    findById: jest.fn()
  }
}));

describe('TaskService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new task', async () => {
    const userId = 'user123';
    const taskData = {
      title: 'Test Task',
      description: 'Test description',
      dueDate: '2024-12-31',
      assignee: 'assignee123'
    };

    const mockTask = { _id: 'task123', ...taskData, userId };
    const mockUser = { updateTaskCounts: jest.fn() };

    Task.create.mockResolvedValue(mockTask);
    User.findById.mockResolvedValue(mockUser);

    const result = await TaskService.createTask(userId, taskData);

    expect(Task.create).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test description',
      priority: 'medium',
      category: 'Business',
      dueDate: '2024-12-31',
      assignee: 'assignee123',
      userId
    });
    expect(result).toBe(mockTask);
    expect(mockUser.updateTaskCounts).toHaveBeenCalled();
  });

  test('should get all tasks for user', async () => {
    const userId = 'user123';
    const mockTasks = [
      { _id: 'task1', title: 'Task 1' },
      { _id: 'task2', title: 'Task 2' }
    ];

    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockTasks)
      })
    });

    const result = await TaskService.getTasks(userId);

    expect(Task.find).toHaveBeenCalledWith({ userId });
    expect(result).toBe(mockTasks);
  });

  test('should toggle task completion', async () => {
    const taskId = 'task123';
    const userId = 'user123';
    
    const mockTask = {
      _id: taskId,
      completed: false,
      save: jest.fn()
    };
    const mockUser = { updateTaskCounts: jest.fn() };

    Task.findOne.mockResolvedValue(mockTask);
    User.findById.mockResolvedValue(mockUser);

    const result = await TaskService.toggleTask(taskId, userId);

    expect(mockTask.completed).toBe(true);
    expect(mockTask.save).toHaveBeenCalled();
    expect(mockUser.updateTaskCounts).toHaveBeenCalled();
  });
});