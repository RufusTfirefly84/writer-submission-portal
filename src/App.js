import React, { useState } from 'react';
import { Upload, FileText, User, Briefcase, LogOut, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [submissions, setSubmissions] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState({
    writerName: '',
    availability: '',
    cv_file: null,
    sample_script: null,
    pitch_summary: ''
  });

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
      description: "Neo-noir crime series set in modern Detroit.",
      deadline: "2025-09-15",
      status: "Active",
      requirements: ["3+ years TV writing experience", "Crime/thriller background preferred"],
      priority: "High"
    }
  ];

  const isAdmin = currentAgent?.email === 'admin@playground.com';

  const addNotification = (type, message) => {
    const notification = { id: Date.now(), type, message };
    setNotifications(prev => [notification, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const agent = agents.find(a => a.email === loginData.email && a.password === loginData.password);
    
    if (agent) {
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      setLoginData({ email: '', password: '' });
      addNotification('success', `Welcome ${agent.name}!`);
    } else {
      addNotification('error', 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent(null);
    setActiveTab('assignments');
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('submit');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fileType]: file }));
      addNotification('success', `${file.name} uploaded`);
    }
  };

  const handleSubmit = () => {
    if (!formData.writerName || !formData.pitch_summary) {
      addNotification('error', 'Please fill required fields');
      return;
    }

    const submissionData = {
      id: Date.now(),
      writerName: formData.writerName,
      agentName: currentAgent.name,
      agentCompany: currentAgent.agency,
      projectInterest: selectedProject.title,
      pitch_summary: formData.pitch_summary,
      submission_date: new Date().toISOString().split('T')[0],
      overall_score: Math.floor(Math.random() * 40) + 60,
      recommendation: "CONSIDER"
    };

    setSubmissions(prev => [...prev, submissionData]);
    addNotification('success', 'Submission completed!');
    
    setFormData({
      writerName: '',
      availability: '',
      cv_file: null,
      sample_script: null,
      pitch_summary: ''
    });
    
    setSelectedProject(null);
    setActiveTab('dashboard');
  };

  const NotificationBar = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded shadow-lg flex items-center text-white ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? 
              <CheckCircle className="w-4 h-4 mr-2" /> : 
              <AlertCircle className="w-4 h-4 mr-2" />
            }
            <span className="text-sm">{notification.message}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <NotificationBar />
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Writer Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to access assignments</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="your@agency.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Demo: demo@agent.com / demo</p>
              <p>Admin: admin@playground.com / admin123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <NotificationBar />
      
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-indigo-600 text-white rounded-t-lg">
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
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <Briefcase className="inline w-4 h-4 mr-2" />
              Assignments
            </button>
            {selectedProject && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'submit'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <User className="inline w-4 h-4 mr-2" />
                Submit Writer
              </button>
            )}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'assignments' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Writing Assignments</h2>
              <div className="grid gap-6">
                {projects.map(project => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.genre} • {project.tone}</p>
                        <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded">
                        {project.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {project.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => selectProject(project)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
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
                <h2 className="text-xl font-bold text-indigo-900">Submitting for: {selectedProject.title}</h2>
                <p className="text-indigo-700">{selectedProject.genre}</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Writer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Writer Name *</label>
                      <input
                        type="text"
                        name="writerName"
                        value={formData.writerName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Availability</option>
                        <option value="Immediate">Immediate</option>
                        <option value="2-4 weeks">2-4 weeks</option>
                        <option value="1-2 months">1-2 months</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Pitch</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Summary *</label>
                    <textarea
                      name="pitch_summary"
                      value={formData.pitch_summary}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Why is this writer perfect for this project?"
                      required
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="inline w-4 h-4 mr-2" />
                        Upload CV/Resume
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'cv_file')}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      {formData.cv_file && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.cv_file.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="inline w-4 h-4 mr-2" />
                        Upload Sample Script
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.fdx,.fountain,.txt"
                        onChange={(e) => handleFileUpload(e, 'sample_script')}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      {formData.sample_script && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.sample_script.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveTab('assignments');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.writerName || !formData.pitch_summary}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                      !formData.writerName || !formData.pitch_summary
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Submit Writer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isAdmin ? 'All Submissions' : 'My Submissions'}
              </h2>

              <div className="space-y-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet. Submit a writer to get started!</p>
                  </div>
                ) : (
                  submissions.map(submission => (
                    <div key={submission.id} className="bg-white border rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                          <p className="text-gray-600">Submitted by {submission.agentName} ({submission.agentCompany})</p>
                          <p className="text-sm text-gray-500">Project: {submission.projectInterest}</p>
                          <p className="text-sm text-gray-500">Date: {submission.submission_date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-blue-600">{submission.overall_score}%</div>
                          <p className="text-sm text-gray-500">Overall Score</p>
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mt-2">
                            {submission.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
