export function colorCoinChange(elementId, change) {
    console.log('Element ID:', elementId);
    const elementToEdit = document.getElementById(elementId);
    if (!elementToEdit) {
        console.error('Element to edit color is not found.');
        return;
    }
    if (change >= 0) {
        elementToEdit.style.backgroundColor = 'var(--positive-change-color)';
    } else {
        elementToEdit.style.backgroundColor = 'var(--negative-change-color)';
    }
}