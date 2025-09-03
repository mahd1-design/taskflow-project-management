const AuthService = require('../services/authService');
const { User } = require('../models');

// Mock the User model
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  }
}));

describe('AuthService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123'
    };

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@test.com',
      toObject: () => ({ _id: 'user123', name: 'John Doe', email: 'john@test.com' })
    };

    User.findOne.mockResolvedValue(null); // User doesn't exist
    User.create.mockResolvedValue(mockUser);

    const result = await AuthService.register(userData);

    expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
    expect(User.create).toHaveBeenCalledWith(userData);
    expect(result.user.email).toBe(userData.email);
    expect(result.token).toBeDefined();
  });

  test('should throw error if user already exists', async () => {
    const userData = { email: 'existing@test.com' };
    
    User.findOne.mockResolvedValue({ email: 'existing@test.com' });

    await expect(AuthService.register(userData)).rejects.toThrow('User already exists');
  });

  test('should login user with correct credentials', async () => {
    const credentials = { email: 'john@test.com', password: 'password123' };
    
    const mockUser = {
      _id: 'user123',
      email: 'john@test.com',
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
      toObject: () => ({ _id: 'user123', email: 'john@test.com' })
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const result = await AuthService.login(credentials);

    expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    expect(result.user.email).toBe('john@test.com');
    expect(result.token).toBeDefined();
  });
});