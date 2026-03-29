// --- DOM Elements ---
const blogGrid = document.getElementById('blogGrid');
const searchInput = document.getElementById('searchInput');
const topicFilter = document.getElementById('topicFilter');
const yearFilter = document.getElementById('yearFilter');
const paginationContainer = document.getElementById('pagination');
document.getElementById("year").innerHTML = new Date().getFullYear();
const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
const dateIcon = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

// --- Global State ---
let currentPage = 1;
const itemsPerPage = 6;
let filteredDataGlobal = [];
let currentBlogs = [];

// --- Dynamic Data Loader ---
async function loadBlogData(year) {
  blogGrid.classList.add('loading'); // Show skeletons

  try {
    const module = await import(`../blog-data/${year}.js`);
    currentBlogs = module.default;
    handleFilters();
  } catch (error) {
    console.error("Error loading blog data:", error);
    blogGrid.classList.remove('loading');
    blogGrid.innerHTML = `
        <div class="no-results">
          <h3>Failed to load data</h3>
          <p style="margin-top: 8px;">File for ${year} might not exist yet.</p>
        </div>`;
  }
}

// --- Render Function ---
function renderBlogs(data) {
  blogGrid.classList.remove('loading'); // Hide skeletons
  blogGrid.innerHTML = '';

  if (data.length === 0) {
    blogGrid.innerHTML = `
          <div class="no-results">
            <h3>No blog found</h3>
            <p style="margin-top: 8px;">Try adjusting your search or filters.</p>
          </div>
        `;
    return;
  }

  data.forEach(blog => {
    const card = document.createElement('a');
    card.href = blog.link; // Updated to .link
    card.className = 'card';

    // Updated HTML structure for the new data format
    card.innerHTML = `
          <div class="card-header">
            <span class="category-tag">${blog.category}</span>
          </div>
          
          <h2 class="card-title">${blog.title}</h2>
          
          <p class="card-excerpt">${blog.excerpt}</p>

          <div class="card-footer">
            <span class="published-tag">${dateIcon} ${blog.published}</span>
            <span class="view-btn">Read Article ${arrowIcon}</span>
          </div>
        `;
    blogGrid.appendChild(card);
  });
}

// --- Filter Logic ---
function handleFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedTopic = topicFilter.value.toLowerCase();

  // Filter the full list based on new properties
  const filtered = currentBlogs.filter(blog => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm) ||
      blog.excerpt.toLowerCase().includes(searchTerm) ||
      blog.category.toLowerCase().includes(searchTerm);

    // Since your new data lacks a explicit "topic" key, this checks if the 
    // topic dropdown value exists anywhere in the title or excerpt.
    const matchesTopic = selectedTopic === 'all' || blog.category.toLowerCase().includes(selectedTopic);
    return matchesSearch && matchesTopic;
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

  renderBlogs(paginatedData);
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
topicFilter.addEventListener('change', handleFilters);

// When year changes, fetch the new file!
yearFilter.addEventListener('change', (e) => {
  loadBlogData(e.target.value);
});

// Initial Render (Loads whatever is selected in the dropdown on page load)
loadBlogData(yearFilter.value);

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