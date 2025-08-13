import React, { useState } from 'react';

const WriterSubmissionPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [submissions, setSubmissions] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const agents = [
    { id: 1, email: 'demo@agent.com', password: 'demo', name: 'Demo Agent', agency: 'Demo Agency' },
    { id: 2, email: 'admin@playground.com', password: 'admin123', name: 'Admin User', agency: 'Playground Entertainment' }
  ];

  const projects = [
    {
      id: 1,
      title: "Dark Crime Drama",
      genre: "Crime Drama",
      description: "Neo-noir crime series set in modern Detroit."
    },
    {
      id: 2,
      title: "Tech Thriller",
      genre: "Thriller/Sci-Fi", 
      description: "Limited series about AI consciousness."
    }
  ];

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
  };

  const isAdmin = currentAgent && currentAgent.email === 'admin@playground.com';

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafc', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '32px', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}>Agent Portal</h1>
            <p style={{ color: '#718096' }}>Access Playground Entertainment assignments</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}
                placeholder="your@agency.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}
                placeholder="Password"
              />
            </div>
            
            <button
              type="submit"
              style={{ width: '100%', background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
            >
              Sign In
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ background: '#4f46e5', color: 'white', padding: '24px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Playground Entertainment</h1>
            <p style={{ color: '#c7d2fe', margin: 0 }}>Writer Submission Portal</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{currentAgent.name}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#c7d2fe' }}>{currentAgent.agency}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: '#6366f1', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '32px', padding: '0 24px' }}>
            <button
              onClick={() => setActiveTab('assignments')}
              style={{ 
                padding: '16px 8px', 
                border: 'none', 
                background: 'none', 
                fontSize: '14px', 
                fontWeight: '500',
                borderBottom: activeTab === 'assignments' ? '2px solid #4f46e5' : '2px solid transparent',
                color: activeTab === 'assignments' ? '#4f46e5' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              📝 Open Assignments
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{ 
                padding: '16px 8px', 
                border: 'none', 
                background: 'none', 
                fontSize: '14px', 
                fontWeight: '500',
                borderBottom: activeTab === 'dashboard' ? '2px solid #4f46e5' : '2px solid transparent',
                color: activeTab === 'dashboard' ? '#4f46e5' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              📊 {isAdmin ? 'All Submissions' : 'My Submissions'}
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'assignments' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>Open Writing Assignments</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {projects.map(project => (
                  <div key={project.id} style={{ background: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{project.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '8px' }}>Genre: {project.genre}</p>
                    <p style={{ color: '#374151', marginBottom: '16px' }}>{project.description}</p>
                    <button
                      onClick={() => alert('Submission form would open here')}
                      style={{ background: '#4f46e5', color: 'white', padding: '8px 24px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      Submit Writer for This Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
                {isAdmin ? 'All Submissions' : 'My Submissions'}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af', margin: 0 }}>Total Submissions</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>{submissions.length}</p>
                </div>
                <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#166534', margin: 0 }}>Recommended</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d', margin: 0 }}>0</p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>No submissions yet.</p>
                  {isAdmin && <p style={{ color: '#6b7280', fontSize: '14px' }}>Agents can submit writers from the Open Assignments tab.</p>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {submissions.map(submission => (
                    <div key={submission.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>{submission.writerName}</h3>
                      <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Submitted by {submission.agentName}</p>
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Date: {submission.date}</p>
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
