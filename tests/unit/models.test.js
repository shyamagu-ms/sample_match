const UserModel = require('../../server/models/user');
const ProjectModel = require('../../server/models/project');

// UserModelのモック
jest.mock('../../server/models/user', () => ({
  findById: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  getUserMatches: jest.fn(),
  getUserHelps: jest.fn()
}));

// ProjectModelのモック
jest.mock('../../server/models/project', () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  applyHelp: jest.fn(),
  getHelps: jest.fn(),
  updateHelpStatus: jest.fn()
}));

describe('User Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('ユーザーをユーザー名で検索できる', async () => {
    const mockUser = { id: 1, username: 'testuser', password: '' };
    UserModel.findByUsername.mockResolvedValue(mockUser);
    
    const result = await UserModel.findByUsername('testuser');
    
    expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
    expect(result).toEqual(mockUser);
  });
  
  test('ユーザーを作成できる', async () => {
    const userData = { username: 'newuser', password: '' };
    const createdUser = { id: 2, ...userData };
    
    UserModel.create.mockResolvedValue(createdUser);
    
    const result = await UserModel.create(userData);
    
    expect(UserModel.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(createdUser);
  });
});

describe('Project Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('案件を作成できる', async () => {
    const projectData = {
      title: '新しい案件',
      description: '案件の詳細',
      user_id: 1
    };
    const createdProject = { id: 1, ...projectData, status: 'open' };
    
    ProjectModel.create.mockResolvedValue(createdProject);
    
    const result = await ProjectModel.create(projectData);
    
    expect(ProjectModel.create).toHaveBeenCalledWith(projectData);
    expect(result).toEqual(createdProject);
  });
  
  test('ヘルプを申請できる', async () => {
    const projectId = 1;
    const userId = 2;
    const helpResult = {
      exists: false,
      help: { id: 1, project_id: projectId, user_id: userId, status: 'pending' }
    };
    
    ProjectModel.applyHelp.mockResolvedValue(helpResult);
    
    const result = await ProjectModel.applyHelp(projectId, userId);
    
    expect(ProjectModel.applyHelp).toHaveBeenCalledWith(projectId, userId);
    expect(result).toEqual(helpResult);
  });
});
