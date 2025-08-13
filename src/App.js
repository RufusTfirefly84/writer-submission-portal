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
  const [showUXConfig, setShowUXConfig] = useState(false);
  const [showProjectConfig, setShowProjectConfig] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    genre: '',
    tone: '',
    budget: '',
    network: '',
    description: '',
    deadline: '',
    status: 'Active',
    requirements: []
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [uxSettings, setUxSettings] = useState({
    companyName: 'Playground Entertainment',
    portalTitle: 'Writer Submission Portal',
    loginMessage: 'Access writing assignments',
    primaryColor: 'indigo',
    showDeadlines: true,
    showBudgetInfo: true,
    showNetworkInfo: true,
    showRequirements: true,
    customWelcomeMessage: '',
    footerText: ''
  });
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall_score');
  const [expandedAnalysis, setExpandedAnalysis] = useState({});

  const agents = [
    { id: 1, email: 'agent@caa.com', password: 'demo123', name: 'Sarah Johnson', agency: 'CAA' },
    { id: 2, email: 'agent@wme.com', password: 'demo123', name: 'Mike Chen', agency: 'WME' },
    { id: 3, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency' },
    { id: 4, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment' }
  ];

  const [projects, setProjects] = useState([
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
  ]);

  const [formData, setFormData] = useState({
    writerName: '',
    availability: '',
    cv_file: null,
    sample_script: null,
    pitch_summary: ''
  });

  const getColorClasses = (color) => {
    const colorMap = {
      indigo: {
        bg: 'bg-indigo-600',
        bgHover: 'bg-indigo-700',
        text: 'text-indigo-600',
        textLight: 'text-indigo-200',
        border: 'border-indigo-500'
      },
      blue: {
        bg: 'bg-blue-600',
        bgHover: 'bg-blue-700',
        text: 'text-blue-600',
        textLight: 'text-blue-200',
        border: 'border-blue-500'
      },
      purple: {
        bg: 'bg-purple-600',
        bgHover: 'bg-purple-700',
        text: 'text-purple-600',
        textLight: 'text-purple-200',
        border: 'border-purple-500'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  const isAdmin = currentAgent && currentAgent.email === 'admin@playground.com';
  const colors = getColorClasses(uxSettings.primaryColor);

  const loadSubmissionsFromAirtable = async () => {
    if (!airtableConfig.baseId || !airtableConfig.apiKey) {
      return;
    }

    try {
      const url = 'https://api.airtable.com/v0/' + airtableConfig.baseId + '/' + airtableConfig.tableId;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + airtableConfig.apiKey,
        },
      });

      if (!response.ok) {
        console.error('Failed to load submissions from Airtable:', response.status);
        return;
      }

      const data = await response.json();
      
      const airtableSubmissions = data.records.map(record => {
        const fields = record.fields;
        return {
          id: record.id,
          writerName: fields["Writer Name"] || '',
          agentName: fields["Agent Name"] || '',
          agentCompany: fields["Agency"] || '',
          email: fields["Email"] || '',
          projectInterest: fields["Project"] || '',
          availability: fields["Availability"] || '',
          pitch_summary: fields["Pitch Summary"] || '',
          submission_date: fields["Submission Date"] || '',
          overall_score: fields["Overall Score"] || 0,
          recommendation: fields["Recommendation"] || 'CONSIDER',
          analysis: {
            genre_match: fields["Genre Match"] || 0,
            tone_match: fields["Tone Match"] || 0,
            dialogue_quality: fields["Dialogue Quality"] || 0,
            structure_score: fields["Structure Score"] || 0,
            character_development: fields["Character Development"] || 0,
            experience_relevance: fields["Experience Relevance"] || 0
          },
          detailed_analysis: {
            cv_highlights: fields["CV Highlights"] || '',
            script_strengths: fields["Script Strengths"] || '',
            script_weaknesses: fields["Script Weaknesses"] || '',
            genre_fit_reasoning: fields["Genre Fit Reasoning"] || '',
            tone_fit_reasoning: fields["Tone Fit Reasoning"] || ''
          },
          cv_file: fields["CV Filename"] ? { name: fields["CV Filename"] } : null,
          sample_script: fields["Script Filename"] ? { name: fields["Script Filename"] } : null,
          projectId: 1
        };
      });

      setSubmissions(airtableSubmissions);
      console.log('Loaded ' + airtableSubmissions.length + ' submissions from Airtable');

    } catch (error) {
      console.error('Error loading submissions from Airtable:', error);
    }
  };

  const refreshSubmissions = async () => {
    if (isAdmin) {
      await loadSubmissionsFromAirtable();
      alert('Submissions refreshed from Airtable!');
    }
  };

  useEffect(() => {
    const savedConfig = {
      baseId: localStorage.getItem('airtableBaseId') || '',
      tableId: localStorage.getItem('airtableTableId') || 'tblWriterSubmissions',
      apiKey: localStorage.getItem('airtableApiKey') || ''
    };
    setAirtableConfig(savedConfig);

    const savedUxSettings = localStorage.getItem('uxSettings');
    if (savedUxSettings) {
      setUxSettings(JSON.parse(savedUxSettings));
    }

    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
      const agent = JSON.parse(savedAgent);
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      
      if (agent.email === 'admin@playground.com' && savedConfig.baseId && savedConfig.apiKey) {
        setTimeout(() => loadSubmissionsFromAirtable(), 500);
      }
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
      
      if (agent.email === 'admin@playground.com' && airtableConfig.baseId && airtableConfig.apiKey) {
        setTimeout(() => loadSubmissionsFromAirtable(), 500);
      }
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

  const saveUxSettings = () => {
    localStorage.setItem('uxSettings', JSON.stringify(uxSettings));
    setShowUXConfig(false);
    alert('UX settings saved!');
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
        cv_highlights: "Demo analysis - upload CV for detailed evaluation",
        script_strengths: "Demo analysis - upload script for detailed evaluation", 
        script_weaknesses: "Demo analysis - upload script for detailed evaluation",
        genre_fit_reasoning: "Demo analysis - upload files for AI evaluation",
        tone_fit_reasoning: "Demo analysis - upload files for AI evaluation",
        recommendation: overall >= 80 ? "RECOMMEND" : overall >= 65 ? "CONSIDER" : "PASS"
      }
    };
  };

  const handleSubmit = async () => {
    if (!formData.writerName || !selectedProject || !formData.pitch_summary) {
      alert('Please fill in Writer Name and Pitch Summary');
      return;
    }

    setIsSubmitting(true);

    try {
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
        cv_file: formData.cv_file,
        sample_script: formData.sample_script,
        submission_date: new Date().toISOString().split('T')[0],
        analysis: {
          genre_match: analysis.genre_match,
          tone_match: analysis.tone_match,
          dialogue_quality: analysis.dialogue_quality,
          structure_score: analysis.structure_score,
          character_development: analysis.character_development,
          experience_relevance: analysis.experience_relevance || 70
        },
        detailed_analysis: analysis.detailed_analysis || {},
        overall_score: analysis.overall_score,
        projectId: selectedProject.id,
        recommendation: analysis.detailed_analysis && analysis.detailed_analysis.recommendation ? analysis.detailed_analysis.recommendation : "CONSIDER"
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
      alert('Submission failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitToAirtable = async (submissionData) => {
    if (!airtableConfig.baseId || !airtableConfig.apiKey) {
      throw new Error('Airtable configuration missing');
    }

    const url = 'https://api.airtable.com/v0/' + airtableConfig.baseId + '/' + airtableConfig.tableId;
    
    const fields = {
      "Writer Name": submissionData.writerName,
      "Agent Name": submissionData.agentName,
      "Agency": submissionData.agentCompany,
      "Email": submissionData.email,
      "Project": submissionData.projectInterest,
      "Submission Date": submissionData.submission_date,
      "Overall Score": submissionData.overall_score,
      "Genre Match": submissionData.analysis.genre_match,
      "Tone Match": submissionData.analysis.tone_match,
      "Dialogue Quality": submissionData.analysis.dialogue_quality,
      "Structure Score": submissionData.analysis.structure_score,
      "Character Development": submissionData.analysis.character_development,
      "Status": "New"
    };

    if (submissionData.availability) {
      fields["Availability"] = submissionData.availability;
    }
    
    if (submissionData.pitch_summary) {
      fields["Pitch Summary"] = submissionData.pitch_summary;
    }

    if (submissionData.analysis.experience_relevance) {
      fields["Experience Relevance"] = submissionData.analysis.experience_relevance;
    }

    if (submissionData.recommendation && ['RECOMMEND', 'CONSIDER', 'PASS'].includes(submissionData.recommendation)) {
      fields["Recommendation"] = submissionData.recommendation;
    }

    if (submissionData.detailed_analysis) {
      if (submissionData.detailed_analysis.cv_highlights) {
        fields["CV Highlights"] = submissionData.detailed_analysis.cv_highlights;
      }
      if (submissionData.detailed_analysis.script_strengths) {
        fields["Script Strengths"] = submissionData.detailed_analysis.script_strengths;
      }
      if (submissionData.detailed_analysis.script_weaknesses) {
        fields["Script Weaknesses"] = submissionData.detailed_analysis.script_weaknesses;
      }
    }

    if (formData.cv_file) {
      fields["CV Filename"] = formData.cv_file.name;
    }
    if (formData.sample_script) {
      fields["Script Filename"] = formData.sample_script.name;
    }

    const airtableData = {
      records: [{
        fields: fields
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + airtableConfig.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error('Airtable Error: ' + (error.error && error.error.message ? error.error.message : 'Unknown error'));
    }

    return response.json();
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

  const toggleAnalysisDetails = (submissionId) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  const generateReport = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    let csvContent = "Writer Name,Agent,Agency,Email,Project,Overall Score,Recommendation,Submission Date\n";
    sortedSubmissions.forEach(sub => {
      csvContent += '"' + sub.writerName + '","' + sub.agentName + '","' + sub.agentCompany + '","' + sub.email + '","' + sub.projectInterest + '",' + sub.overall_score + ',"' + (sub.recommendation || 'CONSIDER') + '","' + sub.submission_date + '"\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writer_submissions_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Agent Portal</h1>
            <p className="text-gray-600 mt-2">{uxSettings.loginMessage}</p>
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
              className={"w-full " + colors.bg + " text-white py-3 px-6 rounded-lg hover:" + colors.bgHover + " transition duration-200 font-medium"}
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
        <div className={"border-b border-gray-200 " + colors.bg + " text-white rounded-t-lg"}>
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">{uxSettings.companyName}</h1>
              <p className={colors.textLight}>{uxSettings.portalTitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{currentAgent && currentAgent.name}</p>
                <p className={colors.textLight + " text-sm"}>{currentAgent && currentAgent.agency}</p>
              </div>
              <button
                onClick={handleLogout}
                className={colors.bgHover + " hover:" + colors.bgHover + " px-3 py-2 rounded-lg flex items-center"}
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
              className={"py-4 px-2 border-b-2 font-medium text-sm " + (
                activeTab === 'assignments'
                  ? colors.border + " " + colors.text
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Briefcase className="inline w-4 h-4 mr-2" />
              Open Assignments
            </button>
            {selectedProject && (
              <button
                onClick={() => setActiveTab('submit')}
                className={"py-4 px-2 border-b-2 font-medium text-sm " + (
                  activeTab === 'submit'
                    ? colors.border + " " + colors.text
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <User className="inline w-4 h-4 mr-2" />
                Submit Writer
              </button>
            )}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={"py-4 px-2 border-b-2 font-medium text-sm " + (
                activeTab === 'dashboard'
                  ? colors.border + " " + colors.text
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Search className="inline w-4 h-4 mr-2" />
              {isAdmin ? 'All Submissions' : 'My Submissions'}
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={"py-4 px-2 border-b-2 font-medium text-sm " + (
                  showConfig
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Database className="inline w-4 h-4 mr-2" />
                Database Setup
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
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
                      className={colors.bg + " text-white px-6 py-2 rounded-lg hover:" + colors.bgHover + " transition duration-200 font-medium"}
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
                    className={"flex-1 py-3 px-6 rounded-lg font-medium " + (
                      isSubmitting 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : colors.bg + " text-white hover:" + colors.bgHover
                    )}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Writer'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {activeTab === 'dashboard' && (
            <div>
              {isAdmin ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">All Submissions</h2>
                    <div className="flex gap-3">
                      <button
                        onClick={refreshSubmissions}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Refresh from Airtable
                      </button>
                      <button
                        onClick={generateReport}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-700">Total Submissions</h3>
                      <p className="text-2xl font-bold text-blue-900">{submissions.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-700">Recommended</h3>
                      <p className="text-2xl font-bold text-green-900">
                        {submissions.filter(s => s.recommendation === 'RECOMMEND').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-yellow-700">Consider</h3>
                      <p className="text-2xl font-bold text-yellow-900">
                        {submissions.filter(s => s.recommendation === 'CONSIDER').length}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-red-700">Pass</h3>
                      <p className="text-2xl font-bold text-red-900">
                        {submissions.filter(s => s.recommendation === 'PASS').length}
                      </p>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions yet. Click "Refresh from Airtable" if you have existing submissions.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {submissions.map(submission => (
                        <div key={submission.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                                  <span className={"px-3 py-1 rounded-full text-sm font-medium " + getRecommendationStyle(submission.recommendation)}>
                                    {submission.recommendation}
                                  </span>
                                </div>
                                <p className="text-gray-600">Submitted by {submission.agentName} ({submission.agentCompany})</p>
                                <div className="flex gap-6 text-sm text-gray-500 mt-1">
                                  <span>Project: {submission.projectInterest}</span>
                                  <span>Date: {submission.submission_date}</span>
                                  {submission.availability && <span>Available: {submission.availability}</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={"text-4xl font-bold " + getScoreColor(submission.overall_score)}>
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
                                <div className="text-lg font-semibold text-indigo-600">{submission.analysis.experience_relevance || 'N/A'}</div>
                                <p className="text-xs text-gray-500">Experience</p>
                              </div>
                            </div>
                          </div>

                          {submission.detailed_analysis && (
                            <div className="p-6 bg-gray-50">
                              <button
                                onClick={() => toggleAnalysisDetails(submission.id)}
                                className="flex items-center justify-between w-full text-left"
                              >
                                <h4 className="text-lg font-semibold text-gray-800">Detailed Analysis</h4>
                                <span className="text-gray-500">
                                  {expandedAnalysis[submission.id] ? '▼' : '▶'}
                                </span>
                              </button>

                              {expandedAnalysis[submission.id] && (
                                <div className="mt-4 space-y-4">
                                  {submission.detailed_analysis.cv_highlights && (
                                    <div className="bg-white p-4 rounded-lg">
                                      <h5 className="font-semibold text-blue-800 mb-2">CV Highlights</h5>
                                      <p className="text-sm text-gray-700">{submission.detailed_analysis.cv_highlights}</p>
                                    </div>
                                  )}

                                  {submission.detailed_analysis.script_strengths && (
                                    <div className="bg-white p-4 rounded-lg">
                                      <h5 className="font-semibold text-green-800 mb-2">Script Strengths</h5>
                                      <p className="text-sm text-gray-700">{submission.detailed_analysis.script_strengths}</p>
                                    </div>
                                  )}

                                  {submission.detailed_analysis.script_weaknesses && (
                                    <div className="bg-white p-4 rounded-lg">
                                      <h5 className="font-semibold text-orange-800 mb-2">Areas for Improvement</h5>
                                      <p className="text-sm text-gray-700">{submission.detailed_analysis.script_weaknesses}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {submission.pitch_summary && (
                            <div className="p-6 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Pitch:</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{submission.pitch_summary}</p>
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
                  {submissions.filter(s => s.email === (currentAgent && currentAgent.email)).length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions yet. Submit writers from the Open Assignments tab.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions
                        .filter(s => s.email === (currentAgent && currentAgent.email))
                        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
                        .map(submission => (
                          <div key={submission.id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{submission.writerName}</h3>
                                <p className="text-gray-600">Project: {submission.projectInterest}</p>
                                <p className="text-sm text-gray-500">Submitted: {submission.submission_date}</p>
                                {submission.overall_score && (
                                  <p className="text-sm font-medium text-indigo-600 mt-1">
                                    Analysis Score: {submission.overall_score}%
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={"inline-block text-sm px-3 py-1 rounded-full " + (
                                  submission.recommendation === 'RECOMMEND' ? 'bg-green-100 text-green-800' :
                                  submission.recommendation === 'CONSIDER' ? 'bg-yellow-100 text-yellow-800' :
                                  submission.recommendation === 'PASS' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                )}>
                                  {submission.recommendation || 'Under Review'}
                                </span>
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
