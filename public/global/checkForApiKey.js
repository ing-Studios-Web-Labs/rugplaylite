function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function checkForAPIKey() {
    while (true) {
        const retrievedAPIKey = getCookie('rugplayAPIKey');
        if (retrievedAPIKey) {
            break;
        }
        
        // Prompt the user for a key
        const keyToSet = prompt('Please enter your Rugplay API key before you continue.');
        
        // If the user entered a key, set the cookie and continue the loop
        if (keyToSet && keyToSet === 'devlocal') { 
            if (confirm("Please confirm that you are a developer or you are running the project locally and have the API key stored in the .env file. Continuing may break the site.")) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                document.cookie = `rugplayAPIKey=devlocal; expires=${expiry.toUTCString()}; path=/`;
            } else {
                continue;
            }
        } else if (keyToSet) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            document.cookie = `rugplayAPIKey=${keyToSet}; expires=${expiry.toUTCString()}; path=/`;
        }
    }
}

export function fetchAPIKey() {
    return getCookie('rugplayAPIKey');
}