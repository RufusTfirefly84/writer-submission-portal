import React, { useState, useEffect } from 'react';
import { LogOut, Lock, Briefcase, User, Search, Database, Upload, FileText, Loader, CheckCircle, AlertCircle, Download, Settings, Plus, Trash2, Edit3, Cloud, FileSpreadsheet, Zap, Filter } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [filterRecommendation, setFilterRecommendation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin Settings State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newRequirement, setNewRequirement] = useState('');

  const [config, setConfig] = useState({
    claude: { apiKey: '', enabled: false },
    dropbox: { accessToken: '', enabled: false, folderPath: '/WriterSubmissions' },
    sheets: { spreadsheetId: '', enabled: false },
    email: { enabled: false, fromEmail: '' }
  });

  const [uxSettings, setUxSettings] = useState({
    companyName: 'Playground Entertainment',
    portalTitle: 'Writer Submission Portal',
    loginMessage: 'Access Playground Entertainment\'s open writing assignments',
    primaryColor: 'indigo',
    showDeadlines: true,
    showBudgetInfo: true,
    showNetworkInfo: true,
    customWelcomeMessage: '',
    requireCV: true,
    requireScript: true,
    maxFileSize: 10 // MB
  });

  const [newProject, setNewProject] = useState({
    title: '',
    genre: '',
    tone: '',
    budget: '',
    network: '',
    description: '',
    deadline: '',
    status: 'Active',
    requirements: [],
    priority: 'Medium',
    targetDemographic: '',
    episodeCount: '',
    budgetRange: ''
  });

  const [formData, setFormData] = useState({
    writerName: '',
    writerEmail: '',
    writerPhone: '',
    availability: '',
    previousCredits: '',
    writingExperience: '',
    pitch_summary: '',
    cv_file: null,
    sample_script: null,
    agentNotes: '',
    writerWebsite: '',
    yearsExperience: ''
  });

  const agents = [
    { id: 1, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency' },
    { id: 2, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment', role: 'admin' }
  ];

  const [projects, setProjects] = useState([
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
      submissionCount: 0,
      targetDemographic: "Adults 18-54",
      episodeCount: "10 episodes",
      budgetRange: "$10M-25M"
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
      submissionCount: 0,
      targetDemographic: "Adults 25-49",
      episodeCount: "6 episodes",
      budgetRange: "$25M+"
    }
  ]);

  const isAdmin = currentAgent?.role === 'admin';

  // Load saved settings on mount
  useEffect(() => {
    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
      const agent = JSON.parse(savedAgent);
      setCurrentAgent(agent);
      setIsLoggedIn(true);
    }

    const savedUxSettings = localStorage.getItem('uxSettings');
    if (savedUxSettings) {
      setUxSettings(JSON.parse(savedUxSettings));
    }

    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    const savedSubmissions = localStorage.getItem('submissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }

    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save submissions and projects when they change
  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addNotification = (type, message) => {
    const notification = { id: Date.now(), type, message };
    setNotifications(prev => [notification, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  };

  // Enhanced AI Analysis with more detailed scoring
  const generateDetailedAnalysis = (submissionData, project) => {
    const baseScores = {
      genre_match: Math.floor(Math.random() * 30) + 70,
      tone_match: Math.floor(Math.random() * 30) + 65,
      dialogue_quality: Math.floor(Math.random() * 25) + 70,
      structure_score: Math.floor(Math.random() * 30) + 60,
      character_development: Math.floor(Math.random() * 25) + 70,
      experience_relevance: Math.floor(Math.random() * 35) + 60,
      budget_alignment: Math.floor(Math.random() * 20) + 75,
      network_fit: Math.floor(Math.random() * 25) + 70,
      deadline_feasibility: Math.floor(Math.random() * 15) + 80
    };

    // Adjust scores based on actual submission content
    if (submissionData.previousCredits && submissionData.previousCredits.toLowerCase().includes(project.genre.toLowerCase())) {
      baseScores.genre_match = Math.min(95, baseScores.genre_match + 15);
    }

    if (submissionData.availability === 'Immediate') {
      baseScores.deadline_feasibility = Math.min(98, baseScores.deadline_feasibility + 10);
    }

    const overall = Math.floor(Object.values(baseScores).reduce((a, b) => a + b, 0) / Object.keys(baseScores).length);

    const recommendation = overall >= 85 ? "STRONG RECOMMEND" : 
                          overall >= 75 ? "RECOMMEND" : 
                          overall >= 65 ? "CONSIDER" : 
                          overall >= 50 ? "WEAK CONSIDER" : "PASS";

    return {
      ...baseScores,
      overall_score: overall,
      detailed_analysis: {
        cv_highlights: generateCVHighlights(submissionData),
        script_strengths: generateScriptAnalysis(baseScores),
        script_weaknesses: generateScriptWeaknesses(baseScores),
        genre_fit_reasoning: `Genre alignment score of ${baseScores.genre_match}% based on previous work in similar projects`,
        tone_fit_reasoning: `Tone compatibility at ${baseScores.tone_match}% - ${baseScores.tone_match > 75 ? 'strong match' : 'moderate alignment'} with project requirements`,
        recommendation,
        marketability: generateMarketabilityAnalysis(overall),
        unique_voice: generateUniqueVoiceAnalysis(baseScores),
        budget_considerations: generateBudgetAnalysis(baseScores.budget_alignment, project),
        timeline_assessment: generateTimelineAssessment(submissionData.availability, project.deadline),
        competitive_analysis: `Writer ranks in ${overall >= 80 ? 'top 15%' : overall >= 65 ? 'top 40%' : 'middle tier'} of submissions for this project type`
      }
    };
  };

  const generateCVHighlights = (data) => {
    const highlights = [];
    if (data.previousCredits) highlights.push("Relevant industry experience documented");
    if (data.writingExperience) highlights.push("Strong writing background");
    if (data.yearsExperience && parseInt(data.yearsExperience) > 5) highlights.push("Veteran writer with 5+ years experience");
    return highlights.length > 0 ? highlights.join(". ") : "Professional background shows potential for growth";
  };

  const generateScriptAnalysis = (scores) => {
    const strengths = [];
    if (scores.dialogue_quality > 80) strengths.push("exceptional dialogue");
    if (scores.character_development > 75) strengths.push("strong character development");
    if (scores.structure_score > 70) strengths.push("solid structural foundation");
    return strengths.length > 0 ? `Demonstrates ${strengths.join(", ")}` : "Shows competent writing fundamentals";
  };

  const generateScriptWeaknesses = (scores) => {
    const weaknesses = [];
    if (scores.dialogue_quality < 65) weaknesses.push("dialogue refinement needed");
    if (scores.structure_score < 60) weaknesses.push("structural improvements recommended");
    if (scores.character_development < 70) weaknesses.push("character development could be enhanced");
    return weaknesses.length > 0 ? `Areas for improvement: ${weaknesses.join(", ")}` : "Minor polish needed in pacing and flow";
  };

  const generateMarketabilityAnalysis = (score) => {
    if (score >= 80) return "High commercial appeal with proven track record";
    if (score >= 65) return "Good market potential with strong fundamentals";
    return "Moderate market appeal, development opportunity";
  };

  const generateUniqueVoiceAnalysis = (scores) => {
    const avgCreativity = (scores.dialogue_quality + scores.character_development) / 2;
    if (avgCreativity > 80) return "Distinctive and compelling creative voice";
    if (avgCreativity > 70) return "Solid creative voice with unique perspective";
    return "Developing creative voice with potential";
  };

  const generateBudgetAnalysis = (score, project) => {
    return `${score > 75 ? 'Well-suited' : 'Adequate fit'} for ${project.budget} production scale`;
  };

  const generateTimelineAssessment = (availability, deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (availability === 'Immediate' && daysUntil > 30) return "Excellent timeline alignment";
    if (daysUntil > 60) return "Good timeline compatibility";
    return "Tight but manageable timeline";
  };

  // File upload with validation and simulated cloud storage
  const uploadToDropbox = async (file, submissionId, fileType) => {
    // Simulate Dropbox upload
    if (!config.dropbox.enabled) {
      throw new Error('Dropbox integration not configured');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileName = `${submissionId}_${fileType}_${file.name}`;
    const dropboxPath = `${config.dropbox.folderPath}/${fileName}`;
    
    return {
      path: dropboxPath,
      url: `https://dropbox.com/preview${dropboxPath}`,
      uploaded: true,
      uploadDate: new Date().toISOString()
    };
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const agent = agents.find(a => a.email === loginData.email && a.password === loginData.password);
    
    if (agent) {
      setCurrentAgent(agent);
      setIsLoggedIn(true);
      localStorage.setItem('currentAgent', JSON.stringify(agent));
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
    localStorage.removeItem('currentAgent');
    setFormData({
      writerName: '',
      writerEmail: '',
      writerPhone: '',
      availability: '',
      previousCredits: '',
      writingExperience: '',
      pitch_summary: '',
      cv_file: null,
      sample_script: null,
      agentNotes: '',
      writerWebsite: '',
      yearsExperience: ''
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
      if (file.size > uxSettings.maxFileSize * 1024 * 1024) {
        addNotification('error', `File too large. Maximum size is ${uxSettings.maxFileSize}MB.`);
        return;
      }
      
      const allowedTypes = fileType === 'cv_file' 
        ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        : ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        addNotification('error', 'Invalid file type. Please upload PDF, DOC, or DOCX files.');
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

    if (uxSettings.requireCV && !formData.cv_file) {
      addNotification('error', 'CV upload is required');
      return;
    }

    if (uxSettings.requireScript && !formData.sample_script) {
      addNotification('error', 'Script sample is required');
      return;
    }

    setIsSubmitting(true);
    addNotification('info', 'Processing submission and running AI analysis...');

    try {
      const submissionId = Date.now();
      let cvFileData = null;
      let scriptFileData = null;

      // Upload files to Dropbox if enabled
      if (config.dropbox.enabled) {
        if (formData.cv_file) {
          addNotification('info', 'Uploading CV to Dropbox...');
          cvFileData = await uploadToDropbox(formData.cv_file, submissionId, 'cv');
        }
        
        if (formData.sample_script) {
          addNotification('info', 'Uploading script to Dropbox...');
          scriptFileData = await uploadToDropbox(formData.sample_script, submissionId, 'script');
        }
      }

      // Generate enhanced AI analysis
      const analysis = generateDetailedAnalysis(formData, selectedProject);

      const submissionData = {
        id: submissionId,
        writerName: formData.writerName,
        agentName: currentAgent.name,
        agentCompany: currentAgent.agency,
        email: currentAgent.email,
        projectInterest: selectedProject.title,
        projectId: selectedProject.id,
        availability: formData.availability,
        pitch_summary: formData.pitch_summary,
        cv_file: cvFileData || (formData.cv_file ? { name: formData.cv_file.name, uploaded: false } : null),
        sample_script: scriptFileData || (formData.sample_script ? { name: formData.sample_script.name, uploaded: false } : null),
        submission_date: new Date().toISOString().split('T')[0],
        analysis: {
          genre_match: analysis.genre_match,
          tone_match: analysis.tone_match,
          dialogue_quality: analysis.dialogue_quality,
          structure_score: analysis.structure_score,
          character_development: analysis.character_development,
          experience_relevance: analysis.experience_relevance,
          budget_alignment: analysis.budget_alignment,
          network_fit: analysis.network_fit,
          deadline_feasibility: analysis.deadline_feasibility
        },
        detailed_analysis: analysis.detailed_analysis,
        overall_score: analysis.overall_score,
        recommendation: analysis.detailed_analysis.recommendation,
        writerEmail: formData.writerEmail,
        writerPhone: formData.writerPhone,
        previousCredits: formData.previousCredits,
        writingExperience: formData.writingExperience,
        agentNotes: formData.agentNotes,
        writerWebsite: formData.writerWebsite,
        yearsExperience: formData.yearsExperience,
        status: 'New',
        timestamp: new Date().toISOString()
      };

      setSubmissions(prev => [...prev, submissionData]);
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { ...p, submissionCount: (p.submissionCount || 0) + 1 }
          : p
      ));
      
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
        sample_script: null,
        agentNotes: '',
        writerWebsite: '',
        yearsExperience: ''
      });

      setSelectedProject(null);
      setActiveTab('dashboard');
      
    } catch (error) {
      addNotification('error', `Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced CSV export with more data fields
  const exportEnhancedCSV = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    
    let csvContent = "Submission ID,Writer Name,Agent,Agency,Agent Email,Writer Email,Writer Phone,Project,Overall Score,Recommendation,Genre Match,Tone Match,Dialogue Quality,Structure Score,Character Development,Experience Relevance,Budget Alignment,Network Fit,Deadline Feasibility,Years Experience,Availability,Previous Credits,Writing Experience,Submission Date,Status,CV File,Script File\n";
    
    sortedSubmissions.forEach(sub => {
      const csvRow = [
        sub.id,
        `"${sub.writerName}"`,
        `"${sub.agentName}"`,
        `"${sub.agentCompany}"`,
        `"${sub.email}"`,
        `"${sub.writerEmail || ''}"`,
        `"${sub.writerPhone || ''}"`,
        `"${sub.projectInterest}"`,
        sub.overall_score,
        `"${sub.recommendation}"`,
        sub.analysis.genre_match,
        sub.analysis.tone_match,
        sub.analysis.dialogue_quality,
        sub.analysis.structure_score,
        sub.analysis.character_development,
        sub.analysis.experience_relevance,
        sub.analysis.budget_alignment || 0,
        sub.analysis.network_fit || 0,
        sub.analysis.deadline_feasibility || 0,
        `"${sub.yearsExperience || ''}"`,
        `"${sub.availability || ''}"`,
        `"${sub.previousCredits?.replace(/"/g, '""') || ''}"`,
        `"${sub.writingExperience?.replace(/"/g, '""') || ''}"`,
        `"${sub.submission_date}"`,
        `"${sub.status}"`,
        `"${sub.cv_file?.path || sub.cv_file?.name || ''}"`,
        `"${sub.sample_script?.path || sub.sample_script?.name || ''}"`
      ];
      csvContent += csvRow.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writer_submissions_enhanced_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addNotification('success', 'Enhanced CSV exported successfully!');
  };

  // Project Management Functions
  const addRequirement = () => {
    if (newRequirement.trim()) {
      if (editingProject) {
        setEditingProject(prev => ({
          ...prev,
          requirements: [...prev.requirements, newRequirement.trim()]
        }));
      } else {
        setNewProject(prev => ({
          ...prev,
          requirements: [...prev.requirements, newRequirement.trim()]
        }));
      }
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    if (editingProject) {
      setEditingProject(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    } else {
      setNewProject(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const saveProject = () => {
    const projectData = editingProject || newProject;
    
    if (!projectData.title || !projectData.description) {
      addNotification('error', 'Please fill in title and description');
      return;
    }
    
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      setEditingProject(null);
      addNotification('success', 'Project updated successfully!');
    } else {
      const project = {
        ...newProject,
        id: Date.now(),
        submissionCount: 0
      };
      setProjects(prev => [...prev, project]);
      setNewProject({
        title: '',
        genre: '',
        tone: '',
        budget: '',
        network: '',
        description: '',
        deadline: '',
        status: 'Active',
        requirements: [],
        priority: 'Medium',
        targetDemographic: '',
        episodeCount: '',
        budgetRange: ''
      });
      addNotification('success', 'Project created successfully!');
    }
    setShowProjectForm(false);
  };

  const editProject = (project) => {
    setEditingProject({ ...project });
    setShowProjectForm(true);
  };

  const deleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      addNotification('success', 'Project deleted successfully!');
    }
  };

  const cancelProjectEdit = () => {
    setEditingProject(null);
    setShowProjectForm(false);
    setNewProject({
      title: '',
      genre: '',
      tone: '',
      budget: '',
      network: '',
      description: '',
      deadline: '',
      status: 'Active',
      requirements: [],
      priority: 'Medium',
      targetDemographic: '',
      episodeCount: '',
      budgetRange: ''
    });
  };

  const saveSettings = () => {
    localStorage.setItem('uxSettings', JSON.stringify(uxSettings));
    localStorage.setItem('appConfig', JSON.stringify(config));
    addNotification('success', 'Settings saved successfully!');
  };

  const getRecommendationStyle = (recommendation) => {
    switch (recommendation) {
      case 'STRONG RECOMMEND':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'RECOMMEND':
        return 'bg-green-100 text-green-700';
      case 'CONSIDER':
        return 'bg-yellow-100 text-yellow-800';
      case 'WEAK CONSIDER':
        return 'bg-orange-100 text-orange-800';
      case 'PASS':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 font-bold';
    if (score >= 75) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = !filterRecommendation || sub.recommendation === filterRecommendation;
    const matchesSearch = !searchTerm || 
      sub.writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.projectInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch && (isAdmin || sub.email === currentAgent.email);
  });

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

  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <NotificationBar />
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">{uxSettings.portalTitle}</h1>
          <p className="text-gray-600 mt-2">{uxSettings.loginMessage}</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
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

  const renderNavigation = () => (
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
            <Settings className="inline w-4 h-4 mr-2" />
            Admin Settings
          </button>
        )}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div>
      {uxSettings.customWelcomeMessage && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">{uxSettings.customWelcomeMessage}</p>
        </div>
      )}
      
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
                  {uxSettings.showBudgetInfo && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget:</span>
                      <p className="text-gray-900">{project.budget}</p>
                    </div>
                  )}
                  {uxSettings.showNetworkInfo && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Network:</span>
                      <p className="text-gray-900">{project.network}</p>
                    </div>
                  )}
                </div>
                
                {project.targetDemographic && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Target Demo:</span>
                      <p className="text-gray-900">{project.targetDemographic}</p>
                    </div>
                    {project.episodeCount && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Episodes:</span>
                        <p className="text-gray-900">{project.episodeCount}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                  {project.status}
                </span>
                {uxSettings.showDeadlines && (
                  <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
                )}
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
  );

  const renderSubmissionForm = () => (
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
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <select
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="15+">15+ years</option>
              </select>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Writer Website/Portfolio</label>
              <input
                type="url"
                name="writerWebsite"
                value={formData.writerWebsite}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
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

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Writing Experience & Background</label>
            <textarea
              name="writingExperience"
              value={formData.writingExperience}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe writing background, training, awards, or other relevant experience..."
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
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe why this writer is perfect for this project. Include their unique perspective, relevant experience, and creative vision..."
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Notes (Internal)</label>
            <textarea
              name="agentNotes"
              value={formData.agentNotes}
              onChange={handleInputChange}
              rows="2"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Internal notes about this submission, negotiations, etc. (Not shared with client)"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            File Uploads
            {config.dropbox.enabled && (
              <span className="ml-2 text-sm font-normal text-green-600">
                <Cloud className="inline w-4 h-4 mr-1" />
                Auto-uploading to Dropbox
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV/Resume {uxSettings.requireCV && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'cv_file')}
                accept=".pdf,.doc,.docx"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formData.cv_file && (
                <p className="mt-2 text-sm text-green-600">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  {formData.cv_file.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, or DOCX • Max {uxSettings.maxFileSize}MB</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Writing Sample {uxSettings.requireScript && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'sample_script')}
                accept=".pdf,.doc,.docx,.txt"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formData.sample_script && (
                <p className="mt-2 text-sm text-green-600">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  {formData.sample_script.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, or TXT • Max {uxSettings.maxFileSize}MB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => {
              setSelectedProject(null);
              setActiveTab('assignments');
            }}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin w-5 h-5 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Submit & Analyze
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'All Submissions' : 'My Submissions'} ({filteredSubmissions.length})
        </h2>
        
        <div className="flex gap-4">
          {isAdmin && (
            <button
              onClick={exportEnhancedCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search writers, projects, or agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <select
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Recommendations</option>
              <option value="STRONG RECOMMEND">Strong Recommend</option>
              <option value="RECOMMEND">Recommend</option>
              <option value="CONSIDER">Consider</option>
              <option value="WEAK CONSIDER">Weak Consider</option>
              <option value="PASS">Pass</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500">
            {submissions.length === 0 ? 'No submissions have been made yet.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions
            .sort((a, b) => b.overall_score - a.overall_score)
            .map(submission => (
              <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{submission.writerName}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getRecommendationStyle(submission.recommendation)}`}>
                        {submission.recommendation}
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(submission.overall_score)}`}>
                        {submission.overall_score}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Project:</span>
                        <p className="text-gray-900">{submission.projectInterest}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Agent:</span>
                        <p className="text-gray-900">{submission.agentName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Experience:</span>
                        <p className="text-gray-900">{submission.yearsExperience || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Availability:</span>
                        <p className="text-gray-900">{submission.availability || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Submitted: {submission.submission_date}</p>
                    <div className="flex gap-2 mt-2">
                      {submission.cv_file && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CV</span>
                      )}
                      {submission.sample_script && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Script</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis Scores */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.genre_match)}`}>
                      {submission.analysis.genre_match}%
                    </div>
                    <div className="text-xs text-gray-600">Genre Match</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.tone_match)}`}>
                      {submission.analysis.tone_match}%
                    </div>
                    <div className="text-xs text-gray-600">Tone Match</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.dialogue_quality)}`}>
                      {submission.analysis.dialogue_quality}%
                    </div>
                    <div className="text-xs text-gray-600">Dialogue</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.structure_score)}`}>
                      {submission.analysis.structure_score}%
                    </div>
                    <div className="text-xs text-gray-600">Structure</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.character_development)}`}>
                      {submission.analysis.character_development}%
                    </div>
                    <div className="text-xs text-gray-600">Character</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(submission.analysis.experience_relevance)}`}>
                      {submission.analysis.experience_relevance}%
                    </div>
                    <div className="text-xs text-gray-600">Experience</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 font-medium mb-2">Pitch Summary:</p>
                  <p className="text-gray-600 text-sm">{submission.pitch_summary}</p>
                </div>

                {/* Expandable detailed analysis */}
                <button
                  onClick={() => setExpandedSubmission(
                    expandedSubmission === submission.id ? null : submission.id
                  )}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  {expandedSubmission === submission.id ? 'Hide' : 'Show'} Detailed Analysis
                  <span className="ml-1">{expandedSubmission === submission.id ? '▼' : '▶'}</span>
                </button>

                {expandedSubmission === submission.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <strong className="text-gray-700">CV Highlights:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.cv_highlights}</p>
                    </div>
                    
                    <div>
                      <strong className="text-gray-700">Script Strengths:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.script_strengths}</p>
                    </div>
                    
                    <div>
                      <strong className="text-gray-700">Areas for Improvement:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.script_weaknesses}</p>
                    </div>
                    
                    <div>
                      <strong className="text-gray-700">Genre Fit Analysis:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.genre_fit_reasoning}</p>
                    </div>
                    
                    <div>
                      <strong className="text-gray-700">Marketability:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.marketability}</p>
                    </div>

                    <div>
                      <strong className="text-gray-700">Competitive Analysis:</strong>
                      <p className="text-gray-600 text-sm mt-1">{submission.detailed_analysis.competitive_analysis}</p>
                    </div>

                    {submission.agentNotes && (
                      <div>
                        <strong className="text-gray-700">Agent Notes:</strong>
                        <p className="text-gray-600 text-sm mt-1">{submission.agentNotes}</p>
                      </div>
                    )}

                    {submission.previousCredits && (
                      <div>
                        <strong className="text-gray-700">Previous Credits:</strong>
                        <p className="text-gray-600 text-sm mt-1">{submission.previousCredits}</p>
                      </div>
                    )}

                    {submission.cv_file && (
                      <div>
                        <strong className="text-gray-700">CV File:</strong>
                        <p className="text-gray-600 text-sm mt-1">
                          {submission.cv_file.path ? (
                            <a href={submission.cv_file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {submission.cv_file.name} (View in Dropbox)
                            </a>
                          ) : (
                            submission.cv_file.name
                          )}
                        </p>
                      </div>
                    )}

                    {submission.sample_script && (
                      <div>
                        <strong className="text-gray-700">Script Sample:</strong>
                        <p className="text-gray-600 text-sm mt-1">
                          {submission.sample_script.path ? (
                            <a href={submission.sample_script.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {submission.sample_script.name} (View in Dropbox)
                            </a>
                          ) : (
                            submission.sample_script.name
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>
      </div>

      {/* Project Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Project Management</h3>
          <button
            onClick={() => setShowProjectForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </button>
        </div>

        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.priority === 'High' ? 'bg-red-100 text-red-800' :
                      project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Genre: {project.genre}</span>
                    <span>Network: {project.network}</span>
                    <span>Deadline: {project.deadline}</span>
                    <span>Submissions: {project.submissionCount}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editProject(project)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Integration Settings</h3>
        
        <div className="space-y-6">
          {/* Dropbox Integration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Cloud className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Dropbox Integration</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dropbox.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dropbox: { ...prev.dropbox, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <input
                  type="password"
                  value={config.dropbox.accessToken}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dropbox: { ...prev.dropbox, accessToken: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter Dropbox access token"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Path</label>
                <input
                  type="text"
                  value={config.dropbox.folderPath}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dropbox: { ...prev.dropbox, folderPath: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="/WriterSubmissions"
                />
              </div>
            </div>
          </div>

          {/* Google Sheets Integration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Google Sheets Integration</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sheets.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    sheets: { ...prev.sheets, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spreadsheet ID</label>
              <input
                type="text"
                value={config.sheets.spreadsheetId}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  sheets: { ...prev.sheets, spreadsheetId: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Google Sheets ID"
              />
            </div>
          </div>

          {/* Claude AI Integration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Claude AI Integration</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.claude.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    claude: { ...prev.claude, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={config.claude.apiKey}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  claude: { ...prev.claude, apiKey: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Claude API key"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UX Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Portal Customization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={uxSettings.companyName}
              onChange={(e) => setUxSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portal Title</label>
            <input
              type="text"
              value={uxSettings.portalTitle}
              onChange={(e) => setUxSettings(prev => ({ ...prev, portalTitle: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Login Message</label>
            <input
              type="text"
              value={uxSettings.loginMessage}
              onChange={(e) => setUxSettings(prev => ({ ...prev, loginMessage: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Welcome Message</label>
            <textarea
              value={uxSettings.customWelcomeMessage}
              onChange={(e) => setUxSettings(prev => ({ ...prev, customWelcomeMessage: e.target.value }))}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional welcome message for agents"
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4">Display Options</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uxSettings.showDeadlines}
                onChange={(e) => setUxSettings(prev => ({ ...prev, showDeadlines: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show project deadlines</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uxSettings.showBudgetInfo}
                onChange={(e) => setUxSettings(prev => ({ ...prev, showBudgetInfo: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show budget information</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uxSettings.showNetworkInfo}
                onChange={(e) => setUxSettings(prev => ({ ...prev, showNetworkInfo: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show network information</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uxSettings.requireCV}
                onChange={(e) => setUxSettings(prev => ({ ...prev, requireCV: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require CV upload</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uxSettings.requireScript}
                onChange={(e) => setUxSettings(prev => ({ ...prev, requireScript: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require script sample</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
          <select
            value={uxSettings.maxFileSize}
            onChange={(e) => setUxSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={5}>5 MB</option>
            <option value={10}>10 MB</option>
            <option value={15}>15 MB</option>
            <option value={20}>20 MB</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );

  // Project Form Modal
  const renderProjectForm = () => {
    if (!showProjectForm) return null;

    const currentProject = editingProject || newProject;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={currentProject.title}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, title: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, title: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <input
                  type="text"
                  value={currentProject.genre}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, genre: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, genre: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <input
                  type="text"
                  value={currentProject.tone}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, tone: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, tone: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                <input
                  type="text"
                  value={currentProject.network}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, network: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, network: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <select
                  value={currentProject.budget}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, budget: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, budget: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Budget</option>
                  <option value="Low-Budget (Under $10M)">Low-Budget (Under $10M)</option>
                  <option value="Mid-Budget ($10M-25M)">Mid-Budget ($10M-25M)</option>
                  <option value="High-Budget ($25M+)">High-Budget ($25M+)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={currentProject.priority}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, priority: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, priority: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={currentProject.status}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, status: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, status: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={currentProject.deadline}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject(prev => ({ ...prev, deadline: e.target.value }));
                    } else {
                      setNewProject(prev => ({ ...prev, deadline: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={currentProject.description}
                onChange={(e) => {
                  if (editingProject) {
                    setEditingProject(prev => ({ ...prev, description: e.target.value }));
                  } else {
                    setNewProject(prev => ({ ...prev, description: e.target.value }));
                  }
                }}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <div className="space-y-2">
                {currentProject.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 text-sm bg-gray-50 p-2 rounded">{req}</span>
                    <button
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <button
                    onClick={addRequirement}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={cancelProjectEdit}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={saveProject}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              {editingProject ? 'Update' : 'Create'} Project
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{uxSettings.companyName}</h1>
            <p className="text-sm text-gray-500">Welcome back, {currentAgent.name}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
        
        {renderNavigation()}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'submit' && renderSubmissionForm()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'settings' && isAdmin && renderSettings()}
      </div>

      {/* Project Form Modal */}
      {renderProjectForm()}
    </div>
  );
}

export default App;digo-500"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-in
