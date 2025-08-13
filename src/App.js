import React, { useState } from 'react';
import { LogOut, Lock, Briefcase, User, Search, Database } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedProject, setSelectedProject] = useState(null);

  const agents = [
    { id: 1, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency' },
    { id: 2, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment', role: 'admin' }
  ];

  const projects = [
    {
      id: 1,
      title: "Dark Crime Drama",
      genre: "Crime Drama",
      tone: "Dark, Gritty",
      budget: "Mid-Budget ($10M-25M)",
      network: "Premium Cable",
      description: "Neo-noir crime series set in modern Detroit. Focus on corrupt police and organized crime with complex character arcs.",
      deadline: "2025-09-15",
      status: "Active",
      requirements: [
        "3+ years TV writing experience",
        "Crime/thriller background preferred", 
        "Available for 6-month commitment",
        "Writing sample required"
      ],
      priority: "High",
      submissionCount: 0
    },
    {
      id: 2,
      title: "Tech Thriller Limited Series",
      genre: "Thriller/Sci-Fi",
      tone: "Contemporary, Suspenseful",
      budget: "High-Budget ($25M+)",
      network: "Streaming Platform",
      description: "6-episode limited series about AI consciousness and corporate espionage in Silicon Valley. Explores themes of technology vs humanity.",
      deadline: "2025-08-30",
      status: "Active",
      requirements: [
        "Limited series experience",
        "Tech industry knowledge helpful",
        "Strong dialogue skills", 
        "Available immediately"
      ],
      priority: "Medium",
      submissionCount: 0
    },
    {
      id: 3,
      title: "Historical Romance Drama",
      genre: "Period Drama",
      tone: "Romantic, Epic",
      budget: "High-Budget ($30M+)",
      network: "Premium Streaming",
      description: "Multi-season epic set in 18th century England. Follows interconnected love stories across different social classes.",
      deadline: "2025-10-01",
      status: "Active",
      requirements: [
        "Period drama experience",
        "Strong character development skills",
        "Research capabilities",
        "Long-term availability"
      ],
      priority: "Medium",
      submissionCount: 0
    }
  ];

  const isAdmin = currentAgent?.role === 'admin';

  const handleLogin = (e) => {
    e.preventDefault();
    const agent = agents.find(a => a.email === loginData.email && a.password === loginData.password);
    
    if (agent) {
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      setLoginData({ email: '', password: '' });
    } else {
      alert('Invalid credentials. Try: demo@agent.com / demo');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent(null);
    setActiveTab('assignments');
    setSelectedProject(null);
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('submit');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Writer Portal</h1>
            <p className="text-gray-600 mt-2">Access Playground Entertainment's writing assignments</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your@agency.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Sign In
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p><strong>Agent:</strong> demo@agent.com / demo</p>
              <p><strong>Admin:</strong> admin@playground.com / admin123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 bg-indigo-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">Playground Entertainment</h1>
              <p className="text-indigo-200">Writer Submission Portal</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{currentAgent?.name}</p>
                <p className="text-indigo-200 text-sm">{currentAgent?.agency}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-lg flex items-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'assignments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="inline w-4 h-4 mr-2" />
              Open Assignments
            </button>
            
            {selectedProject && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'submit'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="inline w-4 h-4 mr-2" />
                Submit Writer
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              {isAdmin ? 'All Submissions' : 'My Submissions'}
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Database className="inline w-4 h-4 mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Open Writing Assignments</h2>
                <div className="text-sm text-gray-500">
                  {projects.filter(p => p.status === 'Active').length} active projects
                </div>
              </div>
              
              <div className="grid gap-6">
                {projects.filter(p => p.status === 'Active').map(project => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.priority === 'High' ? 'bg-red-100 text-red-800' :
                            project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {project.priority}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Genre:</span>
                            <p className="text-gray-900">{project.genre}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Tone:</span>
                            <p className="text-gray-900">{project.tone}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Budget:</span>
                            <p className="text-gray-900">{project.budget}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Network:</span>
                            <p className="text-gray-900">{project.network}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                          {project.status}
                        </span>
                        <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
                        <p className="text-sm text-blue-600 font-medium">{project.submissionCount} submissions</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {project.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => selectProject(project)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                    >
                      Submit Writer for This Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'submit' && selectedProject && (
            <div>
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h2 className="text-xl font-bold text-indigo-900 mb-2">Submitting for: {selectedProject.title}</h2>
                <p className="text-indigo-700">{selectedProject.genre} • {selectedProject.network}</p>
                <div className="flex items-center mt-2 text-sm text-indigo-600">
                  <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                    selectedProject.priority === 'High' ? 'bg-red-100 text-red-800' :
                    selectedProject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedProject.priority} Priority
                  </span>
                  <span>Deadline: {selectedProject.deadline}</span>
                </div>
              </div>
              
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Writer Submission Form</h3>
                <p className="text-gray-600 mb-6">
                  Ready to add the submission form for {selectedProject.title}
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-semibold text-yellow-800">Coming Next</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Writer submission form with file uploads will be added in the next step.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setActiveTab('assignments');
                  }}
                  className="mt-4 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ← Back to Assignments
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isAdmin ? 'All Submissions Dashboard' : 'My Submissions'}
              </h2>
              
              <div className="text-center py-12">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-blue-800 mb-2">Dashboard Coming Soon</h3>
                  <p className="text-blue-700 text-sm">
                    Submission tracking, analytics, and management features will be added next.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && isAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>
              
              <div className="text-center py-12">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-green-800 mb-2">Admin Panel Coming Soon</h3>
                  <p className="text-green-700 text-sm">
                    Project management, user settings, and configuration options will be added.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
