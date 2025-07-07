import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="App-header">
      <h1>Welcome to the Application</h1>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </header>
  );
};

export default Header; 