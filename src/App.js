import React, { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.email === 'demo@agent.com' && loginData.password === 'demo') {
      setIsLoggedIn(true);
    } else {
      alert('Try: demo@agent.com / demo');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold">Writer Portal</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </button>
            <p className="text-center text-sm text-gray-500">
              Demo: demo@agent.com / demo
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Writer Portal</h1>
              <p className="text-gray-600">Playground Entertainment</p>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Welcome to the Writer Portal</h2>
          <p className="text-gray-600">
            This is a working minimal version. Once this builds successfully, 
            we can add more features step by step.
          </p>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">Success!</h3>
            <p className="text-green-700">
              If you can see this page, the app is building correctly. 
              We can now add features incrementally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
