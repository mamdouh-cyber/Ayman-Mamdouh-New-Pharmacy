// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    // Check current page and redirect appropriately
    const currentPath = window.location.pathname;
    if (currentPath.includes('login.html')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Function to determine if a color is light or dark
function isLightColor(color) {
  // Convert color to RGB values
  let r, g, b;

  if (color.startsWith('#')) {
    // Hex color
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    // RGB color
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else if (color.startsWith('rgba')) {
    // RGBA color
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  }

  // Calculate brightness using luminance formula
  if (r !== undefined && g !== undefined && b !== undefined) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150; // Threshold for determining light/dark
  }

  // Default to light if we can't determine
  return true;
}

// Function to set text color based on background
function setTextColorBasedOnBackground(element) {
  // Get the computed background color
  const computedStyle = window.getComputedStyle(element);
  let bgColor = computedStyle.backgroundColor;

  // Check if the background is transparent or default
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
    // If background is transparent, check parent elements
    let parent = element.parentElement;
    while (parent) {
      const parentBg = window.getComputedStyle(parent).backgroundColor;
      if (parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
        bgColor = parentBg;
        break;
      }
      parent = parent.parentElement;
    }
  }

  // Determine if background is light or dark
  if (isLightColor(bgColor)) {
    // Light background - use dark text
    element.style.color = '#000000'; // Black text
  } else {
    // Dark background - use light text
    element.style.color = '#ffffff'; // White text
  }
}

// Function to apply text color adjustment to all elements
function applyAutoTextColor() {
  // Find all elements that might need auto text color
  // This includes elements with background colors set via CSS or inline styles
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    // Check if element has a background color set
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    
    // Only apply to elements that have a non-transparent background
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgColor !== 'initial' && bgColor !== 'inherit') {
      // Check if the element contains text content
      if (element.textContent && element.textContent.trim() !== '' && 
          (element.tagName === 'DIV' || element.tagName === 'P' || element.tagName === 'H1' || 
           element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4' || 
           element.tagName === 'H5' || element.tagName === 'H6' || element.tagName === 'SPAN' ||
           element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'LI')) {
        setTextColorBasedOnBackground(element);
      }
    }
  });
}

// Dark Mode
document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const toggleButton = document.getElementById("themeToggle");

  // Apply saved theme preference (if any)
  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (toggleButton) {
      toggleButton.textContent = "☀️ وضع النهار";
    }
  } else {
    // Still apply light theme class if needed
  }

  if (!toggleButton) return;

  toggleButton.addEventListener("click", function () {
    const isDark = body.classList.toggle("dark-mode");

    if (isDark) {
      toggleButton.textContent = "☀️ وضع النهار";
      window.localStorage.setItem("theme", "dark");
    } else {
      toggleButton.textContent = "🌙 وضع الليل";
      window.localStorage.setItem("theme", "light");
    }
    
    // Reapply text colors based on background after theme change
    setTimeout(applyAutoTextColor, 100);
  });

  // Apply CSS variables on page load
  // Ensure text color is always white regardless of theme
  document.documentElement.style.setProperty('--text-color', '#ffffff');
});

// Function to determine if a color is light or dark
function isLightColor(color) {
  // Convert color to RGB values
  let r, g, b;

  if (color.startsWith('#')) {
    // Hex color
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    // RGB color
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else if (color.startsWith('rgba')) {
    // RGBA color
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  }

  // Calculate brightness using luminance formula
  if (r !== undefined && g !== undefined && b !== undefined) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150; // Threshold for determining light/dark
  }

  // Default to light if we can't determine
  return true;
}

// Function to set text color based on background
function setTextColorBasedOnBackground(element) {
  // Get the computed background color
  const computedStyle = window.getComputedStyle(element);
  let bgColor = computedStyle.backgroundColor;

  // Check if the background is transparent or default
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
    // If background is transparent, check parent elements
    let parent = element.parentElement;
    while (parent) {
      const parentBg = window.getComputedStyle(parent).backgroundColor;
      if (parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
        bgColor = parentBg;
        break;
      }
      parent = parent.parentElement;
    }
  }

  // Determine if background is light or dark
  if (isLightColor(bgColor)) {
    // Light background - use dark text
    element.style.color = '#000000'; // Black text
  } else {
    // Dark background - use light text
    element.style.color = '#ffffff'; // White text
  }
}

// Function to apply text color adjustment to all elements
function applyAutoTextColor() {
  // Find all elements that might need auto text color
  // This includes elements with background colors set via CSS or inline styles
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    // Check if element has a background color set
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    
    // Only apply to elements that have a non-transparent background
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgColor !== 'initial' && bgColor !== 'inherit') {
      // Check if the element contains text content
      if (element.textContent && element.textContent.trim() !== '' && 
          (element.tagName === 'DIV' || element.tagName === 'P' || element.tagName === 'H1' || 
           element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4' || 
           element.tagName === 'H5' || element.tagName === 'H6' || element.tagName === 'SPAN' ||
           element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'LI')) {
        setTextColorBasedOnBackground(element);
      }
    }
  });
}

// Apply auto text color immediately
applyAutoTextColor();

// Add event listener for when new content is loaded dynamically
window.addEventListener('load', function() {
  applyAutoTextColor();
});

// Also apply when the page is resized or when elements are dynamically added
window.addEventListener('resize', function() {
  applyAutoTextColor();
});

// Create a MutationObserver to watch for dynamically added elements
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          setTextColorBasedOnBackground(node);
          // Check child elements too
          const childElements = node.querySelectorAll && node.querySelectorAll('*');
          if (childElements) {
            childElements.forEach(setTextColorBasedOnBackground);
          }
        }
      });
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});
