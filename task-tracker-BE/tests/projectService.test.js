const ProjectService = require('../services/projectService');
const Project = require('../models/Project');

jest.mock('../models/Project');

describe('ProjectService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new project', async () => {
    const userId = 'user123';
    const projectData = {
      name: 'Test Project',
      description: 'Test description',
      deadline: '2024-12-31',
      projectManager: 'John Doe'
    };

    const mockProject = { _id: 'project123', ...projectData, userId };
    Project.create.mockResolvedValue(mockProject);

    const result = await ProjectService.createProject(userId, projectData);

    expect(Project.create).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'Test description',
      status: 'planning',
      priority: 'medium',
      category: 'Development',
      budget: undefined,
      startDate: expect.any(Date),
      deadline: '2024-12-31',
      projectManager: 'John Doe',
      client: undefined,
      team: [],
      userId
    });
    expect(result).toBe(mockProject);
  });

  test('should get all projects for user', async () => {
    const userId = 'user123';
    const mockProjects = [
      { _id: 'project1', name: 'Project 1', toObject: () => ({ _id: 'project1', name: 'Project 1' }) }
    ];

    Project.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProjects)
      })
    });

    const result = await ProjectService.getProjects(userId);

    expect(Project.find).toHaveBeenCalledWith({ userId });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Project 1');
  });

  test('should throw error if required fields missing', async () => {
    const userId = 'user123';
    const incompleteData = { name: 'Test Project' }; // Missing required fields

    await expect(ProjectService.createProject(userId, incompleteData))
      .rejects.toThrow('Name, description, deadline, and project manager are required');
  });
});
