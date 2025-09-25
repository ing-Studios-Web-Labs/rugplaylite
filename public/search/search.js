import { redirectToHomepage } from "/global/homepageRedirect.js";
import { redirectToSearch } from "/global/searchbar.js";
import { colorCoinChange } from "/global/coinColorChange.js";
import { checkForAPIKey } from "/global/checkForApiKey.js";
import { fetchAPIKey } from "/global/checkForApiKey.js";

let searchedCoin;
let currentPage;
let totalNumberOfPages;

function checkForEmptyParams() {
    const searchParams = retrieveSearchParams();
    if (searchParams === null) {
        console.log('No parameters found in URL, reverting to default search layout.');
    } else {
        return;
    }
}

function retrieveSearchParams() {
    let paramsToReturn = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
        paramsToReturn[key] = value;
    }
    
    if (Object.keys(paramsToReturn).length > 0) {
        return paramsToReturn;
    } else {
        return null;
    }
}

async function retrieveSearchResults() {
    const defaultParams = {
        search: '',
        sortBy: 'marketCap',
        sortOrder: 'desc',
        priceFilter: 'all',
        changeFilter: 'all',
        page: 1,
        limit: 12,
        apikey: fetchAPIKey()
    };
    
    const urlParams = retrieveSearchParams();
    
    // Create an object to hold only the allowed parameters
    const finalParams = {};
    const allowedKeys = Object.keys(defaultParams);

    // If there are parameters from the URL, process them
    if (urlParams) {
        for (const key of allowedKeys) {
            if (urlParams.hasOwnProperty(key)) {
                finalParams[key] = urlParams[key];
            } else {
                finalParams[key] = defaultParams[key];
            }
        }
    } else {
        // If no parameters in URL, just use all defaults
        Object.assign(finalParams, defaultParams);
    }
    
    console.log('Final parameters to retrieve:', finalParams);

    // Construct the query string
    const queryString = new URLSearchParams(finalParams).toString();
    const apiUrl = `/api/market-data?${queryString}`; // The API endpoint URL

    try {
        // Fetch the response
        const response = await fetch(apiUrl);

        // Check if the request was successful
        if (!response.ok) {
            // If not, throw an error with the status text
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function displaySearchResults() {
    const data = await retrieveSearchResults();
    const coins = data.coins;
    const searchResultsContainer = document.getElementById('search-results-div');

    console.log('Recieved coins:');
    if (Object.keys(coins).length > 0) {
        // Assign the current page and total pages
        currentPage = data.page;
        totalNumberOfPages = data.totalPages;
        for (let coin of coins) {
            console.log(coin);
            const coinInfoContainer = document.createElement('button'); // Main element
            coinInfoContainer.id = `coin-${coin.symbol}-container`;
            coinInfoContainer.classList.add('top-coin-info');
            coinInfoContainer.dataset.symbol = coin.symbol;
            const coinIconAndChange = document.createElement('div'); // Element to hold icon and 24h change together
            coinIconAndChange.classList.add('coin-icon-change');
            // Check if icon exists else use a div with text placeholder
            if (coin.icon !== null) {
                const coinIcon = document.createElement('img');
                coinIcon.src = `https://rugplay.com/api/proxy/s3/${coin.icon}`;
                coinIcon.classList.add('coin-icon-img');
                coinIcon.draggable = false;
                coinIconAndChange.appendChild(coinIcon);
            } else {
                const coinIconPlaceholder = document.createElement('div');
                coinIconPlaceholder.classList.add('coin-icon-div');
                coinIconPlaceholder.draggable = false;
                coinIconPlaceholder.innerHTML = `<p>${coin.symbol}</p>`;
                coinIconAndChange.appendChild(coinIconPlaceholder);
            }
            const coinChange = document.createElement('p'); // Coin 24h change
            coinChange.id = `${coin.symbol}-change-24h`;
            coinChange.classList.add('coin-change');
            if (coin.change24h >= 0) {
                coin.change24h = `+${coin.change24h}`;
            }
            coinChange.textContent = `${coin.change24h}%`;
            coinIconAndChange.appendChild(coinChange);
            coinInfoContainer.appendChild(coinIconAndChange);
            const coinHeader = document.createElement('h4'); // Coin name and symbol
            coinHeader.textContent = `${coin.name} (*${coin.symbol})`;
            coinInfoContainer.appendChild(coinHeader);
            const coinPrice = document.createElement('h2');
            coinPrice.textContent = `$${coin.currentPrice}`;
            coinInfoContainer.appendChild(coinPrice);
            const marketCap = document.createElement('p');
            marketCap.textContent = `Market Cap: $${coin.marketCap}`;
            coinInfoContainer.appendChild(marketCap);
            searchResultsContainer.appendChild(coinInfoContainer);
            colorCoinChange(coinChange.id, coin.change24h);
        }

        // Parent container for navigating between pages
        const pageChangeContainer = document.createElement('div');
        pageChangeContainer.id = 'page-change-container';
        pageChangeContainer.classList.add('page-change-container');
        // Left chevron arrow
        const leftArrow = document.createElement('div');
        leftArrow.id = 'left-arrow';
        leftArrow.classList.add('nav-arrows', 'page-change-items');
        leftArrow.innerHTML = `<span class="material-symbols-outlined chevron-item">chevron_left</span>`;
        pageChangeContainer.appendChild(leftArrow);
        // Input for navigating between pages
        const pageInput = document.createElement('input');
        pageInput.id = 'page-input';
        pageInput.classList.add('page-input', 'page-change-items');
        pageInput.value = currentPage;
        pageChangeContainer.appendChild(pageInput);
        // Of word
        const ofWord = document.createElement('p');
        leftArrow.classList.add('page-change-items');
        ofWord.textContent = 'of';
        pageChangeContainer.appendChild(ofWord);
        // Total number of pages
        const totalPages = document.createElement('p');
        leftArrow.classList.add('page-change-items');
        totalPages.textContent = data.totalPages;
        pageChangeContainer.appendChild(totalPages);
        // Right chevron arrow
        const rightArrow = document.createElement('div');
        rightArrow.id = 'right-arrow';
        rightArrow.classList.add('nav-arrows', 'page-change-items');
        rightArrow.innerHTML = `<span class="material-symbols-outlined chevron-item">chevron_right</span>`;
        pageChangeContainer.appendChild(rightArrow);
        searchResultsContainer.appendChild(pageChangeContainer);

        changePage();
    } else {
        const errorHeaderElement = document.createElement('h2');
        errorHeaderElement.textContent = 'No coins found';
        searchResultsContainer.appendChild(errorHeaderElement);
        const errorTextElement = document.createElement('p');
        errorTextElement.textContent = `No coins match your search "${searchedCoin}". Try different keywords or adjust filters.`
        searchResultsContainer.appendChild(errorTextElement);
        const removeFiltersButton = document.createElement('button');
        removeFiltersButton.id = 'remove-filters-button';
        removeFiltersButton.classList.add('remove-filters-button');
        removeFiltersButton.textContent = 'Remove all filters';
        searchResultsContainer.appendChild(removeFiltersButton);
        removeAllFilters();
    }
}

function removeAllFilters() {
    const removeFiltersButton = document.getElementById('remove-filters-button');
    removeFiltersButton.addEventListener('click', () => {
        document.location.href = '/search/search.html';
    });
}

function updateSearchItems() {
    const searchbar = document.getElementById('searchbar');
    searchbar.value = retrieveSearchParams()?.search || '';
    searchedCoin = searchbar.value;
}

function changePage() {
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');
    const pageInput = document.getElementById('page-input');

    leftArrow.addEventListener('click', () => {
        if (currentPage > 1) {
            document.location.href = `/search/search.html?search=${searchedCoin}&page=${currentPage - 1}`;
        }
    });

    rightArrow.addEventListener('click', () => {
        if (currentPage < totalNumberOfPages) {
            document.location.href = `/search/search.html?search=${searchedCoin}&page=${currentPage + 1}`;
        }
    });

    pageInput.addEventListener('keypress', (event) => {
        const pageValue = Number(pageInput.value);
        if (event.key === 'Enter' && Number.isInteger(pageValue) && pageValue > 0 && pageValue <= totalNumberOfPages) {
            document.location.href = `/search/search.html?search=${searchedCoin}&page=${pageValue}`;
        }
    });
}

function handleCoinClick() {
    document.addEventListener('click', (e) => {
        const clickedItem = e.target.closest('.top-coin-info'); // Clicked item - check if it includes the clicked coin item

        // Check if the coin item was actually clicked
        if (clickedItem) {
            console.log('ID of coin item clicked on:', clickedItem.id);
            const coinSymbol = clickedItem.dataset.symbol;
            console.log('Symbol of clicked coin:', coinSymbol);
            document.location.href = `/coinpage/coinpage.html?symbol=${coinSymbol}`;
        }
    });
}

function updateSearchPage() {
    document.title = `${searchedCoin} - Search - RugplayLite`;
    const searchTitle = document.getElementById('search-header');
    searchTitle.textContent = `Search Results for '${searchedCoin}'`;
}

async function initializePage() {
    checkForAPIKey();
    checkForEmptyParams();
    updateSearchItems();
    await displaySearchResults();
    handleCoinClick();
    redirectToSearch('searchbar');
    redirectToHomepage('header-logo');
    updateSearchPage();
}

document.addEventListener('DOMContentLoaded', initializePage);