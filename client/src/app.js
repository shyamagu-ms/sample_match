// APIのベースURL
const API_BASE_URL = 'http://localhost:3000/api';

// APIサービス
const apiService = {
  // 認証ヘッダーの取得
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // ログイン
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  },
  
  // ログアウト
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // 現在のユーザー情報を取得
  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeader()
      });
      return response.data.user;
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      throw error;
    }
  },

  // 案件一覧の取得
  async getProjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      return response.data.projects;
    } catch (error) {
      console.error('案件一覧取得エラー:', error);
      throw error;
    }
  },
  
  // ユーザーの案件一覧取得
  async getUserProjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/projects`, {
        headers: this.getAuthHeader()
      });
      return response.data.projects;
    } catch (error) {
      console.error('ユーザー案件一覧取得エラー:', error);
      throw error;
    }
  },
  
  // 案件の作成
  async createProject(projectData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, projectData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('案件作成エラー:', error);
      throw error;
    }
  },
  
  // ヘルプ申請
  async applyHelp(projectId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/help`, {}, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('ヘルプ申請エラー:', error);
      throw error;
    }
  },
  
  // ユーザーのヘルプ申請一覧取得
  async getUserHelps() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/helps`, {
        headers: this.getAuthHeader()
      });
      return response.data.helps;
    } catch (error) {
      console.error('ユーザーヘルプ申請一覧取得エラー:', error);
      throw error;
    }
  },
  
  // ユーザーのマッチング一覧取得
  async getUserMatches() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/matches`, {
        headers: this.getAuthHeader()
      });
      return response.data.matches;
    } catch (error) {
      console.error('ユーザーマッチング一覧取得エラー:', error);
      throw error;
    }
  },
  
  // 案件のヘルプ申請一覧取得
  async getProjectHelps(projectId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/helps`, {
        headers: this.getAuthHeader()
      });
      return response.data.helps;
    } catch (error) {
      console.error('案件ヘルプ申請一覧取得エラー:', error);
      throw error;
    }
  },
  
  // ヘルプ申請ステータス更新（マッチングなど）
  async updateHelpStatus(projectId, helpId, status) {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}/helps/${helpId}`, { status }, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('ヘルプステータス更新エラー:', error);
      throw error;
    }
  }
};

