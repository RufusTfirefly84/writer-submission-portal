import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Briefcase, Download, Search, Database, LogOut, Lock } from 'lucide-react';

const WriterSubmissionPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [airtableConfig, setAirtableConfig] = useState({
    baseId: '',
    tableId: '',
    apiKey: ''
  });
  const [showConfig, setShowConfig] = useState(false);

  const agents = [
    { id: 1, email: 'agent@caa.com', password: 'demo123', name: 'Sarah Johnson', agency: 'CAA' },
    { id: 2, email: 'agent@wme.com', password: 'demo123', name: 'Mike Chen', agency: 'WME' },
    { id: 3, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency' },
    { id: 4, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment' }
  ];

  const projects = [
    {
      id: 1,
      title: "Dark Crime Drama",
      genre: "Crime Drama",
      tone: "Dark, Gritty",
      budget: "Mid-Budget",
      network: "Premium Cable",
      description: "Neo-noir crime series set in modern Detroit. Focus on corrupt police and organized crime.",
      deadline: "2025-09-15",
      status: "Active",
      requirements: ["3+ years TV writing experience", "Crime/thriller background preferred", "Available for 6-month commitment"]
    },
    {
      id: 2,
      title: "Tech Thriller Limited Series",
      genre: "Thriller/Sci-Fi",
      tone: "Contemporary, Suspenseful",
      budget: "High-Budget",
      network: "Streaming Platform",
      description: "6-episode limited series about AI consciousness and corporate espionage in Silicon Valley.",
      deadline: "2025-08-30",
      status: "Active",
      requirements: ["Limited series experience", "Tech industry knowledge helpful", "Strong dialogue skills"]
    }
  ];

  const [formData, setFormData] = useState({
    writerName: '',
    availability: '',
    cv_file: null,
    sample_script: null,
    pitch_summary: ''
  });

  useEffect(() => {
    const savedConfig = {
      baseId: localStorage.getItem('airtableBaseId') || '',
      tableId: localStorage.getItem('airtableTableId') || 'tblWriterSubmissions',
      apiKey: localStorage.getItem('airtableApiKey') || ''
    };
    setAirtableConfig(savedConfig);

    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
      setCurrentAgent(JSON.parse(savedAgent));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const agent = agents.find(a => a.email === loginData.email && a.password === loginData.password);
    
    if (agent) {
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      localStorage.setItem('currentAgent', JSON.stringify(agent));
      setLoginData({ email: '', password: '' });
    } else {
      alert('Invalid credentials. Try: demo@agent.com / demo or admin@playground.com / admin123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent(null);
    setSelectedProject(null);
    setActiveTab('assignments');
    localStorage.removeItem('currentAgent');
    setFormData({
      writerName: '',
      availability: '',
      cv_file: null,
      sample_script: null,
      pitch_summary: ''
    });
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('submit');
  };

  const saveAirtableConfig = () => {
    localStorage.setItem('airtableBaseId', airtableConfig.baseId);
    localStorage.setItem('airtableTableId', airtableConfig.tableId);
    localStorage.setItem('airtableApiKey', airtableConfig.apiKey);
    setShowConfig(false);
    alert('Airtable configuration saved!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const submitToAirtable = async (submissionData) => {
    if (!airtableConfig.baseId || !airtableConfig.apiKey) {
      throw new Error('Airtable configuration missing');
    }

    const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${airtableConfig.tableId}`;
    
    const airtableData = {
      records: [{
        fields: {
          "Writer Name": submissionData.writerName,
          "Agent Name": submissionData.agentName,
          "Agency": submissionData.agentCompany,
          "Email": submissionData.email,
          "Project": submissionData.projectInterest,
          "Availability": submissionData.availability || '',
          "Pitch Summary": submissionData.pitch_summary || '',
          "Submission Date": submissionData.submission_date,
          "Overall Score": submissionData.overall_score,
          "Genre Match": submissionData.analysis.genre_match,
          "Tone Match": submissionData.analysis.tone_match,
          "Dialogue Quality": submissionData.analysis.dialogue_quality,
          "Structure Score": submissionData.analysis.structure_score,
          "Character Development": submissionData.analysis.character_development,
          "Status": "New",
          "CV Filename": formData.cv_file ? formData.cv_file.name : '',
          "Script Filename": formData.sample_script ? formData.sample_script.name : ''
        }
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Airtable Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  };

  const handleSubmit = async () => {
    if (!formData.writerName || !selectedProject || !formData.pitch_summary) {
      alert('Please fill in Writer Name and Pitch Summary');
      return;
    }

    setIsSubmitting(true);

    try {
      const mockAnalysis = {
        genre_match: Math.floor(Math.random() * 30) + 70,
        tone_match: Math.floor(Math.random() * 30) + 65,
        dialogue_quality: Math.floor(Math.random() * 25) + 70,
        structure_score: Math.floor(Math.random() * 30) + 60,
        character_development: Math.floor(Math.random() * 25) + 70
      };

      const submissionData = {
        id: Date.now(),
        writerName: formData.writerName,
        agentName: currentAgent.name,
        agentCompany: currentAgent.agency,
        email: currentAgent.email,
        projectInterest: selectedProject.title,
        availability: formData.availability,
        pitch_summary: formData.pitch_summary,
        cv_file: formData.cv_file,
        sample_script: formData.sample_script,
        submission_date: new Date().toISOString().split('T')[0],
        analysis: mockAnalysis,
        overall_score: Math.floor((mockAnalysis.genre_match + mockAnalysis.tone_match + mockAnalysis.dialogue_quality + mockAnalysis.structure_score + mockAnalysis.character_development) / 5),
        projectId: selectedProject.id
      };

      if (airtableConfig.baseId && airtableConfig.apiKey) {
        await submitToAirtable(submissionData);
        alert('Successfully submitted! Thank you for your submission.');
      } else {
        alert('Submission recorded!');
      }

      setSubmissions(prev => [...prev, submissionData]);
      
      setFormData({
        writerName: '',
        availability: '',
        cv_file: null,
        sample_script: null,
        pitch_summary: ''
      });

      setSelectedProject(null);
      setActiveTab('dashboard');
      
    } catch (error) {
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReport = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    let csvContent = "Writer Name,Agent,Agency,Email,Project,Availability,Overall Score,Genre Match,Tone Match,Dialogue Quality,Structure Score,Character Development,Submission Date\n";
    sortedSubmissions.forEach(sub => {
      csvContent += `"${sub.writerName}","${sub.agentName}","${sub.agentCompany}","${sub.email}","${sub.projectInterest}","${sub.availability}",${sub.overall_score},${sub.analysis.genre_match},${sub.analysis.tone_match},${sub.analysis.dialogue_quality},${sub.analysis.structure_score},${sub.analysis.character_development},"${sub.submission_date}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writer_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isAdmin = currentAgent?.email === 'admin@playground.com';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Agent Portal</h1>
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
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
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
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
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
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
                onClick={() => setShowConfig(!showConfig)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  showConfig
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Database className="inline w-4 h-4 mr-2" />
                Admin Setup
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {showConfig && isAdmin && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Airtable Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Base ID</label>
                  <input
                    type="text"
                    value={airtableConfig.baseId}
                    onChange={(e) => setAirtableConfig(prev => ({ ...prev, baseId: e.target.value }))}
                    placeholder="app..."
                    className="w-full p-2 border border-blue-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Table ID</label>
                  <input
                    type="text"
                    value={airtableConfig.tableId}
                    onChange={(e) => setAirtableConfig(prev => ({ ...prev, tableId: e.target.value }))}
                    placeholder="tblWriterSubmissions"
                    className="w-full p-2 border border-blue-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={airtableConfig.apiKey}
                    onChange={(e) => setAirtableConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="pat..."
                    className="w-full p-2 border border-blue-300 rounded"
                  />
                </div>
              </div>
              <button
                onClick={saveAirtableConfig}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Configuration
              </button>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Writing Assignments</h2>
              <div className="grid gap-6">
                {projects.filter(p => p.status === 'Active').map(project => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
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
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {project.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">Deadline: {project.deadline}</p>
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
              </div>
              
              <div className="space-y-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="inline w-4 h-4 mr-2" />
                      Upload CV
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'cv_file')}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
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
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveTab('assignments');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back to Assignments
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                      isSubmitting 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Writer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              {isAdmin ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">All Submissions & Analysis</h2>
                    <button
                      onClick={generateReport}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export to Excel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-700">Total Submissions</h3>
                      <p className="text-2xl font-bold text-blue-900">{submissions.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-700">High Scores (80+)</h3>
                      <p className="text-2xl font-bold text-green-900">{submissions.filter(s => s.overall_score >= 80).length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-purple-700">Crime Drama</h3>
                      <p className="text-2xl font-bold text-purple-900">{submissions.filter(s => s.projectInterest === 'Dark Crime Drama').length}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-orange-700">Tech Thriller</h3>
                      <p className="text-2xl font-bold text-orange-900">{submissions.filter(s => s.projectInterest === 'Tech Thriller Limited Series').length}</p>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions
                        .sort((a, b) => b.overall_score - a.overall_score)
                        .map(submission => (
                          <div key={submission.id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                                <p className="text-gray-600">Submitted by {submission.agentName} ({submission.agentCompany})</p>
                                <p className="text-sm text-gray-500">Project: {submission.projectInterest}</p>
                                <p className="text-sm text-gray-500">Date: {submission.submission_date}</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${submission.overall_score >= 80 ? 'text-green-600' : submission.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {submission.overall_score}%
                                </div>
                                <p className="text-sm text-gray-500">Overall Match</p>
                                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                  submission.overall_score >= 80 ? 'bg-green-100 text-green-800' :
                                  submission.overall_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {submission.overall_score >= 80 ? 'Strong Match' : submission.overall_score >= 60 ? 'Potential' : 'Weak Match'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
                                <p className="text-xs text-gray-500">Dialogue Quality</p>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-orange-600">{submission.analysis.structure_score}%</div>
                                <p className="text-xs text-gray-500">Structure</p>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-red-600">{submission.analysis.character_development}%</div>
                                <p className="text-xs text-gray-500">Character Dev</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-gray-500">Availability:</span>
                                <p className="text-gray-700">{submission.availability || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Email:</span>
                                <p className="text-gray-700">{submission.email}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Files:</span>
                                <p className="text-gray-700">
                                  {submission.cv_file ? '✓ CV' : ''}
                                  {submission.cv_file && submission.sample_script ? ', ' : ''}
                                  {submission.sample_script ? '✓ Script' : ''}
                                  {!submission.cv_file && !submission.sample_script ? 'None' : ''}
                                </p>
                              </div>
                            </div>

                            {submission.pitch_summary && (
                              <div className="mt-4 p-3 bg-gray-50 rounded">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Pitch:</h4>
                                <p className="text-sm text-gray-700">{submission.pitch_summary}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Submissions</h2>
                  {submissions.filter(s => s.email === currentAgent?.email).length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions yet. Submit writers from the Open Assignments tab.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions
                        .filter(s => s.email === currentAgent?.email)
                        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
                        .map(submission => (
                          <div key={submission.id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                                <p className="text-gray-600">Project: {submission.projectInterest}</p>
                                <p className="text-sm text-gray-500">Submitted: {submission.submission_date}</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                  Under Review
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-gray-500">Availability:</span>
                                <p className="text-gray-700">{submission.availability || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Files Uploaded:</span>
                                <p className="text-gray-700">
                                  {submission.cv_file ? '✓ CV' : ''}
                                  {submission.cv_file && submission.sample_script ? ', ' : ''}
                                  {submission.sample_script ? '✓ Script Sample' : ''}
                                  {!submission.cv_file && !submission.sample_script ? 'None' : ''}
                                </p>
                              </div>
                            </div>

                            {submission.pitch_summary && (
                              <div className="mt-4 p-3 bg-gray-50 rounded">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Pitch:</h4>
                                <p className="text-sm text-gray-700">{submission.pitch_summary}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriterSubmissionPortal;
