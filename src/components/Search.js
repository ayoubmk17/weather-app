import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './Search.css';

const Search = ({ onSearch, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une ville..."
          disabled={disabled}
        />
      </div>
    </form>
  );
};

export default Search;
