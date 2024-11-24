import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Homepage</Link> | <Link to="/checkin">Check-In</Link> | <Link to="/friends">Friends</Link>
    </nav>
  );
};

export default Navbar;
