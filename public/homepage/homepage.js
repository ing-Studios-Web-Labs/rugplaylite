import { redirectToHomepage } from "../global/homepageRedirect.js";
import { redirectToSearch } from "../global/searchbar.js";
import { colorCoinChange } from "../global/coinColorChange.js";
import { checkForAPIKey } from "../global/checkForApiKey.js";
import { fetchAPIKey } from "../global/checkForApiKey.js";

async function fetchTopCoins() {
    try {
        console.log('Fetching top coins...');

        const finalParams = {'apikey': fetchAPIKey()};
        // Construct the query string
        const queryString = new URLSearchParams(finalParams).toString();
        const apiUrl = `/api/top-coins?${queryString}`; // The API endpoint URL

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        return data; // Return the fetched data

    } catch (error) {
        console.error('Failed to fetch top coins:', error);
        return null; // Return null in case of an error
    }
}

async function displayTopCoins() {
    const data = await fetchTopCoins();
    const coins = data.coins;
    const topCoinsContainer = document.getElementById('top-coins-data');

    console.log('Recieved coins:');
    for (let coin of coins.slice(0, 30)) {
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
        coinPrice.textContent = `$${coin.price}`;
        coinInfoContainer.appendChild(coinPrice);
        const marketCap = document.createElement('p');
        marketCap.textContent = `Market Cap: $${coin.marketCap}`;
        coinInfoContainer.appendChild(marketCap);
        topCoinsContainer.appendChild(coinInfoContainer);
        colorCoinChange(coinChange.id, coin.change24h);
    }
}

function handleCoinClick() {
    document.addEventListener('click', (e) => {
        const clickedItem = e.target.closest('.top-coin-info'); // Clicked item - check if it includes the clicked coin item

        // Check if the coin item was actually clicked
        if (clickedItem) {
            console.log('ID of coin item clicked on:', clickedItem.id);
            const coinSymbol = clickedItem.dataset.symbol;
            console.log('Symbol of clicked coin:', coinSymbol);
            document.location.href = `../coinpage/coinpage.html?symbol=${coinSymbol}`;
        }
    });
}

async function initializePage() {
    console.log('Initializing page...');
    checkForAPIKey();
    await displayTopCoins();
    handleCoinClick();
    redirectToSearch('searchbar');
    redirectToHomepage('header-logo');
}

document.addEventListener('DOMContentLoaded', initializePage);