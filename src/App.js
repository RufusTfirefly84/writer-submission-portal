import React, { useState } from 'react';
import { LogOut, Lock, Briefcase, User, Search, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const [formData, setFormData] = useState({
    writerName: '',
    writerEmail: '',
    availability: '',
    previousCredits: '',
    pitch_summary: '',
    cv_file: null,
    sample_script: null
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
      priority: "High"
    },
    {
      id: 2,
      title: "Tech Thriller Limited Series",
      genre: "Thriller/Sci-Fi",
      tone: "Contemporary, Suspenseful",
      budget: "High-Budget ($25M+)",
      network: "Streaming Platform",
      description: "6-episode limited series about AI consciousness and corporate espionage in Silicon Valley.",
      deadline: "2025-08-30",
      status: "Active",
      requirements: [
        "Limited series experience",
        "Tech industry knowledge helpful",
        "Strong dialogue skills", 
        "Available immediately"
      ],
      priority: "Medium"
    }
  ];

  const isAdmin = currentAgent?.role === 'admin';

  const addNotification = (type, message) => {
    const notification = { id: Date.now(), type, message };
    setNotifications(prev => [notification, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  };

  const generateMockAnalysis = () => {
    const scores = {
      genre_match: Math.floor(Math.random() * 30) + 70,
      tone_match: Math.floor(Math.random() * 30) + 65,
      dialogue_quality: Math.floor(Math.random() * 25) + 70,
      structure_score: Math.floor(Math.random() * 30) + 60,
      character_development: Math.floor(Math.random() * 25) + 70,
      experience_relevance: Math.floor(Math.random() * 35) + 60
    };

    const overall = Math.floor((scores.genre_match + scores.tone_match + scores.dialogue_quality + scores.structure_score + scores.character_development + scores.experience_relevance) / 6);

    return {
      ...scores,
      overall_score: overall,
      recommendation: overall >= 80 ? "RECOMMEND" : overall >= 65 ? "CONSIDER" : "PASS",
      strengths: "Excellent dialogue and character development. Strong narrative structure.",
      weaknesses: "Minor pacing issues in Act 2. Could benefit from more action sequences."
    };
  };

  const handleLogin = () => {
    const agent = agents.find(a => a.email === loginData.email && a.password === loginData.password);
    
    if (agent) {
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      setLoginData({ email: '', password: '' });
      addNotification('success', `Welcome back, ${agent.name}!`);
    } else {
      addNotification('error', 'Invalid credentials. Try: demo@agent.com / demo');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent(null);
    setActiveTab('assignments');
    setSelectedProject(null);
    setFormData({
      writerName: '',
      writerEmail: '',
      availability: '',
      previousCredits: '',
      pitch_summary: '',
      cv_file: null,
      sample_script: null
    });
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
      if (file.size > 10 * 1024 * 1024) {
        addNotification('error', 'File too large. Maximum size is 10MB.');
        return;
      }
      setFormData(prev => ({ ...prev, [fileType]: file }));
      addNotification('success', `${file.name} uploaded successfully`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.writerName || !selectedProject || !formData.pitch_summary) {
      addNotification('error', 'Please fill in Writer Name and Pitch Summary');
      return;
    }

    setIsSubmitting(true);
    addNotification('info', 'Processing submission and running AI analysis...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const analysis = generateMockAnalysis();

      const submissionData = {
        id: Date.now(),
        writerName: formData.writerName,
        agentName: currentAgent.name,
        agentCompany: currentAgent.agency,
        projectInterest: selectedProject.title,
        availability: formData.availability,
        pitch_summary: formData.pitch_summary,
        cv_file: formData.cv_file ? { name: formData.cv_file.name } : null,
        sample_script: formData.sample_script ? { name: formData.sample_script.name } : null,
        submission_date: new Date().toISOString().split('T')[0],
        analysis: analysis
      };

      setSubmissions(prev => [...prev, submissionData]);
      addNotification('success', 'Submission completed successfully!');
      
      setFormData({
        writerName: '',
        writerEmail: '',
        availability: '',
        previousCredits: '',
        pitch_summary: '',
        cv_file: null,
        sample_script: null
      });

      setSelectedProject(null);
      setActiveTab('dashboard');
      
    } catch (error) {
      addNotification('error', `Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const NotificationDisplay = () => {
    if (notifications.length === 0) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm flex items-center ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <Loader className="w-5 h-5 mr-2" />}
            <span className="text-sm">{notification.message}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <NotificationDisplay />
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Writer Portal</h1>
            <p className="text-gray-600 mt-2">Access Playground Entertainment's open writing assignments</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your@agency.com"
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
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Sign In
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p><strong>Agent:</strong> demo@agent.com / demo</p>
              <p><strong>Admin:</strong> admin@playground.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NotificationDisplay />
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Playground Entertainment</h1>
              <p className="text-sm text-gray-600">Welcome back, {currentAgent.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Genre:</span>
                          <p className="text-gray-900">{project.genre}</p>
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
          <div className="space-y-6">
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h2 className="text-xl font-bold text-indigo-900 mb-2">Submitting for: {selectedProject.title}</h2>
              <p className="text-indigo-700">{selectedProject.genre} • {selectedProject.network}</p>
              <p className="text-sm text-indigo-600 mt-2">Deadline: {selectedProject.deadline}</p>
            </div>
            
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Writer Email</label>
                  <input
                    type="email"
                    name="writerEmail"
                    value={formData.writerEmail}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="writer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Availability</option>
                    <option value="Immediate">Immediate</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="Post-current-project">After Current Project</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Credits</label>
                <textarea
                  name="previousCredits"
                  value={formData.previousCredits}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="List relevant TV shows, films, or other writing credits..."
                />
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Provide a compelling pitch for why this writer is perfect for this project..."
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">File Uploads</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CV/Resume</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'cv_file')}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    accept=".pdf,.doc,.docx"
                  />
                  {formData.cv_file && (
                    <p className="text-sm text-green-600 mt-1">✓ {formData.cv_file.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Writing Sample</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'sample_script')}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    accept=".pdf,.doc,.docx"
                  />
                  {formData.sample_script && (
                    <p className="text-sm text-green-600 mt-1">✓ {formData.sample_script.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('assignments')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
              >
                Back to Assignments
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Submit Writer'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'All Submissions' : 'My Submissions'}
              </h2>
              <div className="text-sm text-gray-500">
                {submissions.length} total submissions
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-500">Submit a writer to see their analysis here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions
                  .sort((a, b) => b.analysis.overall_score - a.analysis.overall_score)
                  .map(submission => (
                    <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{submission.writerName}</h3>
                          <p className="text-sm text-gray-600">
                            Project: {submission.projectInterest} | Agent: {submission.agentName}
                          </p>
                          <p className="text-xs text-gray-500">Submitted: {submission.submission_date}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            submission.analysis.overall_score >= 85 ? 'text-green-600' :
                            submission.analysis.overall_score >= 70 ? 'text-yellow-600' :
                            submission.analysis.overall_score >= 55 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {submission.analysis.overall_score}
                          </div>
                          <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                            submission.analysis.recommendation === 'RECOMMEND' ? 'bg-green-100 text-green-800' :
                            submission.analysis.recommendation === 'CONSIDER' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {submission.analysis.recommendation}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.genre_match}</div>
                          <div className="text-xs text-gray-500">Genre</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.tone_match}</div>
                          <div className="text-xs text-gray-500">Tone</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.dialogue_quality}</div>
                          <div className="text-xs text-gray-500">Dialogue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.structure_score}</div>
                          <div className="text-xs text-gray-500">Structure</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.character_development}</div>
                          <div className="text-xs text-gray-500">Character</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">{submission.analysis.experience_relevance}</div>
                          <div className="text-xs text-gray-500">Experience</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {expandedSubmission === submission.id ? 'Hide Details' : 'Show Details'}
                      </button>

                      {expandedSubmission === submission.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
                              <p className="text-sm text-gray-600">{submission.analysis.strengths}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                              <p className="text-sm text-gray-600">{submission.analysis.weaknesses}</p>
                            </div>
                          </div>
                          {submission.pitch_summary && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-800 mb-2">Pitch Summary</h4>
                              <p className="text-sm text-gray-600">{submission.pitch_summary}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
