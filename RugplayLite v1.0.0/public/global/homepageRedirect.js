export function redirectToHomepage(homepageIconID) {
    const homepageIcon = document.getElementById(homepageIconID);
    homepageIcon.addEventListener('click', () => {
        document.location.href = '/homepage/homepage.html';
    });
}