// コンポーネント: ログインフォーム
const LoginView = {
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>ビジネスマッチングアプリ</h1>
        <h2>ログイン</h2>
        <div class="form-group">
          <label for="username">ユーザー名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="ユーザー名を入力"
            @keyup.enter="login"
          >
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="パスワードを入力（初期設定は空でOK）"
            @keyup.enter="login"
          >
        </div>
        <button @click="login" :disabled="isLoading">
          {{ isLoading ? 'ログイン中...' : 'ログイン' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  `,
  data() {
    return {
      username: '',
      password: '',
      isLoading: false,
      error: ''
    };
  },
  methods: {
    async login() {
      if (!this.username) {
        this.error = 'ユーザー名を入力してください';
        return;
      }
      
      this.isLoading = true;
      this.error = '';
      
      try {
        await apiService.login(this.username, this.password);
        this.$router.push('/dashboard');
      } catch (error) {
        this.error = '認証に失敗しました。もう一度お試しください。';
        console.error('Login error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};

// コンポーネント: ダッシュボード
const DashboardView = {
  template: `
    <div v-if="isLoading">読み込み中...</div>
    <div v-else class="dashboard-container">
      <header class="app-header">
        <h1>ビジネスマッチング</h1>
        <div class="user-info">
          <span>{{ user.username }} さん</span>
          <button @click="logout" class="logout-btn">ログアウト</button>
        </div>
      </header>
      
      <div class="dashboard-content">
        <!-- タブメニュー -->
        <div class="tab-menu">
          <button 
            @click="activeTab = 'projects'" 
            :class="{ active: activeTab === 'projects' }"
          >
            案件一覧
          </button>
          <button 
            @click="activeTab = 'my-projects'" 
            :class="{ active: activeTab === 'my-projects' }"
          >
            自分の案件
          </button>
          <button 
            @click="activeTab = 'my-helps'" 
            :class="{ active: activeTab === 'my-helps' }"
          >
            申請した案件
          </button>
          <button 
            @click="activeTab = 'matches'" 
            :class="{ active: activeTab === 'matches' }"
          >
            マッチング
            <span v-if="matches.length > 0" class="badge">{{ matches.length }}</span>
          </button>
        </div>
        
        <!-- 案件一覧タブ -->
        <div v-if="activeTab === 'projects'" class="tab-content">
          <h2>案件一覧</h2>
          <div v-if="projects.length === 0" class="empty-state">
            表示できる案件がありません
          </div>
          <div v-else class="project-list">
            <div v-for="project in projects" :key="project.id" class="project-card">
              <div class="project-header">
                <h3>{{ project.title }}</h3>
                <span class="status-badge" :class="project.status">{{ project.status }}</span>
              </div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-meta">
                <span>作成者: {{ project.creator_name }}</span>
                <span>作成日: {{ formatDate(project.created_at) }}</span>
              </div>
              <button 
                @click="applyHelp(project.id)" 
                class="help-btn"
                :disabled="project.user_id === user.id"
              >
                ヘルプする
              </button>
            </div>
          </div>
        </div>
        
        <!-- 自分の案件タブ -->
        <div v-if="activeTab === 'my-projects'" class="tab-content">
          <h2>自分の案件</h2>
          <button @click="showCreateForm = true" class="create-btn">新規案件を投稿</button>
          
          <!-- 案件作成フォーム -->
          <div v-if="showCreateForm" class="create-form">
            <div class="form-header">
              <h3>新規案件の作成</h3>
              <button @click="showCreateForm = false" class="close-btn">×</button>
            </div>
            <div class="form-group">
              <label for="projectTitle">タイトル</label>
              <input type="text" id="projectTitle" v-model="newProject.title" placeholder="案件のタイトル">
            </div>
            <div class="form-group">
              <label for="projectDescription">詳細</label>
              <textarea id="projectDescription" v-model="newProject.description" placeholder="案件の詳細情報"></textarea>
            </div>
            <div class="form-actions">
              <button @click="createProject" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? '作成中...' : '作成する' }}
              </button>
            </div>
          </div>
          
          <div v-if="myProjects.length === 0" class="empty-state">
            表示できる案件がありません。新しい案件を投稿してみましょう。
          </div>
          <div v-else class="project-list">
            <div v-for="project in myProjects" :key="project.id" class="project-card">
              <div class="project-header">
                <h3>{{ project.title }}</h3>
                <span class="status-badge" :class="project.status">{{ project.status }}</span>
              </div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-meta">
                <span>作成日: {{ formatDate(project.created_at) }}</span>
              </div>
              <button @click="viewHelps(project.id)" class="view-helps-btn">
                ヘルプ申請を見る
              </button>
            </div>
          </div>
          
          <!-- ヘルプ申請表示モーダル -->
          <div v-if="showHelpsModal" class="modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3>ヘルプ申請一覧</h3>
                <button @click="showHelpsModal = false" class="close-btn">×</button>
              </div>
              <div class="modal-body">
                <div v-if="projectHelps.length === 0" class="empty-state">
                  ヘルプ申請はまだありません
                </div>
                <div v-else class="help-list">
                  <div v-for="help in projectHelps" :key="help.help_id" class="help-item">
                    <div class="help-info">
                      <span class="help-username">{{ help.username }}</span>
                      <span class="help-date">{{ formatDate(help.created_at) }}</span>
                      <span class="status-badge" :class="help.help_status">{{ help.help_status }}</span>
                    </div>
                    <div class="help-actions" v-if="help.help_status === 'pending'">
                      <button @click="updateHelpStatus(help.help_id, 'matched')" class="match-btn">
                        マッチング
                      </button>
                      <button @click="updateHelpStatus(help.help_id, 'rejected')" class="reject-btn">
                        拒否
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 申請した案件タブ -->
        <div v-if="activeTab === 'my-helps'" class="tab-content">
          <h2>申請した案件</h2>
          <div v-if="myHelps.length === 0" class="empty-state">
            ヘルプ申請した案件はありません
          </div>
          <div v-else class="project-list">
            <div v-for="help in myHelps" :key="help.help_id" class="project-card">
              <div class="project-header">
                <h3>{{ help.project_title }}</h3>
                <span class="status-badge" :class="help.help_status">{{ help.help_status }}</span>
              </div>
              <p class="project-description">{{ help.project_description }}</p>
              <div class="project-meta">
                <span>作成者: {{ help.username }}</span>
                <span>案件状態: {{ help.project_status }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- マッチングタブ -->
        <div v-if="activeTab === 'matches'" class="tab-content">
          <h2>マッチング</h2>
          <div v-if="matches.length === 0" class="empty-state">
            マッチングした案件はありません
          </div>
          <div v-else class="project-list">
            <div v-for="match in matches" :key="match.help_id" class="project-card matched">
              <div class="project-header">
                <h3>{{ match.project_title }}</h3>
                <span class="status-badge matched">マッチング済み</span>
              </div>
              <p class="project-description">{{ match.project_description }}</p>
              <div class="project-meta">
                <span>作成者: {{ match.username }}</span>
                <span>案件状態: {{ match.project_status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isLoading: true,
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      projects: [],
      myProjects: [],
      myHelps: [],
      matches: [],
      projectHelps: [],
      activeTab: 'projects',
      showCreateForm: false,
      showHelpsModal: false,
      currentProjectId: null,
      newProject: {
        title: '',
        description: ''
      },
      isSubmitting: false
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        // すべての必要なデータを取得
        const [projects, myProjects, myHelps, matches] = await Promise.all([
          apiService.getProjects(),
          apiService.getUserProjects(),
          apiService.getUserHelps(),
          apiService.getUserMatches()
        ]);
        
        this.projects = projects;
        this.myProjects = myProjects;
        this.myHelps = myHelps;
        this.matches = matches;
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP');
    },
    logout() {
      apiService.logout();
      this.$router.push('/login');
    },
    async createProject() {
      if (!this.newProject.title) {
        alert('タイトルを入力してください');
        return;
      }
      
      this.isSubmitting = true;
      try {
        await apiService.createProject(this.newProject);
        this.showCreateForm = false;
        this.newProject = { title: '', description: '' };
        // 自分の案件一覧を再取得
        this.myProjects = await apiService.getUserProjects();
        // 全体の案件一覧も更新
        this.projects = await apiService.getProjects();
      } catch (error) {
        console.error('案件作成エラー:', error);
        alert('案件の作成に失敗しました。もう一度お試しください。');
      } finally {
        this.isSubmitting = false;
      }
    },
    async applyHelp(projectId) {
      try {
        await apiService.applyHelp(projectId);
        alert('ヘルプ申請を送信しました');
        // 申請した案件一覧を再取得
        this.myHelps = await apiService.getUserHelps();
      } catch (error) {
        console.error('ヘルプ申請エラー:', error);
        alert('ヘルプ申請に失敗しました。もう一度お試しください。');
      }
    },
    async viewHelps(projectId) {
      this.currentProjectId = projectId;
      try {
        this.projectHelps = await apiService.getProjectHelps(projectId);
        this.showHelpsModal = true;
      } catch (error) {
        console.error('ヘルプ申請一覧取得エラー:', error);
        alert('ヘルプ申請一覧の取得に失敗しました。');
      }
    },
    async updateHelpStatus(helpId, status) {
      try {
        await apiService.updateHelpStatus(this.currentProjectId, helpId, status);
        // ヘルプ申請一覧を再取得
        this.projectHelps = await apiService.getProjectHelps(this.currentProjectId);
        alert(status === 'matched' ? 'マッチングしました' : '申請を拒否しました');
      } catch (error) {
        console.error('ヘルプステータス更新エラー:', error);
        alert('ステータスの更新に失敗しました。');
      }
    }
  }
};

// ルート定義
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/dashboard', 
    component: DashboardView,
    beforeEnter: (to, from, next) => {
      // 認証チェック（トークンがあるか）
      const token = localStorage.getItem('token');
      if (token) {
        next();
      } else {
        next('/login');
      }
    }
  }
];

