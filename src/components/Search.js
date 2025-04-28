import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // Importation de l'icône de recherche

function Search(props) {
    const [city, setCity] = useState('');
    const [showInput, setShowInput] = useState(false); // Etat pour afficher ou cacher la barre de recherche

    const handleSearch = () => {
        props.onSearch(city);
    };

    const toggleInput = () => {
        setShowInput(!showInput); // Permet de basculer la visibilité du champ de recherche
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
                    <button onClick={handleSearch} className="search-submit-btn">
                        <FaSearch /> {/* Icône de recherche */}
                    </button>
                </div>
            ) : (
                <button onClick={toggleInput} className="search-btn">
                    <FaSearch /> {/* Icône de recherche */}
                </button>
            )}
        </div>
    );
}

export default Search;
