const hamburgerButton = document.querySelector('.navbar-toggler'); // ✅ Gets the first matching element
const codeEditor = document.getElementById('navbarNav');
let isIntelliSenseVisible = false;

if (hamburgerButton && codeEditor) {
  hamburgerButton.addEventListener('click', () => {
    isIntelliSenseVisible = !isIntelliSenseVisible;
    
    if (isIntelliSenseVisible) {
      codeEditor.style.display = 'block';
    } else {
      codeEditor.style.display = 'none';
    }
  });
} else {
  console.warn('Hamburger button or navbar (navbarNav) not found in DOM.');
}