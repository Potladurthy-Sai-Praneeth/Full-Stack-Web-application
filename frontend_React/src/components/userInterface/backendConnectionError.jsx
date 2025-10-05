import React from 'react';
import '../../Styling/style.css';

class BackendConnectionError extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRetrying: false,
      attemptCount: 0
    };
  }

  retryConnection = () => {
    this.setState({ isRetrying: true, attemptCount: this.state.attemptCount + 1 });
    
    // Attempt to fetch from backend
    fetch('http://localhost:8081/api/products/all', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          // Backend is now accessible, reload the page
          window.location.reload();
        } else {
          this.setState({ isRetrying: false });
        }
      })
      .catch(() => {
        this.setState({ isRetrying: false });
      });
  };

  render() {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '60px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            Backend Server Not Running
          </h2>
          
          <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '30px' }}>
            The application cannot connect to the backend server. 
            This usually means the backend server is not running.
          </p>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h4 style={{ marginTop: 0, color: '#495057' }}>To fix this issue:</h4>
            <ol style={{ paddingLeft: '20px', color: '#6c757d' }}>
              <li style={{ marginBottom: '10px' }}>
                Make sure MongoDB is running:
                <br />
                <code style={{ backgroundColor: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>
                  net start MongoDB
                </code>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Open a new terminal/command prompt
              </li>
              <li style={{ marginBottom: '10px' }}>
                Navigate to the backend folder:
                <br />
                <code style={{ backgroundColor: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>
                  cd backend_MongoDB
                </code>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Start the backend server:
                <br />
                <code style={{ backgroundColor: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>
                  npm start
                </code>
              </li>
              <li>
                Wait for "Api server listening on port 8081!" message
              </li>
            </ol>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={this.retryConnection}
              disabled={this.state.isRetrying}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: this.state.isRetrying ? 'not-allowed' : 'pointer',
                opacity: this.state.isRetrying ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!this.state.isRetrying) {
                  e.target.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#007bff';
              }}
            >
              {this.state.isRetrying ? '🔄 Checking...' : '🔄 Retry Connection'}
            </button>
          </div>

          {this.state.attemptCount > 0 && (
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              Retry attempts: {this.state.attemptCount}
            </p>
          )}

          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '5px',
            border: '1px solid #ffc107'
          }}>
            <strong style={{ color: '#856404' }}>💡 Quick Tip:</strong>
            <p style={{ marginTop: '10px', marginBottom: 0, color: '#856404' }}>
              You can use the <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>start-all.bat</code> 
              {' '}script in the project root to start both servers automatically!
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default BackendConnectionError;
