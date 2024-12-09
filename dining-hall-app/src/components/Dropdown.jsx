import React, { useState } from "react";
import "./Dropdown.css";

const Dropdown = ({ friends, locationName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="friends-list">
      {/* Button to toggle dropdown */}
      <button onClick={() => {
        console.log("Toggling dropdown");
        setIsOpen(!isOpen);
        console.log("Dropdown is now open:", isOpen);
      }} className="friends-button">
        {friends.length > 0
          ? `Friends at ${locationName} (${friends.length})`
          : `No Friends at ${locationName}`}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="friends-content">
          {friends.length > 0 ? (
            friends.map((friend, index) => (
              <p key={index} className="friend-name">
                {friend}
              </p>
            ))
          ) : (
            <p className="no-friends">No friends at this location</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
