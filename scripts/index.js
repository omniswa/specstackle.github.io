// --- DOM Elements ---
const phoneGrid = document.getElementById('phoneGrid');
const searchInput = document.getElementById('searchInput');
const brandFilter = document.getElementById('brandFilter');
const yearFilter = document.getElementById('yearFilter');
const paginationContainer = document.getElementById('pagination');
document.getElementById("year").innerHTML = new Date().getFullYear();

// --- SVG Icons ---
const cpuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
const batteryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="16" rx="2" ry="2"></rect><line x1="10" y1="2" x2="14" y2="2"></line><line x1="10" y1="12" x2="14" y2="12"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>`;
const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

// --- Global State ---
let currentPage = 1;
const itemsPerPage = 6;
let filteredDataGlobal = [];
let currentPhones = [];

// --- Dynamic Data Loader ---
async function loadPhoneData(year) {
  phoneGrid.classList.add('loading'); // Show skeletons

  try {
    const module = await import(`../data/${year}.js`);
    currentPhones = module.default;
    handleFilters();
  } catch (error) {
    console.error("Error loading phone data:", error);
    phoneGrid.classList.remove('loading');
    phoneGrid.innerHTML = `
        <div class="no-results">
          <h3>Failed to load data</h3>
          <p style="margin-top: 8px;">File for ${year} might not exist yet.</p>
        </div>`;
  }
}

// --- Render Function ---
function renderPhones(data) {
  phoneGrid.classList.remove('loading'); // Hide skeletons
  phoneGrid.innerHTML = '';

  if (data.length === 0) {
    phoneGrid.innerHTML = `
          <div class="no-results">
            <h3>No devices found</h3>
            <p style="margin-top: 8px;">Try adjusting your search or filters.</p>
          </div>
        `;
    return;
  }

  data.forEach(phone => {
    const card = document.createElement('a');
    card.href = phone.url;
    card.className = 'card';
    card.innerHTML = `
          <div class="card-header">
            <span class="brand-tag">${phone.brand}</span>
            <span class="year-tag">${phone.year}</span>
          </div>
          <h2 class="card-title">${phone.model}</h2>
          
          <div class="specs-wrapper">
            <div class="spec-pill">
              ${cpuIcon}
              <span>${phone.processor}</span>
            </div>
            <div class="spec-pill">
              ${batteryIcon}
              <span>${phone.battery}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="price">${phone.price}</span>
            <span class="view-btn">Specs ${arrowIcon}</span>
          </div>
        `;
    phoneGrid.appendChild(card);
  });
}

// --- Filter Logic ---
function handleFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedBrand = brandFilter.value;

  // Filter the full list
  const filtered = currentPhones.filter(phone => {
    const matchesSearch = phone.model.toLowerCase().includes(searchTerm) ||
      phone.brand.toLowerCase().includes(searchTerm) ||
      phone.processor.toLowerCase().includes(searchTerm) ||
      phone.battery.toLowerCase().includes(searchTerm) ||
      phone.model.toLowerCase().includes(searchTerm) ||
      phone.price.toLowerCase().includes(searchTerm);
    const matchesBrand = selectedBrand === 'all' || phone.brand.toLowerCase().includes(selectedBrand.toLowerCase());
    return matchesSearch && matchesBrand;
  });

  // Reverse once here
  filteredDataGlobal = filtered.reverse();

  // Reset to page 1 whenever filters change
  currentPage = 1;

  updateDisplay();
}

// This handles slicing the data and rendering both the grid and pagination UI
function updateDisplay() {
  const totalPages = Math.ceil(filteredDataGlobal.length / itemsPerPage);

  // Slice data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredDataGlobal.slice(startIndex, startIndex + itemsPerPage);

  renderPhones(paginatedData);
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPageNum');
  const totalPageSpan = document.getElementById('totalPageNum');

  // Update the text
  currentPageSpan.textContent = currentPage;
  totalPageSpan.textContent = totalPages;

  // Hide pagination if only 1 page
  if (totalPages <= 1) {
    paginationContainer.classList.add('hidden');
    return;
  }

  paginationContainer.classList.remove('hidden');

  // Update disabled states
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Add click listeners
  prevBtn.onclick = () => {
    currentPage--;
    updateDisplay();
    window.scrollTo({ top: 0 });
  };

  nextBtn.onclick = () => {
    currentPage++;
    updateDisplay();
    window.scrollTo({ top: 0 });
  };
}

// --- Event Listeners ---
searchInput.addEventListener('input', handleFilters);
brandFilter.addEventListener('change', handleFilters);

// When year changes, fetch the new file!
yearFilter.addEventListener('change', (e) => {
  loadPhoneData(e.target.value);
});

// Initial Render (Loads whatever is selected in the dropdown on page load)
loadPhoneData(yearFilter.value);

/* Theme */

const themeToggleBtn = document.getElementById('themeToggle');

// --- Theme SVG Icons ---
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

// --- Theme Logic ---
function updateThemeUI() {
  const isLight = document.documentElement.classList.contains('light-theme');
  if (isLight) {
    themeToggleBtn.innerHTML = `${moonIcon} Dark Mode`;
  } else {
    themeToggleBtn.innerHTML = `${sunIcon} Light Mode`;
  }
}

// Set initial button state based on the class applied by the script in <head>
updateThemeUI();

themeToggleBtn.addEventListener('click', () => {
  // Toggle the class on the HTML tag
  document.documentElement.classList.toggle('light-theme');

  // Save preference to localStorage
  const isLight = document.documentElement.classList.contains('light-theme');
  localStorage.setItem('specstackle_theme', isLight ? 'light' : 'dark');

  // Update the button's icon and text
  updateThemeUI();
});