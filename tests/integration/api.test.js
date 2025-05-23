const request = require('supertest');
const app = require('../../server/app');
const jwt = require('jsonwebtoken');
const UserModel = require('../../server/models/user');
const ProjectModel = require('../../server/models/project');

// UserModelとProjectModelをモック化
jest.mock('../../server/models/user');
jest.mock('../../server/models/project');

// JWT署名用のシークレットキー（server/routes/auth.jsと同じ値を使用）
const JWT_SECRET = 'sample_match_secret_key';

describe('認証API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('存在しないユーザーでログインすると新規ユーザーが作成される', async () => {
    const userData = { username: 'newuser', password: '' };
    const createdUser = { id: 1, ...userData };
    
    // findByUsernameはユーザーが見つからないことを示す
    UserModel.findByUsername.mockResolvedValue(null);
    // createは新しいユーザーを返す
    UserModel.create.mockResolvedValue(createdUser);
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('新規ユーザーが作成されました');
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.token).toBeDefined();
    
    expect(UserModel.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(UserModel.create).toHaveBeenCalledWith(userData);
  });
  
  test('既存のユーザーでログインするとトークンが返される', async () => {
    const userData = { username: 'existinguser', password: '' };
    const existingUser = { id: 2, ...userData };
    
    // findByUsernameは既存のユーザーを返す
    UserModel.findByUsername.mockResolvedValue(existingUser);
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(userData);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('ログイン成功');
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.token).toBeDefined();
    
    expect(UserModel.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(UserModel.create).not.toHaveBeenCalled();
  });
});

describe('案件API', () => {
  let token;
  const userId = 1;
  const username = 'testuser';
  
  beforeEach(() => {
    jest.clearAllMocks();
    // テスト用のJWTトークンを生成
    token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '1h' });
  });
  
  test('全ての案件を取得できる', async () => {
    const mockProjects = [
      { id: 1, title: '案件1', user_id: userId, status: 'open' },
      { id: 2, title: '案件2', user_id: 2, status: 'open' }
    ];
    
    ProjectModel.findAll.mockResolvedValue(mockProjects);
    
    const response = await request(app)
      .get('/api/projects');
    
    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual(mockProjects);
    expect(ProjectModel.findAll).toHaveBeenCalled();
  });
  
  test('認証済みユーザーが新しい案件を作成できる', async () => {
    const projectData = { title: '新しい案件', description: '詳細' };
    const createdProject = { id: 3, ...projectData, user_id: userId, status: 'open' };
    
    ProjectModel.create.mockResolvedValue(createdProject);
    
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(projectData);
    
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('案件が作成されました');
    expect(response.body.project).toEqual(createdProject);
    
    expect(ProjectModel.create).toHaveBeenCalledWith({
      title: projectData.title,
      description: projectData.description,
      user_id: userId,
      status: 'open'
    });
  });
  
  test('認証済みユーザーが案件にヘルプを申請できる', async () => {
    const projectId = 2;
    const mockProject = { id: projectId, title: '案件2', user_id: 2, status: 'open' };
    const helpResult = {
      exists: false,
      help: { id: 1, project_id: projectId, user_id: userId, status: 'pending' }
    };
    
    ProjectModel.findById.mockResolvedValue(mockProject);
    ProjectModel.applyHelp.mockResolvedValue(helpResult);
    
    const response = await request(app)
      .post(`/api/projects/${projectId}/help`)
      .set('Authorization', `Bearer ${token}`)
      .send();
    
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('ヘルプ申請が送信されました');
    
    expect(ProjectModel.findById).toHaveBeenCalledWith(projectId.toString());
    expect(ProjectModel.applyHelp).toHaveBeenCalledWith(projectId.toString(), userId);
  });
});
