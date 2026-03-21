document.getElementById("year").innerHTML = new Date().getFullYear();
document.addEventListener("DOMContentLoaded", function() {
  const shareBtn = document.getElementById("shareBtn");
  const toast = document.getElementById("toast");

  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: 'Realme C83 5G Specs Review',
      text: 'Check out the specs for the Realme C83 5G - The 7000mAh Budget Beast!',
      url: window.location.href
    };

    // Check if the Web Share API is supported (Mobile/Modern Browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard (Desktop)
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast();
      } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        showToast();
      }
    }
  });

  function showToast() {
    toast.className = "toast show";
    setTimeout(function() {
      toast.className = toast.className.replace("show", "");
    }, 3000);
  }
});

// --- Theme Logic ---
const themeToggleBtn = document.getElementById('themeToggle');

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function updateThemeUI() {
  const isLight = document.documentElement.classList.contains('light-theme');
  if (isLight) {
    themeToggleBtn.innerHTML = `${moonIcon} Dark Mode`;
  } else {
    themeToggleBtn.innerHTML = `${sunIcon} Light Mode`;
  }
}

// Initial UI set
if (themeToggleBtn) {
  updateThemeUI();

  themeToggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    const isLight = document.documentElement.classList.contains('light-theme');
    localStorage.setItem('specstackle_theme', isLight ? 'light' : 'dark');
    updateThemeUI();
  });
}

// --- Affiliate Section Logic ---

// 1. Manage your affiliate content here
const affiliateData = {
  heading: "GET THE BEST DEALS",
  disclaimer: "Affiliate Disclosure: We may earn a small commission from purchases made through our links at no extra cost to you.",
  links: [
    {
      store: "Amazon",
      url: "#", // Replace with your default/search link
      price: "View Offers",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`
    },
    {
      store: "AliExpress",
      url: "#",
      price: "View Offers",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
    }
  ]
};

// 2. Render function
function renderAffiliateSection() {
  const container = document.getElementById('affiliate-section');

  // If the container doesn't exist on the page, stop here
  if (!container) return;

  // Build the HTML structure
  let html = `
    <div class="affiliate-box">
      <h3>${affiliateData.heading}</h3>
      <div class="affiliate-links">
        ${affiliateData.links.map(link => `
          <a href="${link.url}" target="_blank" rel="nofollow noopener" class="affiliate-btn">
            <span class="affiliate-icon">${link.icon}</span>
            <span class="affiliate-store">${link.store}</span>
            <span class="affiliate-price">${link.price} ↗</span>
          </a>
        `).join('')}
      </div>
      <p class="affiliate-disclaimer">${affiliateData.disclaimer}</p>
    </div>
  `;

  // Inject into the page
  container.innerHTML = html;
}

// 3. Trigger rendering when the DOM is ready
document.addEventListener("DOMContentLoaded", renderAffiliateSection);