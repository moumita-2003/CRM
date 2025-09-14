import React from 'react';

export default function Login() {
  const handle = () => {
    window.location.href = (process.env.REACT_APP_API_BASE || 'http://localhost:4000') + '/auth/google';
  };
  return (
    <div>
      <h2>Login</h2>
      <button onClick={handle}>Sign in with Google</button>
    </div>
  );
}
