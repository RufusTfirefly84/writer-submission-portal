import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Briefcase, Download, Search, Database, LogOut, Lock, Mail, AlertCircle, CheckCircle, Loader, Settings, Users, BarChart3 } from 'lucide-react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Enhanced configuration state
  const [config, setConfig] = useState({
    airtable: {
      baseId: '',
      tableId: '',
      apiKey: ''
    },
    claude: {
      apiKey: '',
      enabled: false
    },
    email: {
      enabled: false,
      smtpHost: '',
      smtpPort: '587',
      username: '',
      password: '',
      fromEmail: ''
    },
    cloudinary: {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      enabled: false
    }
  });
  
  const [showConfig, setShowConfig] = useState(false);
  const [showUXConfig, setShowUXConfig] = useState(false);
  const [showProjectConfig, setShowProjectConfig] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
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
    loginMessage: 'Access Playground Entertainment\'s open writing assignments',
    primaryColor: 'indigo',
    showDeadlines: true,
    showBudgetInfo: true,
    showNetworkInfo: true,
    showRequirements: true,
    customWelcomeMessage: '',
    footerText: '',
    enableNotifications: true,
    enableAnalytics: true
  });

  // Enhanced dashboard state
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall_score');
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Enhanced agents with more realistic data
  const agents = [
    { id: 1, email: 'agent@caa.com', password: 'demo123', name: 'Sarah Johnson', agency: 'CAA', phone: '+1-555-0101', verified: true },
    { id: 2, email: 'agent@wme.com', password: 'demo123', name: 'Mike Chen', agency: 'WME', phone: '+1-555-0102', verified: true },
    { id: 3, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency', phone: '+1-555-0103', verified: true },
    { id: 4, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment', phone: '+1-555-0100', verified: true, role: 'admin' }
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
      requirements: ["3+ years TV writing experience", "Crime/thriller background preferred", "Available for 6-month commitment", "Writing sample required"],
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
      requirements: ["Limited series experience", "Tech industry knowledge helpful", "Strong dialogue skills", "Available immediately"],
      priority: "Medium",
      submissionCount: 0
    }
  ]);

  const [formData, setFormData] = useState({
    writerName: '',
    availability: '',
    cv_file: null,
    sample_script: null,
    pitch_summary: '',
    writerEmail: '',
    writerPhone: '',
    previousCredits: '',
    writingExperience: ''
  });

  const getColorClasses = (color) => {
    const colorMap = {
      indigo: {
        bg: 'bg-indigo-600',
        bgHover: 'bg-indigo-700',
        bgDark: 'bg-indigo-800',
        text: 'text-indigo-600',
        textLight: 'text-indigo-200',
        border: 'border-indigo-500',
        borderHover: 'border-indigo-300'
      },
      blue: {
        bg: 'bg-blue-600',
        bgHover: 'bg-blue-700',
        bgDark: 'bg-blue-800',
        text: 'text-blue-600',
        textLight: 'text-blue-200',
        border: 'border-blue-500',
        borderHover: 'border-blue-300'
      },
      purple: {
        bg: 'bg-purple-600',
        bgHover: 'bg-purple-700',
        bgDark: 'bg-purple-800',
        text: 'text-purple-600',
        textLight: 'text-purple-200',
        border: 'border-purple-500',
        borderHover: 'border-purple-300'
      },
      green: {
        bg: 'bg-green-600',
        bgHover: 'bg-green-700',
        bgDark: 'bg-green-800',
        text: 'text-green-600',
        textLight: 'text-green-200',
        border: 'border-green-500',
        borderHover: 'border-green-300'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  const isAdmin = currentAgent?.email === 'admin@playground.com';
  const colors = getColorClasses(uxSettings.primaryColor);

  // Enhanced AI Analysis with Real Claude API
  const analyzeWithClaudeAPI = async (cvFile, scriptFile, projectRequirements, projectGenre, projectTone) => {
    if (!config.claude.apiKey || !config.claude.enabled) {
      return generateMockAnalysis();
    }

    try {
      const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
      };

      let cvContent = null;
      let scriptContent = null;

      if (cvFile) {
        try {
          cvContent = await readFileAsBase64(cvFile);
        } catch (error) {
          console.warn('Could not read CV file:', error);
        }
      }

      if (scriptFile) {
        try {
          scriptContent = await readFileAsBase64(scriptFile);
        } catch (error) {
          console.warn('Could not read script file:', error);
        }
      }

      const messages = [];
      
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert television script analyst and development executive. Analyze the provided CV and script sample for a ${projectGenre} project with a ${projectTone} tone.

PROJECT REQUIREMENTS:
${projectRequirements.map(req => `- ${req}`).join('\n')}

PROJECT DETAILS:
- Genre: ${projectGenre}
- Tone: ${projectTone}

ANALYSIS CRITERIA:
1. GENRE MATCH (0-100): How well does the writer's experience and script sample match the ${projectGenre} genre?
2. TONE MATCH (0-100): How well does the writing style match the ${projectTone} tone?
3. DIALOGUE QUALITY (0-100): Quality of dialogue - natural, character-specific, engaging
4. STRUCTURE SCORE (0-100): Story structure, pacing, scene transitions, professional formatting
5. CHARACTER DEVELOPMENT (0-100): Character depth, motivation, distinctive voices
6. EXPERIENCE RELEVANCE (0-100): How relevant is their past TV/film experience to this project?

PROVIDE YOUR RESPONSE AS A VALID JSON OBJECT IN THIS EXACT FORMAT:
{
  "genre_match": 85,
  "tone_match": 78,
  "dialogue_quality": 92,
  "structure_score": 88,
  "character_development": 80,
  "experience_relevance": 75,
  "overall_score": 83,
  "detailed_analysis": {
    "cv_highlights": "Brief summary of most relevant experience",
    "script_strengths": "Key strengths in the script sample",
    "script_weaknesses": "Areas for improvement",
    "genre_fit_reasoning": "Why this writer fits/doesn't fit the genre",
    "tone_fit_reasoning": "How well they match the required tone",
    "recommendation": "RECOMMEND/CONSIDER/PASS with brief reasoning",
    "marketability": "Assessment of writer's market appeal",
    "unique_voice": "What makes this writer's voice distinctive"
  }
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`
          }
        ]
      });

      if (cvContent) {
        messages[0].content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: cvFile.type,
            data: cvContent,
          },
        });
      }

      if (scriptContent) {
        messages[0].content.push({
          type: "document", 
          source: {
            type: "base64",
            media_type: scriptFile.type,
            data: scriptContent,
          },
        });
      }

      if (!cvContent && !scriptContent) {
        return generateMockAnalysis();
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.claude.apiKey,
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 2000,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      
      responseText = responseText.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
      
      const analysis = JSON.parse(responseText);
      
      if (!analysis.genre_match || !analysis.tone_match || !analysis.dialogue_quality || 
          !analysis.structure_score || !analysis.character_development) {
        throw new Error('Invalid analysis format received');
      }

      addNotification('success', 'AI Analysis completed successfully using Claude API');
      return analysis;

    } catch (error) {
      console.error('Claude API Analysis failed:', error);
      addNotification('error', `AI Analysis failed: ${error.message}. Using fallback analysis.`);
      return generateMockAnalysis();
    }
  };

  // Enhanced Mock Analysis for fallback
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
        cv_highlights: "Demo analysis - Real AI analysis available with Claude API key",
        script_strengths: "Demo analysis - Upload script for detailed AI evaluation", 
        script_weaknesses: "Demo analysis - Configure Claude API for real analysis",
        genre_fit_reasoning: "Demo analysis - Enable AI features in Advanced Settings",
        tone_fit_reasoning: "Demo analysis - Professional analysis requires API configuration",
        recommendation: overall >= 80 ? "RECOMMEND" : overall >= 65 ? "CONSIDER" : "PASS",
        marketability: "Demo analysis - Market assessment available with full AI",
        unique_voice: "Demo analysis - Voice analysis requires document upload"
      }
    };
  };

  // Notification System
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type, // 'success', 'error', 'warning', 'info'
      message,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Enhanced Configuration Management
  useEffect(() => {
    // Load all configurations
    const savedAirtableConfig = {
      baseId: localStorage.getItem('airtableBaseId') || '',
      tableId: localStorage.getItem('airtableTableId') || 'tblWriterSubmissions',
      apiKey: localStorage.getItem('airtableApiKey') || ''
    };

    const savedClaudeConfig = {
      apiKey: localStorage.getItem('claudeApiKey') || '',
      enabled: localStorage.getItem('claudeEnabled') === 'true'
    };

    const savedEmailConfig = {
      enabled: localStorage.getItem('emailEnabled') === 'true',
      smtpHost: localStorage.getItem('emailSmtpHost') || '',
      smtpPort: localStorage.getItem('emailSmtpPort') || '587',
      username: localStorage.getItem('emailUsername') || '',
      password: localStorage.getItem('emailPassword') || '',
      fromEmail: localStorage.getItem('emailFromEmail') || ''
    };

    const savedCloudinaryConfig = {
      cloudName: localStorage.getItem('cloudinaryCloudName') || '',
      apiKey: localStorage.getItem('cloudinaryApiKey') || '',
      apiSecret: localStorage.getItem('cloudinaryApiSecret') || '',
      enabled: localStorage.getItem('cloudinaryEnabled') === 'true'
    };

    setConfig({
      airtable: savedAirtableConfig,
      claude: savedClaudeConfig,
      email: savedEmailConfig,
      cloudinary: savedCloudinaryConfig
    });

    const savedUxSettings = localStorage.getItem('uxSettings');
    if (savedUxSettings) {
      setUxSettings(JSON.parse(savedUxSettings));
    }

    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
      const agent = JSON.parse(savedAgent);
      setCurrentAgent(agent);
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
      addNotification('success', `Welcome back, ${agent.name}!`);
    } else {
      addNotification('error', 'Invalid credentials. Please try again.');
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
      pitch_summary: '',
      writerEmail: '',
      writerPhone: '',
      previousCredits: '',
      writingExperience: ''
    });
    addNotification('info', 'Logged out successfully');
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('submit');
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
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        addNotification('error', 'File too large. Maximum size is 10MB.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
      addNotification('success', `${file.name} uploaded successfully`);
    }
  };

  // Enhanced Submit Function with all integrations
  const handleSubmit = async () => {
    if (!formData.writerName || !selectedProject || !formData.pitch_summary) {
      addNotification('error', 'Please fill in Writer Name and Pitch Summary');
      return;
    }

    setIsSubmitting(true);
    addNotification('info', 'Processing submission...');

    try {
      // Perform AI analysis
      addNotification('info', 'Running AI analysis...');
      const analysis = await analyzeWithClaudeAPI(
        formData.cv_file,
        formData.sample_script,
        selectedProject.requirements,
        selectedProject.genre,
        selectedProject.tone
      );

      const submissionData = {
        id: Date.now(),
        writerName: formData.writerName,
        agentName: currentAgent.name,
        agentCompany: currentAgent.agency,
        email: currentAgent.email,
        projectInterest: selectedProject.title,
        availability: formData.availability,
        pitch_summary: formData.pitch_summary,
        cv_file: formData.cv_file ? {
          name: formData.cv_file.name
        } : null,
        sample_script: formData.sample_script ? {
          name: formData.sample_script.name
        } : null,
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
        recommendation: analysis.detailed_analysis?.recommendation || "CONSIDER",
        writerEmail: formData.writerEmail,
        writerPhone: formData.writerPhone,
        previousCredits: formData.previousCredits,
        writingExperience: formData.writingExperience,
        timestamp: new Date().toISOString()
      };

      // Update project submission count
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { ...p, submissionCount: (p.submissionCount || 0) + 1 }
          : p
      ));

      setSubmissions(prev => [...prev, submissionData]);
      addNotification('success', 'Submission completed successfully!');
      
      setFormData({
        writerName: '',
        availability: '',
        cv_file: null,
        sample_script: null,
        pitch_summary: '',
        writerEmail: '',
        writerPhone: '',
        previousCredits: '',
        writingExperience: ''
      });

      setSelectedProject(null);
      setActiveTab('dashboard');
      
    } catch (error) {
      console.error('Submission failed:', error);
      addNotification('error', `Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced Dashboard helper functions
  const getFilteredAndSortedSubmissions = () => {
    let filtered = submissions;
    
    // Apply filters
    if (submissionFilter !== 'all') {
      filtered = filtered.filter(s => s.recommendation === submissionFilter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.writerName.toLowerCase().includes(term) ||
        s.agentName.toLowerCase().includes(term) ||
        s.agentCompany.toLowerCase().includes(term) ||
        s.projectInterest.toLowerCase().includes(term)
      );
    }
    
    // Apply date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(s => {
        const subDate = new Date(s.submission_date);
        return subDate >= new Date(dateRange.start) && subDate <= new Date(dateRange.end);
      });
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'overall_score':
          return b.overall_score - a.overall_score;
        case 'submission_date':
          return new Date(b.submission_date) - new Date(a.submission_date);
        case 'genre_match':
          return b.analysis.genre_match - a.analysis.genre_match;
        case 'experience_relevance':
          return (b.analysis.experience_relevance || 0) - (a.analysis.experience_relevance || 0);
        case 'writer_name':
          return a.writerName.localeCompare(b.writerName);
        case 'agent_name':
          return a.agentName.localeCompare(b.agentName);
        default:
          return b.overall_score - a.overall_score;
      }
    });
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

  // Enhanced CSV Export functions
  const generateDetailedReport = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    
    let csvContent = "Writer Name,Agent,Agency,Email,Project,Availability,Overall Score,Recommendation,Genre Match,Tone Match,Dialogue Quality,Structure Score,Character Development,Experience Relevance,Submission Date\n";
    
    sortedSubmissions.forEach(sub => {
      csvContent += `"${sub.writerName}","${sub.agentName}","${sub.agentCompany}","${sub.email}","${sub.projectInterest}","${sub.availability || ''}",${sub.overall_score},"${sub.recommendation || 'CONSIDER'}",${sub.analysis.genre_match},${sub.analysis.tone_match},${sub.analysis.dialogue_quality},${sub.analysis.structure_score},${sub.analysis.character_development},${sub.analysis.experience_relevance || ''},"${sub.submission_date}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed_writer_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification('success', 'Detailed report exported successfully');
  };

  const generateReport = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    let csvContent = "Writer Name,Agent,Agency,Email,Project,Availability,Overall Score,Recommendation,Genre Match,Tone Match,Dialogue Quality,Structure Score,Character Development,Experience Relevance,Submission Date\n";
    sortedSubmissions.forEach(sub => {
      csvContent += `"${sub.writerName}","${sub.agentName}","${sub.agentCompany}","${sub.email}","${sub.projectInterest}","${sub.availability || ''}",${sub.overall_score},"${sub.recommendation || 'CONSIDER'}",${sub.analysis.genre_match},${sub.analysis.tone_match},${sub.analysis.dialogue_quality},${sub.analysis.structure_score},${sub.analysis.character_development},${sub.analysis.experience_relevance || ''},"${sub.submission_date}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writer_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification('success', 'Quick report exported successfully');
  };

  // Analytics calculations
  const getAnalytics = () => {
    const totalSubmissions = submissions.length;
    const recommended = submissions.filter(s => s.recommendation === 'RECOMMEND').length;
    const considered = submissions.filter(s => s.recommendation === 'CONSIDER').length;
    const passed = submissions.filter(s => s.recommendation === 'PASS').length;
    const avgScore = totalSubmissions > 0 ? Math.round(submissions.reduce((sum, s) => sum + s.overall_score, 0) / totalSubmissions) : 0;
    
    const last30Days = submissions.filter(s => {
      const subDate = new Date(s.submission_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return subDate >= thirtyDaysAgo;
    }).length;

    return {
      totalSubmissions,
      recommended,
      considered,
      passed,
      avgScore,
      last30Days,
      recommendationRate: totalSubmissions > 0 ? Math.round((recommended / totalSubmissions) * 100) : 0
    };
  };

  const analytics = getAnalytics();

  // Notification component
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
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
            
            <button
              onClick={handleLogin}
              className={`w-full ${colors.bg} text-white py-3 px-6 rounded-lg hover:${colors.bgHover} transition duration-200 font-medium`}
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <NotificationBar />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg flex items-center">
            <Loader className="animate-spin w-6 h-6 mr-3" />
            <span>Loading...</span>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg">
        <div className={`border-b border-gray-200 ${colors.bg} text-white rounded-t-lg`}>
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">{uxSettings.companyName}</h1>
              <p className={colors.textLight}>{uxSettings.portalTitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{currentAgent?.name}</p>
                <p className={colors.textLight + " text-sm"}>{currentAgent?.agency}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`${colors.bgHover} hover:${colors.bgDark} px-3 py-2 rounded-lg flex items-center`}
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
                  ? `${colors.border} ${colors.text}`
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
                    ? `${colors.border} ${colors.text}`
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
                  ? `${colors.border} ${colors.text}`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              {isAdmin ? 'All Submissions' : 'My Submissions'}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="inline w-4 h-4 mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    showConfig
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Database className="inline w-4 h-4 mr-2" />
                  Database Setup
                </button>
                <button
                  onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    showAdvancedConfig
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Settings className="inline w-4 h-4 mr-2" />
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
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
                  <div key={project.id} className={`bg-gray-50 rounded-lg p-6 border border-gray-200 hover:${colors.borderHover} transition-all duration-200 hover:shadow-md`}>
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
                      </div>
                      <div className="text-right ml-4">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                          {project.status}
                        </span>
                        {uxSettings.showDeadlines && (
                          <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
                        )}
                        <p className="text-sm text-blue-600 font-medium">{project.submissionCount || 0} submissions</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    {uxSettings.showRequirements && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {project.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button
                      onClick={() => selectProject(project)}
                      className={`${colors.bg} text-white px-6 py-2 rounded-lg hover:${colors.bgHover} transition duration-200 font-medium`}
                    >
                      Submit Writer for This Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Tab */}
          {activeTab === 'submit' && selectedProject && (
            <div>
              <div className={`mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200`}>
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
                {/* Writer Information Section */}
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

                {/* Pitch Section */}
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

                {/* File Upload Section */}
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
                  
                  {config.claude.enabled && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <div className="flex items-center text-blue-800">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">AI Analysis Enabled</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Uploaded documents will be analyzed by Claude AI for genre fit, dialogue quality, and more.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
                        : `${colors.bg} text-white hover:${colors.bgHover}`
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

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isAdmin ? 'All Submissions' : 'My Submissions'}
              </h2>
              
              {isAdmin && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={generateDetailedReport}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                </div>
              )}

              {/* Submissions List */}
              <div className="space-y-6">
                {(isAdmin ? submissions : submissions.filter(s => s.email === currentAgent.email)).map(submission => (
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
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-4xl font-bold ${getScoreColor(submission.overall_score)}`}>
                            {submission.overall_score}%
                          </div>
                          <p className="text-sm text-gray-500">Overall Match</p>
                        </div>
                      </div>

                      {/* Score Breakdown */}
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

                    {/* Action Bar */}
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-gray-600">
                        {submission.cv_file && (
                          <span>📄 CV: {submission.cv_file.name}</span>
                        )}
                        {submission.sample_script && (
                          <span>📝 Script: {submission.sample_script.name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleAnalysisDetails(submission.id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        {expandedAnalysis[submission.id] ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>

                    {/* Expandable Analysis Details */}
                    {expandedAnalysis[submission.id] && submission.detailed_analysis && (
                      <div className="p-6 bg-gray-50 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">CV Highlights</h4>
                            <p className="text-sm text-gray-600 mb-4">{submission.detailed_analysis.cv_highlights || 'No analysis available'}</p>
                            
                            <h4 className="font-semibold text-gray-800 mb-2">Script Strengths</h4>
                            <p className="text-sm text-gray-600">{submission.detailed_analysis.script_strengths || 'No analysis available'}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                            <p className="text-sm text-gray-600 mb-4">{submission.detailed_analysis.script_weaknesses || 'No analysis available'}</p>
                            
                            <h4 className="font-semibold text-gray-800 mb-2">Genre & Tone Fit</h4>
                            <p className="text-sm text-gray-600">{submission.detailed_analysis.genre_fit_reasoning || 'No analysis available'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {(isAdmin ? submissions : submissions.filter(s => s.email === currentAgent.email)).length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet. Submit a writer to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && isAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700">Total Submissions</h3>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalSubmissions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-900">{analytics.recommended}</p>
                  <p className="text-xs text-green-600">{analytics.recommendationRate}% rate</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-700">Under Review</h3>
                  <p className="text-3xl font-bold text-yellow-900">{analytics.considered}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-700">Passed</h3>
                  <p className="text-3xl font-bold text-red-900">{analytics.passed}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-700">Avg Score</h3>
                  <p className="text-3xl font-bold text-purple-900">{analytics.avgScore}%</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-indigo-700">Last 30 Days</h3>
                  <p className="text-3xl font-bold text-indigo-900">{analytics.last30Days}</p>
                </div>
              </div>

              {/* Top Projects and Agencies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Projects</h3>
                  <div className="space-y-3">
                    {projects.map(project => (
                      <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-sm text-gray-500">{project.genre}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600">{project.submissionCount || 0}</p>
                          <p className="text-xs text-gray-500">submissions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Agencies</h3>
                  <div className="space-y-3">
                    {Array.from(new Set(submissions.map(s => s.agentCompany))).map(agency => {
                      const agencySubmissions = submissions.filter(s => s.agentCompany === agency);
                      const avgScore = agencySubmissions.length > 0 
                        ? Math.round(agencySubmissions.reduce((sum, s) => sum + s.overall_score, 0) / agencySubmissions.length)
                        : 0;
                      return (
                        <div key={agency} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{agency}</p>
                            <p className="text-sm text-gray-500">{agencySubmissions.length} submissions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{avgScore}%</p>
                            <p className="text-xs text-gray-500">avg score</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Configuration */}
          {showConfig && isAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Configuration</h2>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Airtable Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base ID</label>
                    <input
                      type="text"
                      value={config.airtable.baseId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        airtable: { ...prev.airtable, baseId: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="appXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Table ID</label>
                    <input
                      type="text"
                      value={config.airtable.tableId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        airtable: { ...prev.airtable, tableId: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="tblWriterSubmissions"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={config.airtable.apiKey}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        airtable: { ...prev.airtable, apiKey: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="patXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('airtableBaseId', config.airtable.baseId);
                    localStorage.setItem('airtableTableId', config.airtable.tableId);
                    localStorage.setItem('airtableApiKey', config.airtable.apiKey);
                    addNotification('success', 'Airtable configuration saved!');
                  }}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Save Airtable Config
                </button>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {showAdvancedConfig && isAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Settings</h2>
              
              {/* Claude AI Configuration */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Claude AI Analysis</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.claude.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        claude: { ...prev.claude, enabled: e.target.checked }
                      }))}
                      className="mr-3 h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Enable Claude AI Analysis</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Claude API Key</label>
                    <input
                      type="password"
                      value={config.claude.apiKey}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        claude: { ...prev.claude, apiKey: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="sk-ant-XXXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('claudeApiKey', config.claude.apiKey);
                    localStorage.setItem('claudeEnabled', config.claude.enabled.toString());
                    addNotification('success', 'Claude AI configuration saved!');
                  }}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Save Claude Config
                </button>
              </div>

              {/* UX Settings */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Branding & Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={uxSettings.companyName}
                      onChange={(e) => setUxSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portal Title</label>
                    <input
                      type="text"
                      value={uxSettings.portalTitle}
                      onChange={(e) => setUxSettings(prev => ({ ...prev, portalTitle: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <select
                      value={uxSettings.primaryColor}
                      onChange={(e) => setUxSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="indigo">Indigo</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Login Message</label>
                    <input
                      type="text"
                      value={uxSettings.loginMessage}
                      onChange={(e) => setUxSettings(prev => ({ ...prev, loginMessage: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Welcome Message</label>
                  <textarea
                    value={uxSettings.customWelcomeMessage}
                    onChange={(e) => setUxSettings(prev => ({ ...prev, customWelcomeMessage: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Optional welcome message for the assignments page..."
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Display Options</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'showDeadlines', label: 'Show Project Deadlines' },
                      { key: 'showBudgetInfo', label: 'Show Budget Information' },
                      { key: 'showNetworkInfo', label: 'Show Network Information' },
                      { key: 'showRequirements', label: 'Show Project Requirements' }
                    ].map(option => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={uxSettings[option.key]}
                          onChange={(e) => setUxSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                          className="mr-3 h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem('uxSettings', JSON.stringify(uxSettings));
                    addNotification('success', 'UX settings saved!');
                  }}
                  className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Save UX Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
