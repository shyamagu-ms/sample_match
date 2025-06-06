const ProjectModel = require('../../server/models/project');

// Mock the database module
jest.mock('../../server/database/db', () => ({
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn()
}));

const db = require('../../server/database/db');

describe('ProjectModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    test('should return project when found', async () => {
      const mockProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        status: 'open',
        user_id: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        creator_name: 'testuser'
      };
      
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockProject);
      });

      const result = await ProjectModel.findById(1);

      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockProject);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.get.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(ProjectModel.findById(1)).rejects.toThrow('Database error');
    });

    test('should return null when project not found', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await ProjectModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should return all projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          status: 'open',
          user_id: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          creator_name: 'user1'
        },
        {
          id: 2,
          title: 'Project 2',
          description: 'Description 2',
          status: 'open',
          user_id: 2,
          created_at: '2023-01-02',
          updated_at: '2023-01-02',
          creator_name: 'user2'
        }
      ];
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockProjects);
      });

      const result = await ProjectModel.findAll();

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [],
        expect.any(Function)
      );
      expect(result).toEqual(mockProjects);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(ProjectModel.findAll()).rejects.toThrow('Database error');
    });

    test('should return empty array when no projects', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await ProjectModel.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    test('should return user projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'User Project 1',
          description: 'Description 1',
          status: 'open',
          user_id: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          creator_name: 'testuser'
        }
      ];
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockProjects);
      });

      const result = await ProjectModel.findByUserId(1);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.user_id = ?'),
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockProjects);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(ProjectModel.findByUserId(1)).rejects.toThrow('Database error');
    });

    test('should return empty array when no projects', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await ProjectModel.findByUserId(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    test('should create project successfully', async () => {
      const projectData = {
        title: 'New Project',
        description: 'New Description',
        user_id: 1
      };
      const mockLastID = 5;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await ProjectModel.create(projectData);

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO projects (title, description, user_id, status) VALUES (?, ?, ?, ?)',
        ['New Project', 'New Description', 1, 'open'],
        expect.any(Function)
      );
      expect(result).toEqual({ id: mockLastID, ...projectData });
    });

    test('should create project with custom status', async () => {
      const projectData = {
        title: 'New Project',
        description: 'New Description',
        user_id: 1,
        status: 'closed'
      };
      const mockLastID = 5;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await ProjectModel.create(projectData);

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO projects (title, description, user_id, status) VALUES (?, ?, ?, ?)',
        ['New Project', 'New Description', 1, 'closed'],
        expect.any(Function)
      );
      expect(result).toEqual({ id: mockLastID, ...projectData });
    });

    test('should handle database error', async () => {
      const projectData = {
        title: 'New Project',
        description: 'New Description',
        user_id: 1
      };
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(ProjectModel.create(projectData)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update project successfully', async () => {
      const projectData = {
        title: 'Updated Project',
        description: 'Updated Description',
        status: 'closed'
      };
      const projectId = 1;
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await ProjectModel.update(projectId, projectData);

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE projects SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['Updated Project', 'Updated Description', 'closed', 1],
        expect.any(Function)
      );
      expect(result).toEqual({ id: projectId, ...projectData });
    });

    test('should handle database error', async () => {
      const projectData = {
        title: 'Updated Project',
        description: 'Updated Description',
        status: 'closed'
      };
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(ProjectModel.update(1, projectData)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    test('should delete project successfully', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const result = await ProjectModel.delete(1);

      expect(db.run).toHaveBeenCalledWith(
        'DELETE FROM projects WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual({ deleted: true });
    });

    test('should return false when no project deleted', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await ProjectModel.delete(999);

      expect(result).toEqual({ deleted: false });
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(ProjectModel.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('applyHelp', () => {
    test('should create new help application when none exists', async () => {
      const projectId = 1;
      const userId = 2;
      const mockLastID = 10;
      
      // First call to check existing - returns null
      // Second call to insert - succeeds
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await ProjectModel.applyHelp(projectId, userId);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM helps WHERE project_id = ? AND user_id = ?',
        [projectId, userId],
        expect.any(Function)
      );
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO helps (project_id, user_id, status) VALUES (?, ?, ?)',
        [projectId, userId, 'pending'],
        expect.any(Function)
      );
      expect(result).toEqual({
        exists: false,
        help: {
          id: mockLastID,
          project_id: projectId,
          user_id: userId,
          status: 'pending'
        }
      });
    });

    test('should return existing help when already applied', async () => {
      const projectId = 1;
      const userId = 2;
      const existingHelp = {
        id: 5,
        project_id: projectId,
        user_id: userId,
        status: 'pending'
      };
      
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, existingHelp);
      });

      const result = await ProjectModel.applyHelp(projectId, userId);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM helps WHERE project_id = ? AND user_id = ?',
        [projectId, userId],
        expect.any(Function)
      );
      expect(db.run).not.toHaveBeenCalled();
      expect(result).toEqual({
        exists: true,
        help: existingHelp
      });
    });

    test('should handle database error on check', async () => {
      const mockError = new Error('Database error');
      
      db.get.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(ProjectModel.applyHelp(1, 2)).rejects.toThrow('Database error');
    });

    test('should handle database error on insert', async () => {
      const mockError = new Error('Database error');
      
      // First call succeeds (no existing help)
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });
      
      // Second call fails (insert error)
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(ProjectModel.applyHelp(1, 2)).rejects.toThrow('Database error');
    });
  });

  describe('getHelps', () => {
    test('should return project helps', async () => {
      const mockHelps = [
        {
          help_id: 1,
          help_status: 'pending',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          user_id: 2,
          username: 'helper1'
        },
        {
          help_id: 2,
          help_status: 'matched',
          created_at: '2023-01-02',
          updated_at: '2023-01-02',
          user_id: 3,
          username: 'helper2'
        }
      ];
      
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockHelps);
      });

      const result = await ProjectModel.getHelps(1);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE h.project_id = ?'),
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

      await expect(ProjectModel.getHelps(1)).rejects.toThrow('Database error');
    });

    test('should return empty array when no helps', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await ProjectModel.getHelps(1);

      expect(result).toEqual([]);
    });
  });

  describe('updateHelpStatus', () => {
    test('should update help status successfully', async () => {
      const helpId = 1;
      const status = 'matched';
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const result = await ProjectModel.updateHelpStatus(helpId, status);

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE helps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, helpId],
        expect.any(Function)
      );
      expect(result).toEqual({
        id: helpId,
        status: status,
        updated: true
      });
    });

    test('should return false when no help updated', async () => {
      const helpId = 999;
      const status = 'matched';
      
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await ProjectModel.updateHelpStatus(helpId, status);

      expect(result).toEqual({
        id: helpId,
        status: status,
        updated: false
      });
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      db.run.mockImplementation((sql, params, callback) => {
        callback(mockError);
      });

      await expect(ProjectModel.updateHelpStatus(1, 'matched')).rejects.toThrow('Database error');
    });
  });
});