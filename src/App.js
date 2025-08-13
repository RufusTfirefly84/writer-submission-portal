import React, { useState } from 'react';
import { LogOut, Lock, Briefcase, User, Search, Database, Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState({
    writerName: '',
    writerEmail: '',
    writerPhone: '',
    availability: '',
    previousCredits: '',
    writingExperience: '',
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

    const overall = Math.floor((scores.genre_match + scores.tone_match + scores.dialogue_quality + 
                                scores.structure_score + scores.character_development + scores.experience_relevance) / 6);

    return {
      ...scores,
      overall_score: overall,
      detailed_analysis: {
        cv_highlights: "Strong background in television writing with relevant genre experience",
        script_strengths: "Excellent dialogue and character development. Strong narrative structure", 
        script_weaknesses: "Minor pacing issues in Act 2. Could benefit from more action sequences",
        genre_fit_reasoning: "Writer's previous work aligns well with project requirements",
        tone_fit_reasoning: "Writing style matches the desired tone and atmosphere",
        recommendation: overall >= 80 ? "RECOMMEND" : overall >= 65 ? "CONSIDER" : "PASS",
        marketability: "Strong market appeal with proven track record",
        unique_voice: "Distinctive writing voice that stands out in the genre"
      }
    };
  };

  const handleLogin = (e) => {
    e.preventDefault();
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
      writerPhone: '',
      availability: '',
      previousCredits: '',
      writingExperience: '',
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
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const analysis = generateMockAnalysis();

      const submissionData = {
        id: Date.now(),
        writerName: formData.writerName,
        agentName: currentAgent.name,
        agentCompany: currentAgent.agency,
        email: currentAgent.email,
        projectInterest: selectedProject.title,
        availability: formData.availability,
        pitch_summary: formData.pitch_summary,
        cv_file: formData.cv_file ? { name: formData.cv_file.name } : null,
        sample_script: formData.sample_script ? { name: formData.sample_script.name } : null,
        submission_date: new Date().toISOString().split('T')[0],
        analysis: {
          genre_match: analysis.genre_match,
          tone_match: analysis.tone_match,
          dialogue_quality: analysis.dialogue_quality,
          structure_score: analysis.structure_score,
          character_development: analysis.character_development,
          experience_relevance: analysis.experience_relevance
        },
        detailed_analysis: analysis.detailed_analysis,
        overall_score: analysis.overall_score,
        recommendation: analysis.detailed_analysis.recommendation,
        writerEmail: formData.writerEmail,
        writerPhone: formData.writerPhone,
        previousCredits: formData.previousCredits,
        writingExperience: formData.writingExperience
      };

      setSubmissions(prev => [...prev, submissionData]);
      addNotification('success', 'Submission completed successfully!');
      
      setFormData({
        writerName: '',
        writerEmail: '',
        writerPhone: '',
        availability: '',
        previousCredits: '',
        writingExperience: '',
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

  const getRecommendationStyle = (recommendation) => {
    switch (recommendation) {
      case 'RECOMMEND':
        return 'bg-green-100 text-green-800';
      case 'CONSIDER':
        return 'bg-yellow-100 text-yellow-800';
      case 'PASS':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  const NotificationBar = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm flex items-center ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'info' ? 'bg-blue-500 text-white' :
              'bg-yellow-500 text-white'
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
        <NotificationBar />
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
      <NotificationBar />
      
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
                            <p className="text-xs text-blue-600 mt-1">
                      Uploaded documents will be analyzed for genre fit, dialogue quality, and more.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveTab('assignments');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    ← Back to Assignments
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.writerName || !formData.pitch_summary}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition duration-200 ${
                      isSubmitting || !formData.writerName || !formData.pitch_summary
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                        Analyzing & Submitting...
                      </span>
                    ) : (
                      'Submit Writer'
                    )}
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
                  submissions
                    .filter(s => isAdmin || s.email === currentAgent.email)
                    .map(submission => (
                      <div key={submission.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationStyle(submission.recommendation)}`}>
                                  {submission.recommendation}
                                </span>
                              </div>
                              <p className="text-gray-600">Submitted by {submission.agentName} ({submission.agentCompany})</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                <span>Project: {submission.projectInterest}</span>
                                <span>Date: {submission.submission_date}</span>
                                {submission.availability && <span>Available: {submission.availability}</span>}
                                {submission.writerEmail && <span>Email: {submission.writerEmail}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-4xl font-bold ${getScoreColor(submission.overall_score)}`}>
                                {submission.overall_score}%
                              </div>
                              <p className="text-sm text-gray-500">Overall Match</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{submission.analysis.genre_match}%</div>
                              <p className="text-xs text-gray-500">Genre Match</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">{submission.analysis.tone_match}%</div>
                              <p className="text-xs text-gray-500">Tone Match</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{submission.analysis.dialogue_quality}%</div>
                              <p className="text-xs text-gray-500">Dialogue</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-orange-600">{submission.analysis.structure_score}%</div>
                              <p className="text-xs text-gray-500">Structure</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-red-600">{submission.analysis.character_development}%</div>
                              <p className="text-xs text-gray-500">Character Dev</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-indigo-600">{submission.analysis.experience_relevance}</div>
                              <p className="text-xs text-gray-500">Experience</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-between items-center">
                          <div className="flex gap-4 text-sm text-gray-600">
                            {submission.cv_file && (
                              <span>📄 CV: {submission.cv_file.name}</span>
                            )}
                            {submission.sample_script && (
                              <span>📝 Script: {submission.sample_script.name}</span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">AI Analysis: </span>
                            <span className="text-green-600 font-medium">Complete</span>
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">AI Analysis Highlights</h4>
                              <p className="text-sm text-gray-600 mb-3">{submission.detailed_analysis.cv_highlights}</p>
                              
                              <h4 className="font-semibold text-gray-800 mb-2">Script Strengths</h4>
                              <p className="text-sm text-gray-600">{submission.detailed_analysis.script_strengths}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                              <p className="text-sm text-gray-600 mb-3">{submission.detailed_analysis.script_weaknesses}</p>
                              
                              <h4 className="font-semibold text-gray-800 mb-2">Genre & Tone Fit</h4>
                              <p className="text-sm text-gray-600">{submission.detailed_analysis.genre_fit_reasoning}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-1">Recommendation Reasoning</h4>
                            <p className="text-sm text-blue-700">{submission.detailed_analysis.tone_fit_reasoning}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
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
                    Project management, user settings, and configuration options will be added in the next step.
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

export default App;-gray-900">{project.genre}</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Writer Phone</label>
                      <input
                        type="tel"
                        name="writerPhone"
                        value={formData.writerPhone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1-555-0123"
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
                        <option value="2025 Q3">2025 Q3</option>
                        <option value="2025 Q4">2025 Q4</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Credits & Experience</label>
                    <textarea
                      name="previousCredits"
                      value={formData.previousCredits}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="List relevant TV shows, films, or other writing credits..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Writing Experience Summary</label>
                    <textarea
                      name="writingExperience"
                      value={formData.writingExperience}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Years of experience, specializations, notable achievements..."
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
                      placeholder="Why is this writer perfect for this specific project? Include relevant experience, previous credits, writing style, and how they match the project requirements..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.pitch_summary.length}/1000 characters
                    </p>
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
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {formData.cv_file.name} ({Math.round(formData.cv_file.size / 1024)}KB)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 10MB)</p>
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
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {formData.sample_script.name} ({Math.round(formData.sample_script.size / 1024)}KB)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">PDF, FDX, Fountain, TXT (max 10MB)</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <div className="flex items-center text-blue-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">AI Analysis Enabled</span>
                    </div>
                    <p className="text