// Vueルーターの初期化
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

// CSSスタイル
const appStyles = `
  * {
    box-sizing: border-box;
  }
  
  :root {
    --primary-color: #4CAF50;
    --primary-hover: #45a049;
    --danger-color: #f44336;
    --warning-color: #ff9800;
    --success-color: #4CAF50;
    --light-gray: #f2f2f2;
    --border-color: #ddd;
    --text-color: #333;
  }
  
  /* ログイン画面 */
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 20px;
    text-align: left;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
  }
  
  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: var(--primary-hover);
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    color: var(--danger-color);
    margin-top: 15px;
  }
  
  /* ダッシュボード画面 */
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .logout-btn {
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .logout-btn:hover {
    background-color: var(--light-gray);
  }
  
  /* タブメニュー */
  .tab-menu {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;
  }
  
  .tab-menu button {
    background: none;
    color: var(--text-color);
    border: none;
    padding: 12px 20px;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 16px;
    position: relative;
  }
  
  .tab-menu button.active {
    border-bottom: 3px solid var(--primary-color);
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: var(--danger-color);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  
  /* 案件リスト */
  .project-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .project-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .project-header h3 {
    margin: 0;
    flex: 1;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .status-badge.open {
    background-color: var(--success-color);
    color: white;
  }
  
  .status-badge.matched {
    background-color: var(--primary-color);
    color: white;
  }
  
  .status-badge.pending {
    background-color: var(--warning-color);
    color: white;
  }
  
  .status-badge.rejected {
    background-color: var(--danger-color);
    color: white;
  }
  
  .project-description {
    margin: 0;
    flex: 1;
    color: #666;
  }
  
  .project-meta {
    display: flex;
    justify-content: space-between;
    color: #888;
    font-size: 14px;
  }
  
  .help-btn, .view-helps-btn {
    width: 100%;
  }
  
  .help-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .create-btn {
    margin-bottom: 20px;
  }
  
  .empty-state {
    padding: 40px;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #888;
  }
  
  /* 案件作成フォーム */
  .create-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .form-header h3 {
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 20px;
    cursor: pointer;
    padding: 5px;
  }
  
  .close-btn:hover {
    color: var(--danger-color);
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
    min-height: 120px;
    resize: vertical;
  }
  
  .form-actions {
    text-align: right;
    margin-top: 20px;
  }
  
  /* モーダル */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .modal-header h3 {
    margin: 0;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  /* ヘルプ一覧 */
  .help-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .help-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--light-gray);
  }
  
  .help-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .help-username {
    font-weight: 500;
  }
  
  .help-date {
    color: #888;
    font-size: 14px;
  }
  
  .help-actions {
    display: flex;
    gap: 10px;
  }
  
  .match-btn {
    background-color: var(--success-color);
  }
  
  .reject-btn {
    background-color: var(--danger-color);
  }
  
  /* 特別なスタイル */
  .project-card.matched {
    border: 2px solid var(--primary-color);
  }
`;

// スタイルの適用
const styleElement = document.createElement('style');
styleElement.textContent = appStyles;
document.head.appendChild(styleElement);

// アプリケーションの初期化
const app = Vue.createApp({
  template: `<router-view></router-view>`
});

// ルーターのマウント
app.use(router);

// アプリケーションのマウント
app.mount('#app');
