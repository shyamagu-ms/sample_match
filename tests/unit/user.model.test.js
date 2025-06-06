const UserModel = require('../../server/models/user');

// Mock the database module
jest.mock('../../server/database/db', () => ({
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn()
}));

const db = require('../../server/database/db');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    test('should return user when found', async () => {
      const mockUser = { id: 1, username: 'testuser', created_at: '2023-01-01', updated_at: '2023-01-01' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const result = await UserModel.findById(1);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockUser);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.get.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(UserModel.findById(1)).rejects.toThrow('Database error');
    });

    test('should return null when user not found', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await UserModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    test('should return user when found', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpw' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const result = await UserModel.findByUsername('testuser');

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser'],
        expect.any(Function)
      );
      expect(result).toEqual(mockUser);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.get.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(UserModel.findByUsername('testuser')).rejects.toThrow('Database error');
    });

    test('should return null when user not found', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await UserModel.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, username: 'user2', created_at: '2023-01-02', updated_at: '2023-01-02' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockUsers);
      });

      const result = await UserModel.findAll();

      expect(db.all).toHaveBeenCalledWith(
        'SELECT id, username, created_at, updated_at FROM users',
        [],
        expect.any(Function)
      );
      expect(result).toEqual(mockUsers);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(UserModel.findAll()).rejects.toThrow('Database error');
    });

    test('should return empty array when no users', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await UserModel.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    test('should create user successfully', async () => {
      const userData = { username: 'newuser', password: 'password' };
      const mockLastID = 5;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await UserModel.create(userData);

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['newuser', 'password'],
        expect.any(Function)
      );
      expect(result).toEqual({ id: mockLastID, ...userData });
    });

    test('should create user with empty password when not provided', async () => {
      const userData = { username: 'newuser' };
      const mockLastID = 5;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await UserModel.create(userData);

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['newuser', ''],
        expect.any(Function)
      );
      expect(result).toEqual({ id: mockLastID, ...userData });
    });

    test('should handle database error', async () => {
      const userData = { username: 'newuser', password: 'password' };
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(UserModel.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update user successfully', async () => {
      const userData = { username: 'updateduser', password: 'newpassword' };
      const userId = 1;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await UserModel.update(userId, userData);

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE users SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['updateduser', 'newpassword', 1],
        expect.any(Function)
      );
      expect(result).toEqual({ id: userId, ...userData });
    });

    test('should handle database error', async () => {
      const userData = { username: 'updateduser', password: 'newpassword' };
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(UserModel.update(1, userData)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    test('should delete user successfully', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const result = await UserModel.delete(1);

      expect(db.run).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual({ deleted: true });
    });

    test('should return false when no user deleted', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await UserModel.delete(999);

      expect(result).toEqual({ deleted: false });
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(UserModel.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('getUserMatches', () => {
    test('should return user matches', async () => {
      const mockMatches = [
        {
          help_id: 1,
          help_status: 'matched',
          project_id: 1,
          project_title: 'Project 1',
          project_description: 'Description 1',
          project_status: 'open',
          user_id: 2,
          username: 'creator'
        }
      ];
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockMatches);
      });

      const result = await UserModel.getUserMatches(1);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockMatches);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(UserModel.getUserMatches(1)).rejects.toThrow('Database error');
    });

    test('should return empty array when no matches', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await UserModel.getUserMatches(1);

      expect(result).toEqual([]);
    });
  });

  describe('getUserHelps', () => {
    test('should return user helps', async () => {
      const mockHelps = [
        {
          help_id: 1,
          help_status: 'pending',
          project_id: 1,
          project_title: 'Project 1',
          project_description: 'Description 1',
          project_status: 'open',
          user_id: 2,
          username: 'creator'
        }
      ];
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockHelps);
      });

      const result = await UserModel.getUserHelps(1);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockHelps);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(UserModel.getUserHelps(1)).rejects.toThrow('Database error');
    });

    test('should return empty array when no helps', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await UserModel.getUserHelps(1);

      expect(result).toEqual([]);
    });
  });
});