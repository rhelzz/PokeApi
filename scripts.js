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

function getTypeClass(type) {
    return `type-${type}`;
}

function displayPokemonList(pokemonList) {
    pokemonContainer.innerHTML = '';
    const fetchPromises = pokemonList.map(pokemon => {
        const url = pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
        return fetch(url).then(response => response.json());
    });

    Promise.all(fetchPromises)
        .then(pokemonDataList => {
            pokemonDataList.forEach(data => {
                const types = data.types.map(typeInfo => typeInfo.type.name);
                const pokemonCard = document.createElement('div');
                pokemonCard.classList.add('pokemon-card', ...types.map(type => getTypeClass(type)));
                pokemonCard.innerHTML = `
                    <img src="${data.sprites.front_default}" alt="${data.name}">
                    <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                    <p >ID: ${data.id}</p>
                    <div class="types">
                        ${types.map(type => `<span class="type ${getTypeClass(type)}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`).join(' ')}
                    </div>
                `;
                pokemonCard.addEventListener('click', () => {
                    openModal(data);
                });
                pokemonContainer.appendChild(pokemonCard);
            });
        })
        .catch(error => {
            console.error('Error fetching Pokemon data:', error);
        });
}

function setupPagination(totalItems) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / limit);
    const maxVisibleButtons = Math.min(maxVisiblePages, totalPages);

    const createPageButton = (page) => {
        const button = document.createElement('button');
        button.textContent = page;
        if (page === currentPage) button.disabled = true;
        button.addEventListener('click', () => {
            currentPage = page;
            offset = (page - 1) * limit;
            fetchPokemon(offset, limit);
        });
        return button;
    };

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.addEventListener('click', () => {
            currentPage--;
            offset = (currentPage - 1) * limit;
            fetchPokemon(offset, limit);
        });
        pagination.appendChild(prevButton);
    }

    const half = Math.floor(maxVisibleButtons / 2);
    let startPage = Math.max(currentPage - half, 1);
    let endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageButton(i));
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.addEventListener('click', () => {
            currentPage++;
            offset = (currentPage - 1) * limit;
            fetchPokemon(offset, limit);
        });
        pagination.appendChild(nextButton);
    }
}

// Modal handling
const modal = document.getElementById('pokemonModal');
const closeButton = document.querySelector('.close-button');

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function openModal(pokemon) {
    const modalBody = document.getElementById('modalBody');
    const types = pokemon.types.map(typeInfo => typeInfo.type.name);
    modalBody.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
        <p>ID: ${pokemon.id}</p>
        <div class="types">
            ${types.map(type => `<span class="type ${getTypeClass(type)}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`).join(' ')}
        </div>
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
    `;
    modal.style.display = 'block';
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