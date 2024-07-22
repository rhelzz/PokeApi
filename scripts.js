const pokemonContainer = document.getElementById('pokemonContainer');
const pagination = document.getElementById('pagination');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const limit = 20;
let offset = 0;
let currentPage = 1;
const maxVisiblePages = 4;

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemon(offset, limit);
});

// Tambahkan event listener untuk form pencarian
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        searchPokemon(searchTerm);
    } else {
        fetchPokemon(offset, limit);
    }
});

function fetchPokemon(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayPokemonList(data.results);
            setupPagination(data.count);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function searchPokemon(searchTerm) {
    const url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Pokémon not found');
            return response.json();
        })
        .then(data => {
            displayPokemonList([data]);
            pagination.innerHTML = ''; // Clear pagination when searching
        })
        .catch(error => {
            pokemonContainer.innerHTML = `<p>Pokémon not found. Please check the spelling or ID.</p>`;
            console.error('Error fetching data:', error);
        });
}

function displayPokemonList(pokemonList) {
    pokemonContainer.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const url = pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const pokemonCard = document.createElement('div');
                pokemonCard.classList.add('pokemon-card');
                pokemonCard.innerHTML = `
                    <img src="${data.sprites.front_default}" alt="${data.name}">
                    <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                    <p>ID: ${data.id}</p>
                    <p>Type: ${data.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                `;
                pokemonContainer.appendChild(pokemonCard);
            });
    });
}

function setupPagination(totalItems) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / limit);
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.addEventListener('click', () => {
            currentPage -= maxVisiblePages;
            if (currentPage < 1) currentPage = 1;
            offset = (currentPage - 1) * limit;
            fetchPokemon(offset, limit);
        });
        pagination.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.disabled = true;
        }
        button.addEventListener('click', () => {
            currentPage = i;
            offset = (currentPage - 1) * limit;
            fetchPokemon(offset, limit);
        });
        pagination.appendChild(button);
    }

    if (endPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.addEventListener('click', () => {
            currentPage += maxVisiblePages;
            if (currentPage > totalPages) currentPage = totalPages;
            offset = (currentPage - 1) * limit;
            fetchPokemon(offset, limit);
        });
        pagination.appendChild(nextButton);
    }
}