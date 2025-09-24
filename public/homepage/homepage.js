import { redirectToHomepage } from "/global/homepageRedirect.js";
import { redirectToSearch } from "/global/searchbar.js";
import { colorCoinChange } from "/global/coinColorChange.js";
import { checkForAPIKey } from "/global/checkForApiKey.js";
import { fetchAPIKey } from "/global/checkForApiKey.js";

let fetchedHomepageData;
let downloadFill;

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
        fetchedHomepageData = data;
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
            document.location.href = `/coinpage/coinpage.html?symbol=${coinSymbol}`;
        }
    });
}

function showLoadingBar() {
    const aiMarketSummaryDiv = document.getElementById('ai-market-summary');
    // Clear the div first
    aiMarketSummaryDiv.innerHTML = '';

    // Loading circle
    const loader = document.createElement('div');
    loader.classList.add('loader');
    aiMarketSummaryDiv.appendChild(loader);

    // Generating AI summary text
    const loadingText = document.createElement('p');
    loadingText.textContent = 'Generating AI Summary...';
    aiMarketSummaryDiv.appendChild(loadingText);
}

async function summarizeMarket(summarizer) {
    const dataToSummarize = JSON.stringify(fetchedHomepageData);
    console.log('Data to summarize:', dataToSummarize);
    showLoadingBar();
    const stream = await summarizer.summarizeStreaming(dataToSummarize, {
        context: 'This is a fetch result of the top coins currently in the market. Summarise them to the best of your ability.'
    });
    let summary = '';

    const aiMarketSummaryDiv = document.getElementById('ai-market-summary');

    for await (const chunk of stream) {
        console.log('Chunk:', chunk);
        summary += chunk;
        console.log('Current summary:', summary);

        // Convert the markdown summary to HTML using the marked.js library
        const htmlSummary = marked.parse(summary);

        // Set the innerHTML of the ai market summary div
        aiMarketSummaryDiv.innerHTML = htmlSummary;
    }

    // Disclaimer text
    const disclaimerText = document.createElement('p');
    disclaimerText.classList.add('disclaimer-text');
    disclaimerText.textContent = 'Powered by Gemini Nano. This is experimental technology, please check for mistakes.';
    aiMarketSummaryDiv.appendChild(disclaimerText);
}

function showDownloadBar(amountLoaded) {
    // If the download fill bar doesn't exist yet, create the container
    if (!downloadFill) {
        const aiMarketSummaryDiv = document.getElementById('ai-market-summary');
        // Clear the div first
        aiMarketSummaryDiv.innerHTML = '';

        // Download text
        const downloadText = document.createElement('p');
        downloadText.textContent = `Downloading ${amountLoaded * 100}%`;
        aiMarketSummaryDiv.appendChild(downloadText);
        
        // Download bar container
        const downloadBar = document.createElement('div');
        downloadBar.classList.add('download-bar');
        aiMarketSummaryDiv.appendChild(downloadBar);

        // Download fill
        downloadFill = document.createElement('div');
        downloadFill.classList.add('download-fill');
        downloadBar.appendChild(downloadFill);
    }

    downloadFill.style.width = `${amountLoaded * 100}%`;
}

function summariseEventListener() {
    const aiMarketSummaryDiv = document.getElementById('ai-market-summary');
    // Clear the div first
    aiMarketSummaryDiv.innerHTML = '';

    // Create the summarize button
    const summarizeButton = document.createElement('button');
    summarizeButton.classList.add('summarize-button');
    summarizeButton.textContent = "Summarize Today's Market with AI";
    // Event listener for summarizer click
    summarizeButton.addEventListener('click', checkSummarizeMarket);
    aiMarketSummaryDiv.appendChild(summarizeButton);
}

async function checkSummarizeMarket() {
    console.log('Checking if summarizer is available...');
    // Check if the browser includes Gemini Nano
    if ('Summarizer' in self) {
        try {
            const status = await Summarizer.availability();
            console.log('Summarizer status:', status);

            if (status === 'available') {
                console.log('Gemini Nano is ready to use.');
                // The options need to be passed here again if you want the monitor to work
                const options = {
                    outputLanguage: 'en', // Add a language code
                    monitor: () => {} // You can add a no-op monitor here if needed
                };
                const summarizer = await Summarizer.create(options);
                summarizeMarket(summarizer);
            } else if (status === 'downloadable') {
                console.log('Gemini Nano can be downloaded.');
                if (confirm('Do you wish to download Gemini Nano for AI-powered features?')) {
                    // Summarizer options with the monitor
                    const options = {
                        sharedContext: 'Your goal is to summarise the market effectively including all the data such as price, market cap, and 24h change. You MUST also suggest which coins are good to buy based on 24h and overall trends and which coins to avoic because of a risk of rugpull.',
                        type: 'tldr',
                        format: 'key-points',
                        length: 'long',
                        outputLanguage: 'en-US',
                        monitor(m) {
                            m.addEventListener('downloadprogress', (e) => {
                                console.log(`Downloaded ${e.loaded * 100}%`);
                                showDownloadBar(e.loaded);
                            });
                        }
                    };
                    const summarizer = await Summarizer.create(options);
                    summarizeMarket(summarizer);
                } else {
                    localStorage.setItem('denyAI', 'true');
                }
            } else {
                console.log('Summarizer API not available.');
            }
        } catch (error) {
            console.error('Error checking for summarizer availability:', error);
        }
    } else {
        console.log('Summarizer API not supported in the browser.');
    }
}

async function initializePage() {
    console.log('Initializing page...');
    checkForAPIKey();
    await displayTopCoins();
    handleCoinClick();
    summariseEventListener();
    redirectToSearch('searchbar');
    redirectToHomepage('header-logo');
}

document.addEventListener('DOMContentLoaded', initializePage);