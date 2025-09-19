import { redirectToHomepage } from "../global/homepageRedirect.js";
import { redirectToSearch } from "../global/searchbar.js";
import { colorCoinChange } from "../global/coinColorChange.js";
import { calculateRugpullChance } from "../global/calculateRugpull.js";

let coinData;
let topHolders;

function retrieveCoinParams() {
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

async function retrieveCoinData() {
    const defaultParams = {
        symbol: '',
        timeframe: '1m'
    };
    
    const urlParams = retrieveCoinParams();
    
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
    const apiUrl = `/api/coin-info?${queryString}`; // The API endpoint URL
    console.log('API URL to fetch coin data:', apiUrl);

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

async function retrieveTopHolders() {
const finalParams = {'symbol': coinData.coin.symbol, 'limit': 50};
    const queryString = new URLSearchParams(finalParams).toString();
    const apiUrl = `/api/coin-holders?${queryString}`;
    console.log('API URL to fetch coin holders:', apiUrl);

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

function displayCoinHeader() {
    const coinHeader = document.getElementById('coin-header-div');

    // Div to anchor the elements to the left of the header
    const headerLeftAnchor = document.createElement('div');
    headerLeftAnchor.classList.add('header-left-anchor');

    // Coin icon element
    // Check if the coin element is present
    if (coinData.coin.icon !== null) {
        const coinIcon = document.createElement('img');
        coinIcon.classList.add('coin-icon-img');
        coinIcon.draggable = false;
        coinIcon.src = `https://rugplay.com/api/proxy/s3/${coinData.coin.icon}`;
        headerLeftAnchor.appendChild(coinIcon);
    } else {
        const coinIconPlaceholder = document.createElement('div');
        coinIconPlaceholder.classList.add('coin-icon-div');
        coinIconPlaceholder.draggable = false;
        coinIconPlaceholder.innerHTML = `<p>${coinData.coin.symbol}</p>`;
        headerLeftAnchor.appendChild(coinIconPlaceholder);
    }

    // Div to anchor the coin name and symbol
    const coinNameAndSymbolAnchor = document.createElement('div');
    coinNameAndSymbolAnchor.classList.add('coin-name-symbol-anchor');
    // Coin name element
    const coinName = document.createElement('h1');
    coinName.classList.add('coin-name');
    coinName.textContent = coinData.coin.name;
    coinNameAndSymbolAnchor.appendChild(coinName);
    // Coin price element
    const coinSymbol = document.createElement('h3');
    coinSymbol.classList.add('coin-symbol');
    coinSymbol.textContent = `*${coinData.coin.symbol}`;
    coinNameAndSymbolAnchor.appendChild(coinSymbol);
    // Append the anchor to the left anchor
    headerLeftAnchor.appendChild(coinNameAndSymbolAnchor);
    // Append the left elements to the header
    coinHeader.appendChild(headerLeftAnchor)

    // Div to anchor elements to the right of the header
    const headerRightAnchor = document.createElement('div');
    headerRightAnchor.classList.add('header-right-anchor');

    // Coin price element
    const coinPrice = document.createElement('h1');
    coinPrice.classList.add('coin-price');
    coinPrice.textContent = `$${coinData.coin.currentPrice}`;
    headerRightAnchor.appendChild(coinPrice);
    // Coin 24h change element
    const coin24hChange = document.createElement('p');
    coin24hChange.id = 'coin24h-change';
    coin24hChange.classList.add('coin-change');
    if (coinData.coin.change24h >= 0) {
        coin24hChange.textContent = `+${coinData.coin.change24h}%`;
    } else {
        coin24hChange.textContent = `${coinData.coin.change24h}%`;
    }
    headerRightAnchor.appendChild(coin24hChange);
    
    coinHeader.appendChild(headerRightAnchor);
    colorCoinChange('coin24h-change', coinData.coin.change24h);
}

async function displayCoinBody() {
    const coinBody = document.getElementById('coin-body-div');

    // Coin graph container
    const coinGraphContainer = document.createElement('div');
    coinGraphContainer.id = 'coin-graph-container';
    coinGraphContainer.classList.add('coin-graph-container');
    coinBody.appendChild(coinGraphContainer);

    // Right anchor (User and trade anchor)
    const bodyRightAnchor = document.createElement('div');
    bodyRightAnchor.classList.add('body-right-anchor');

    // Trade element
    const tradeElement = document.createElement('div');
    tradeElement.classList.add('trade-div');
    bodyRightAnchor.appendChild(tradeElement);
    // Buy button
    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.innerHTML = `
    <span class="material-symbols-outlined" id="buy-span">attach_money</span>
    <p>Buy ${coinData.coin.symbol}</p>
    `;
    buyButton.addEventListener('click', () => {
        window.open(`https://rugplay.com/coin/${coinData.coin.symbol}`, '_blank');
    });
    tradeElement.appendChild(buyButton);
    // Sell button
    const sellButton = document.createElement('button');
    sellButton.classList.add('sell-button');
    sellButton.innerHTML = `
    <span class="material-symbols-outlined" id="sell-span">money_off</span>
    <p>Sell ${coinData.coin.symbol}</p>
    `;
    sellButton.addEventListener('click', () => {
        window.open(`https://rugplay.com/coin/${coinData.coin.symbol}`, '_blank');
    });
    tradeElement.appendChild(sellButton);
    
    // Creator element
    const creatorElement = document.createElement('div');
    creatorElement.classList.add('creator-div');
    
    // Top anchor element
    const creatorTopAnchor = document.createElement('div');
    creatorTopAnchor.classList.add('creator-top-anchor');
    // Creator avatar
    if (coinData.coin.creatorImage !== null) {
        const creatorIcon = document.createElement('img');
        creatorIcon.classList.add('creator-avatar-img');
        creatorIcon.draggable = false;
        creatorIcon.src = `https://rugplay.com/api/proxy/s3/${coinData.coin.creatorImage}`;
        creatorTopAnchor.appendChild(creatorIcon);
    } else {
        const creatorIconPlaceholder = document.createElement('div');
        creatorIconPlaceholder.classList.add('creator-avatar-div');
        creatorIconPlaceholder.draggable = false;
        creatorIconPlaceholder.innerHTML = `<p>${coinData.coin.symbol}</p>`;
        creatorTopAnchor.appendChild(creatorIconPlaceholder);
    }
    // Creator username and bio anchor
    const usernameBioAnchor = document.createElement('div');
    usernameBioAnchor.classList.add('username-bio-anchor');
    // Creator username
    const creatorUsername = document.createElement('h3');
    creatorUsername.classList.add('creator-username');
    creatorUsername.textContent = `Created by @${coinData.coin.creatorUsername}`;
    creatorUsername.addEventListener('click', () => {
        window.open(`https://rugplay.com/user/${coinData.coin.creatorUsername}`, '_blank');
    });
    usernameBioAnchor.appendChild(creatorUsername);
    // Creator bio
    const creatorBio = document.createElement('p');
    creatorBio.classList.add('creator-bio');
    creatorBio.textContent = `"${coinData.coin.creatorBio}"`;
    usernameBioAnchor.appendChild(creatorBio);
    // Append the username and bio anchor to the top anchor
    creatorTopAnchor.appendChild(usernameBioAnchor);

    // Append the top anchor to the creator div
    creatorElement.appendChild(creatorTopAnchor);

    // Likeliness of rugpulling div
    const rugpullChanceDiv = document.createElement('div');
    rugpullChanceDiv.classList.add('rugpull-chance-div');
    // Check if the creator is holding the coin
    const creatorHoldingCoin = findCreatorInHolders(coinData.coin.creatorUsername);
    // Calculate chance of rugpull
    let chanceOfRugpull;
    if (creatorHoldingCoin.holding === true) {
        chanceOfRugpull = calculateRugpullChance(creatorHoldingCoin.percentageHolding, creatorHoldingCoin.quantityHolding);
    } else {
        chanceOfRugpull = 0;
    }
    // Chance of rugpull h2
    const rugpullChanceh2 = document.createElement('h1');
    rugpullChanceh2.classList.add('rugpull-chance-h2');
    rugpullChanceh2.textContent = `${Math.round(chanceOfRugpull * 100)}%`;
    if (chanceOfRugpull > 0.5) {
        rugpullChanceh2.style.color = 'var(--negative-change-color)';
    } else {
        rugpullChanceh2.style.color = 'var(--positive-change-color)';
    }
    rugpullChanceDiv.appendChild(rugpullChanceh2);
    // Chance of rugpull text
    const rugpullChanceText = document.createElement('h3');
    rugpullChanceText.classList.add('rugpull-chance-text');
    rugpullChanceText.textContent = 'chance of rugpulling';
    rugpullChanceDiv.appendChild(rugpullChanceText);

    // Append the rugpull chance to the creator div
    creatorElement.appendChild(rugpullChanceDiv);

    // Append the creator element to the right of the body
    bodyRightAnchor.appendChild(creatorElement);

    coinBody.appendChild(bodyRightAnchor);
    fetchAndRenderGraph({'coin': coinData.coin, 'candlestickData': coinData.candlestickData, 'volumeData': coinData.volumeData, 'timeframe': coinData.timeframe});
}

function displayMoreInfoPanel() {
    const moreInfoButton = document.getElementById('info-inner-button');
    const moreInfoOverlay = document.getElementById('more-info-overlay');
    const graphContainer = document.getElementById('coin-graph-container');
    let currentPanel = null;
    let documentClickListener = null;
    let escapeKeyEventListener = null;

    function closePanel(panelToRemove) {
        if (!panelToRemove) return;
        
        // Toggle the classes off first
        panelToRemove.classList.remove('fade-in');
        moreInfoOverlay.classList.remove('grey-out');
        graphContainer.classList.remove('hidden');
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            if (moreInfoOverlay.contains(panelToRemove)) {
                moreInfoOverlay.removeChild(panelToRemove);
            }
        }, 300); // Match your CSS transition duration
        
        // Remove the document click listener
        if (documentClickListener) {
            document.removeEventListener('click', documentClickListener);
            documentClickListener = null;
        }

        if (escapeKeyEventListener) {
            document.removeEventListener('click', escapeKeyEventListener);
            escapeKeyEventListener = null;
        }
        
        currentPanel = null;
    }
    
    moreInfoButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closure
        
        // Close existing panel if open
        if (currentPanel) {
            closePanel(currentPanel);
            return;
        }
        
        console.log('More info button clicked.');
        
        // Create the panel
        const moreInfoPanel = document.createElement('div');
        moreInfoPanel.classList.add('more-info-panel');

        moreInfoPanel.innerHTML = `
        <h2>${coinData.coin.name} (*${coinData.coin.symbol})</h2>
        <h3>General Information</h3>
        <p><strong>ID:</strong> ${coinData.coin.id}</p>
        <p><strong>Name:</strong> ${coinData.coin.name}</p>
        <p><strong>Symbol:</strong> *${coinData.coin.symbol}</p>
        <p><strong>Current Price:</strong> $${coinData.coin.currentPrice.toLocaleString()}</p>
        <p><strong>Market Cap:</strong> $${coinData.coin.marketCap.toLocaleString()}</p>
        <p><strong>Volume 24h:</strong> $${coinData.coin.volume24h.toLocaleString()}</p>
        <p><strong>Change 24h:</strong> $${coinData.coin.change24h.toLocaleString()}</p>
        <p><strong>Pool Coin Amount:</strong> ${coinData.coin.poolCoinAmount.toLocaleString()}</p>
        <p><strong>Pool Base Currency Amount:</strong> $${coinData.coin.poolBaseCurrencyAmount.toLocaleString()}</p>
        <p><strong>Circulating Supply:</strong> ${coinData.coin.circulatingSupply.toLocaleString()}</p>
        <p><strong>Initial Supply:</strong> ${coinData.coin.initialSupply.toLocaleString()}</p>
        <p><strong>Listed:</strong> <span style="color: ${coinData.coin.isListed ? 'var(--positive-change-color)' : 'var(--negative-change-color)'}">${coinData.coin.isListed ? 'Yes' : 'No'}</span></p>
        <p><strong>Created At:</strong> ${new Date(coinData.coin.createdAt).toLocaleString()}</p>

        <h3>Creator Information</h3>
        <p><strong>Creator ID:</strong> ${coinData.coin.creatorId}</p>
        <p><strong>Creator Name:</strong> ${coinData.coin.creatorName}</p>
        <p><strong>Creator Username:</strong> @${coinData.coin.creatorUsername}</p>
        <p><strong>Creator Bio:</strong> "${coinData.coin.creatorBio}"</p>
        `;

        moreInfoOverlay.appendChild(moreInfoPanel);
        currentPanel = moreInfoPanel;
        
        setTimeout(() => {
            moreInfoPanel.classList.add('fade-in'); // Use add instead of toggle
            moreInfoOverlay.classList.add('grey-out'); // Use add instead of toggle
            graphContainer.classList.add('hidden');
        }, 30);

        // Create and attach the document click listener
        documentClickListener = (e) => {
            // Check if panel exists and click is outside of it
            if (currentPanel && !currentPanel.contains(e.target)) {
                console.log('Clicked outside panel, closing...');
                closePanel(currentPanel);
            }
        };

        // Escape key event listener
        escapeKeyEventListener = (e) => {
            if (e.key === 'Escape') {
                console.log('Pressed the escape key, closing...');
                closePanel(currentPanel);
            }
        };
        
        document.addEventListener('click', documentClickListener);
        document.addEventListener('keydown', escapeKeyEventListener);
    });
}

