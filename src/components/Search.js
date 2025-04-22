import React, { useState } from 'react';

function Search({ onSearch }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) {
      onSearch(input);  // Appel de la fonction onSearch pour envoyer la ville
      setInput('');  // Réinitialiser le champ de saisie après la recherche
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter city"
        value={input}
        onChange={(e) => setInput(e.target.value)}  // Mise à jour du champ de saisie
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default Search;

