import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // Importing the search icon

function Search(props) {
    const [city, setCity] = useState('');
    const [showInput, setShowInput] = useState(false); // State to toggle the input field

    const handleSearch = () => {
        props.onSearch(city);
    };

    const toggleInput = () => {
        setShowInput(!showInput); // Toggle the visibility of the input field
    };

    return (
        <div className="search-container">
            {showInput ? (
                <div className="search-bar">
                    <input 
                        type="text" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        placeholder="Enter city"
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
            ) : (
                <button onClick={toggleInput} className="search-btn">
                    <FaSearch /> {/* Search icon */}
                </button>
            )}
        </div>
    );
}

export default Search;