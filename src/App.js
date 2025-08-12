import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Briefcase, Download, Search, Database } from 'lucide-react';

const WriterSubmissionPortal = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airtableConfig, setAirtableConfig] = useState({
    baseId: '',
    tableId: '',
    apiKey: ''
  });
  const [showConfig, setShowConfig] = useState(false);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Dark Crime Drama",
      genre: "Crime Drama",
      tone: "Dark, Gritty",
      budget: "Mid-Budget",
      network: "Premium Cable",
      description: "Neo-noir crime series set in modern Detroit. Focus on corrupt police and organized crime.",
      deadline: "2025-09-15"
    }
  ]);

  const [formData, setFormData] = useState({
    writerName: '',
    agentName: '',
    agentCompany: '',
    email: '',
    projectInterest: '',
    availability: '',
    cv_file: null,
    sample_script: null,
    pitch_summary: ''
  });

  // Load Airtable config from localStorage
  useEffect(() => {
    const savedConfig = {
      baseId: localStorage.getItem('airtableBaseId') || '',
      tableId: localStorage.getItem('airtableTableId') || 'tblWriterSubmissions',
      apiKey: localStorage.getItem('airtableApiKey') || ''
    };
    setAirtableConfig(savedConfig);
  }, []);

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
      throw new Error('Airtable configuration missing. Please configure Airtable settings.');
    }

    const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${airtableConfig.tableId}`;
    
    // Prepare attachments
    const attachments = [];
    if (formData.cv_file) {
      attachments.push({
        filename: formData.cv_file.name,
        type: formData.cv_file.type,
        // In production, you'd upload to a file service first
        url: `placeholder-cv-${Date.now()}.pdf`
      });
    }
    if (formData.sample_script) {
      attachments.push({
        filename: formData.sample_script.name,
        type: formData.sample_script.type,
        url: `placeholder-script-${Date.now()}.pdf`
      });
    }

    const airtableData = {
      records: [{
        fields: {
          "Writer Name": submissionData.writerName,
          "Agent Name": submissionData.agentName,
          "Agency": submissionData.agentCompany || '',
          "Email": submissionData.email || '',
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
          "Attachments": attachments.length > 0 ? attachments : undefined
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
      throw new Error(`Airtable API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  };

  const handleSubmit = async () => {
    if (!formData.writerName || !formData.agentName || !formData.projectInterest) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate script analysis
      const mockAnalysis = {
        genre_match: Math.floor(Math.random() * 30) + 70,
        tone_match: Math.floor(Math.random() * 30) + 65,
        dialogue_quality: Math.floor(Math.random() * 25) + 70,
        structure_score: Math.floor(Math.random() * 30) + 60,
        character_development: Math.floor(Math.random() * 25) + 70
      };

      const submissionData = {
        id: Date.now(),
        ...formData,
        submission_date: new Date().toISOString().split('T')[0],
        analysis: mockAnalysis,
        overall_score: Math.floor((mockAnalysis.genre_match + mockAnalysis.tone_match + mockAnalysis.dialogue_quality + mockAnalysis.structure_score + mockAnalysis.character_development) / 5)
      };

      // Submit to Airtable
      if (airtableConfig.baseId && airtableConfig.apiKey) {
        await submitToAirtable(submissionData);
        alert('Successfully submitted to Airtable! Check your base for the new record.');
      } else {
        alert('Airtable not configured. Data saved locally only.');
      }

      // Also keep local copy for dashboard
      setSubmissions(prev => [...prev, submissionData]);
      
      // Reset form
      setFormData({
        writerName: '',
        agentName: '',
        agentCompany: '',
        email: '',
        projectInterest: '',
        availability: '',
        cv_file: null,
        sample_script: null,
        pitch_summary: ''
      });

      setActiveTab('dashboard');
      
    } catch (error) {
      alert(`Submission failed: ${error.message}`);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReport = () => {
    const sortedSubmissions = [...submissions].sort((a, b) => b.overall_score - a.overall_score);
    
    let csvContent = "Writer Name,Agent,Company,Email,Project,Availability,Overall Score,Genre Match,Tone Match,Dialogue Quality,Structure Score,Character Development,Submission Date\n";
    
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              Submit Writer
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="inline w-4 h-4 mr-2" />
              Open Projects
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              Analysis Dashboard
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                showConfig
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="inline w-4 h-4 mr-2" />
              Airtable Setup
            </button>
          </div>
        </div>

        <div className="p-6">
          {showConfig && (
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
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Table ID</label>
                  <input
                    type="text"
                    value={airtableConfig.tableId}
                    onChange={(e) => setAirtableConfig(prev => ({ ...prev, tableId: e.target.value }))}
                    placeholder="tblWriterSubmissions"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={airtableConfig.apiKey}
                    onChange={(e) => setAirtableConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="pat..."
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={saveAirtableConfig}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Configuration
                </button>
                <div className="text-sm text-blue-600 py-2">
                  Status: {airtableConfig.baseId && airtableConfig.apiKey ? '✅ Configured' : '❌ Not Configured'}
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                <p><strong>Setup Instructions:</strong></p>
                <p>1. Create an Airtable base with table name "Writer Submissions"</p>
                <p>2. Add these fields: Writer Name, Agent Name, Agency, Email, Project, Availability, Pitch Summary, Submission Date, Overall Score, Status</p>
                <p>3. Get your Base ID from the Airtable URL and API key from Airtable Account settings</p>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Writing Assignments from Playground</h2>
              {projects.map(project => (
                <div key={project.id} className="bg-gray-50 rounded-lg p-6 mb-4 border">
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
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  <p className="text-sm text-gray-500">Submission Deadline: {project.deadline}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submit' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Writer for Project</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Writer Name *</label>
                    <input
                      type="text"
                      name="writerName"
                      value={formData.writerName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
                    <input
                      type="text"
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agency/Company</label>
                    <input
                      type="text"
                      name="agentCompany"
                      value={formData.agentCompany}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                    <select
                      name="projectInterest"
                      value={formData.projectInterest}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Project</option>
                      <option value="Dark Crime Drama">Dark Crime Drama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Summary/CV</label>
                  <textarea
                    name="pitch_summary"
                    value={formData.pitch_summary}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief pitch for why this writer is perfect for this project, including relevant experience, previous credits, and writing style..."
                  ></textarea>
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition duration-200 ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting to Airtable...' : 'Submit Writer & Analyze Script'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Writer Analysis Dashboard</h2>
                <button
                  onClick={generateReport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No writer submissions yet. Start by submitting writers from the Submit Writer tab.</p>
                  <p className="text-sm text-gray-400 mt-2">Data will also appear in your Airtable base if configured.</p>
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
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${submission.overall_score >= 80 ? 'text-green-600' : submission.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {submission.overall_score}%
                            </div>
                            <p className="text-sm text-gray-500">Overall Match</p>
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

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Availability:</span>
                            <p>{submission.availability}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Email:</span>
                            <p>{submission.email}</p>
                          </div>
                        </div>

                        {submission.pitch_summary && (
                          <div className="mt-4 p-3 bg-gray-50 rounded">
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
      </div>
    </div>
  );
};

export default WriterSubmissionPortal;