function findCreatorInHolders(creatorUsername) {
    console.log('Top holders:', topHolders);
    const creatorHolder = topHolders.holders.find(holder => holder.username === creatorUsername);
    if (creatorHolder) {
        console.log('Creator is holding the coin.');
        console.log('Creator holder bject:', creatorHolder);
        return {'holding': true, 'percentageHolding': creatorHolder.percentage, 'quantityHolding': creatorHolder.quantity};
    } else {
        return {'holding': false, 'percentageHolding': null, 'quantityHolding': null};
    }
}

async function fetchAndRenderGraph(data) {
    try {
        console.log('Body to send in the request:', JSON.stringify(data));
        const response = await fetch('/api/graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Operation result:', result);

        if (result.success && result.graphData) {
            const graphDiv = document.getElementById('coin-graph-container');

            console.log('Found graph container:', graphDiv);

            if (!graphDiv) {
                console.error('Graph container element not found');
                return;
            }

            // Parse the JSON string into an object
            const plotlyData = JSON.parse(result.graphData);
            console.log('Parsed plotly data:', plotlyData);

            // Clear the container completely
            graphDiv.innerHTML = '';
            
            // Remove any Plotly-related classes/attributes
            graphDiv.removeAttribute('class');
            graphDiv.className = 'coin-graph-container';

            // Use Plotly.newPlot() to create a fresh plot
            await Plotly.newPlot(
                graphDiv, 
                plotlyData.data, 
                plotlyData.layout,
                {
                    responsive: true,
                    toImageButtonOptions: {
                        filename: `${coinData.coin.symbol}_line_graph_export`,
                        format: 'svg'
                    }
                }
            );
            
            console.log('Graph rendered successfully');
        } else {
            console.error('API call failed:', result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function initializePage() {
    coinData = await retrieveCoinData();
    topHolders = await retrieveTopHolders();
    displayCoinHeader();
    displayCoinBody();
    displayMoreInfoPanel();
    redirectToSearch('searchbar');
    redirectToHomepage('header-logo');
    document.title = `${coinData.coin.name} (*${coinData.coin.symbol}) - Rugplay Lite`;
}

document.addEventListener('DOMContentLoaded', initializePage);