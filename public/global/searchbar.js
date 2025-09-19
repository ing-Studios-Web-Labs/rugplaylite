export function redirectToSearch(searchbarID) {
    const searchbar = document.getElementById(searchbarID);

    // Add a keypress event listener to the search bar.
    searchbar.addEventListener('keypress', (event) => {
        // Check if the key pressed is the "Enter" key.
        if (event.key === 'Enter') {
            const defaultParams = {
                search: '',
                sortBy: 'marketCap',
                sortOrder: 'desc',
                priceFilter: 'all',
                changeFilter: 'all',
                page: 1,
                limit: 12
            };

            // Get the value entered by the user.
            const userSearchInput = searchbar.value;

            // Create a new object to hold the final parameters.
            // Start with the defaults, then add the user's input.
            const searchParams = {
                ...defaultParams,
                search: userSearchInput || defaultParams.search
            };

            // Construct the query string from the final parameters object.
            const queryString = new URLSearchParams(searchParams).toString();

            // Define the base URL for the search page.
            const baseUrl = '/search/search.html';

            // Combine the base URL with the new query string.
            const finalUrl = `${baseUrl}?${queryString}`;

            // Redirect the browser to the new URL.
            window.location.href = finalUrl;
        }
    });
}