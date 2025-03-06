function resetForm(form) {
    form.reset();
}

function populateDropdown(selectElement, options) {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        selectElement.appendChild(opt);
    });
}

function clearDropdown(selectElement) {
    selectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Sélectionner une option';
    selectElement.appendChild(defaultOption);
}

function toggleVisibility(element, isVisible) {
    element.style.display = isVisible ? 'block' : 'none';
}

export { resetForm, populateDropdown, clearDropdown, toggleVisibility };