

// ------------------------------------------------------------------------------
// 1. GLOBAL STATE & STORAGE KEYS
// ------------------------------------------------------------------------------
// These keys define where our data is saved in the browser's localStorage.
const STORAGE_KEY_ARTWORKS = 'artist_portfolio_artworks';
const STORAGE_KEY_AUTH = 'artist_portfolio_is_logged_in';

// Active filter and search state
let currentCategoryFilter = 'All';
let currentSearchKeyword = '';
let currentActiveArtworkId = null; // Tracks which artwork is currently open in the modal

const INITIAL_ARTWORKS = [
  {
    id: 1,
    title: "Whispers of the Golden Valley",
    category: "Painting",
    year: 2024,
    medium: "Oil on Linen Canvas (36 x 48 in)",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    description: "An evocative study of autumn light breaking through misty mountain valleys. Created with layered palette-knife techniques to evoke textured serenity and warmth.",
    likes: 24,
    comments: [
      { id: 101, author: "Marcus Vance", text: "The ambient light on the mountains feels so real!", date: "2024-10-14" },
      { id: 102, author: "Sarah Jenkins", text: "Incredible depth and texture.", date: "2024-10-18" }
    ]
  },
  {
    id: 2,
    title: "Cybernetic Genesis",
    category: "Digital Art",
    year: 2024,
    medium: "Digital Painting (Procreate & Blender 3D)",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    description: "A futuristic exploration of biological forms intertwined with synthetic networks. Inspired by biological fluid dynamics and neon luminescence.",
    likes: 42,
    comments: [
      { id: 103, author: "Devon Chen", text: "The color transitions and gradients are surreal.", date: "2024-11-02" }
    ]
  },
  {
    id: 3,
    title: "Urban Solitude at Dusk",
    category: "Photography",
    year: 2023,
    medium: "35mm Color Negative Film (Kodak Portra 400)",
    imageUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=900&q=80",
    description: "Captured during the blue hour in downtown Seattle. A lonely commuter pauses beneath towering architectural glass, reflecting the stillness inside modern city life.",
    likes: 19,
    comments: [
      { id: 104, author: "Chloe Martin", text: "Captures that nostalgic film mood perfectly.", date: "2024-09-29" }
    ]
  },
  {
    id: 4,
    title: "Anatomy of Thought",
    category: "Sketch",
    year: 2023,
    medium: "Vine Charcoal & Graphite on Heavyweight Cotton",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    description: "An expressive anatomical gesture drawing focusing on kinetic tension, raw energy, and the subtle contours of human form in contemplative rest.",
    likes: 31,
    comments: [
      { id: 105, author: "Liam Ross", text: "Such expressive cross-hatching and line weight!", date: "2024-08-11" }
    ]
  },
  {
    id: 5,
    title: "Crimson Horizon",
    category: "Painting",
    year: 2024,
    medium: "Acrylic & Gold Leaf on Wood Panel",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=80",
    description: "A bold, minimalist abstract composition highlighting contrasting warm reds and metallic gold reflections, capturing the energy of setting suns.",
    likes: 38,
    comments: [
      { id: 106, author: "Aria Thorne", text: "The gold leaf accents give this so much life under warm lighting.", date: "2024-10-30" }
    ]
  },
  {
    id: 6,
    title: "Metropolis in Fog",
    category: "Photography",
    year: 2024,
    medium: "High Resolution Monochrome Photography",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    description: "Morning mist wraps around high-rise skyscrapers, transforming harsh geometric steel and glass into ethereal, ghost-like silhouettes.",
    likes: 15,
    comments: []
  }
];

function getArtworks() {
  const storedData = localStorage.getItem(STORAGE_KEY_ARTWORKS);
  if (!storedData) {
    // Seed initial data on first load
    saveArtworks(INITIAL_ARTWORKS);
    return INITIAL_ARTWORKS;
  }
  try {
    return JSON.parse(storedData);
  } catch (err) {
    console.error("Failed to parse artworks from localStorage:", err);
    return INITIAL_ARTWORKS;
  }
}

/**
 * Saves the given array of artworks into browser's localStorage.
 * @param {Array} artworksArray - The list of artwork objects
 */
function saveArtworks(artworksArray) {
  localStorage.setItem(STORAGE_KEY_ARTWORKS, JSON.stringify(artworksArray));
}

/**
 * Checks whether the artist (admin) is currently logged in.
 */
function isArtistLoggedIn() {
  return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
}

/**
 * Sets the artist login state in localStorage.
 * @param {boolean} loggedIn
 */
function setArtistLoggedIn(loggedIn) {
  localStorage.setItem(STORAGE_KEY_AUTH, loggedIn ? 'true' : 'false');
}

// ------------------------------------------------------------------------------
// 4. APPLICATION INITIALIZATION
// ------------------------------------------------------------------------------
// This function runs automatically once the HTML document finishes loading.
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * Sets up initial view, gallery items, and authentication UI.
 */
function initApp() {
  // 1. Render the gallery cards
  renderGallery();

  // 2. Check if admin was previously logged in
  updateAuthUI();

  console.log("Online Artist Portfolio initialized successfully!");
}

// ------------------------------------------------------------------------------
// 5. GALLERY RENDERING & FILTERING
// ------------------------------------------------------------------------------

/**
 * Filters artworks based on current category and search keyword,
 * then generates HTML cards inside #galleryGrid.
 */
function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('emptyState');
  const galleryCount = document.getElementById('galleryCount');
  
  const allArtworks = getArtworks();

  // Filter by Category and Search Keyword
  const filteredArtworks = allArtworks.filter(art => {
    // Category match
    const categoryMatches = (currentCategoryFilter === 'All') || (art.category === currentCategoryFilter);

    // Search query match (checks title and medium)
    const query = currentSearchKeyword.trim().toLowerCase();
    const titleMatches = art.title.toLowerCase().includes(query);
    const mediumMatches = art.medium.toLowerCase().includes(query);
    const searchMatches = (query === '') || titleMatches || mediumMatches;

    return categoryMatches && searchMatches;
  });

  // Update counter badge
  if (filteredArtworks.length === allArtworks.length) {
    galleryCount.textContent = `Showing all ${allArtworks.length} works`;
  } else {
    galleryCount.textContent = `Showing ${filteredArtworks.length} of ${allArtworks.length} works`;
  }

  // Handle empty state (no items found)
  if (filteredArtworks.length === 0) {
    galleryGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Build the artwork cards HTML
  let cardsHtml = '';
  filteredArtworks.forEach(art => {
    // Select category badge CSS class
    const badgeClass = getCategoryBadgeClass(art.category);

    cardsHtml += `
      <article class="art-card" data-id="${art.id}">
        <div class="art-thumb-wrapper" onclick="openDetailsModal(${art.id})">
          <img 
            src="${escapeHtml(art.imageUrl)}" 
            alt="${escapeHtml(art.title)}" 
            class="art-thumb" 
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'"
          >
        </div>

        <div class="art-info">
          <div class="art-meta-row">
            <span class="badge ${badgeClass}">${escapeHtml(art.category)}</span>
            <span class="art-year">${art.year}</span>
          </div>

          <h3 class="art-title" onclick="openDetailsModal(${art.id})">${escapeHtml(art.title)}</h3>
          <p class="art-medium-text">${escapeHtml(art.medium)}</p>

          <div class="art-footer-actions">
            <!-- Like Button -->
            <button class="btn-like" onclick="handleCardLike(event, ${art.id})">
              <span>❤️</span>
              <span id="card-like-${art.id}">${art.likes}</span>
            </button>

            <!-- View Details Button -->
            <button class="btn-details" onclick="openDetailsModal(${art.id})">
              Details & Comments (${art.comments ? art.comments.length : 0}) &rarr;
            </button>
          </div>
        </div>
      </article>
    `;
  });

  galleryGrid.innerHTML = cardsHtml;
}

/**
 * Returns a CSS class name for styling category badges distinctly.
 */
function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Painting': return 'badge-painting';
    case 'Digital Art': return 'badge-digital';
    case 'Photography': return 'badge-photo';
    case 'Sketch': return 'badge-sketch';
    default: return 'badge-sketch';
  }
}

/**
 * Handles live input in the search box.
 */
function handleSearchInput(event) {
  currentSearchKeyword = event.target.value;
  const clearBtn = document.getElementById('clearSearchBtn');
  
  if (currentSearchKeyword.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  renderGallery();
}

/**
 * Clears the search text box.
 */
function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  currentSearchKeyword = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  renderGallery();
}

/**
 * Handles category button clicks (All, Painting, Digital Art, etc.).
 */
function handleCategoryFilter(selectedCategory) {
  currentCategoryFilter = selectedCategory;

  // Update active state on filter buttons
  const buttons = document.querySelectorAll('#categoryFilterGroup .filter-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-category') === selectedCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderGallery();
}

/**
 * Resets search input and category filter back to default.
 */
function resetFilters() {
  clearSearch();
  handleCategoryFilter('All');
}

// ------------------------------------------------------------------------------
// 6. VISITOR INTERACTIONS (LIKES & DETAILS MODAL)
// ------------------------------------------------------------------------------

/**
 * Handles clicking the like button on an individual card.
 * Increments the like counter, saves to localStorage, and updates the UI.
 */
function handleCardLike(event, artworkId) {
  event.stopPropagation(); // Prevents triggering card click / modal open
  incrementArtworkLikes(artworkId);
}

/**
 * Handles clicking the like button from inside the details modal.
 */
function handleLikeFromModal() {
  if (currentActiveArtworkId !== null) {
    incrementArtworkLikes(currentActiveArtworkId);
  }
}

/**
 * Core like logic: Updates the artwork's like count in localStorage and updates UI.
 */
function incrementArtworkLikes(artworkId) {
  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === artworkId);

  if (artwork) {
    artwork.likes = (artwork.likes || 0) + 1;
    saveArtworks(artworks);

    // Update Card UI if present
    const cardLikeSpan = document.getElementById(`card-like-${artworkId}`);
    if (cardLikeSpan) {
      cardLikeSpan.textContent = artwork.likes;
    }

    // Update Modal UI if this item is open
    if (currentActiveArtworkId === artworkId) {
      const modalLikeCount = document.getElementById('modalLikeCount');
      if (modalLikeCount) {
        modalLikeCount.textContent = artwork.likes;
      }
    }

    // Update Admin Table if visible
    if (isArtistLoggedIn()) {
      renderAdminTable();
    }
  }
}

/**
 * Opens the Artwork Details & Comments modal.
 * Populates artwork image, title, medium, description, likes, and comments.
 */
function openDetailsModal(artworkId) {
  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === artworkId);

  if (!artwork) return;

  currentActiveArtworkId = artworkId;

  // Populate Modal Fields
  document.getElementById('modalArtImage').src = artwork.imageUrl;
  document.getElementById('modalArtTitle').textContent = artwork.title;
  document.getElementById('modalArtCategory').textContent = artwork.category;
  document.getElementById('modalArtCategory').className = `badge ${getCategoryBadgeClass(artwork.category)}`;
  document.getElementById('modalArtYear').textContent = artwork.year;
  document.getElementById('modalArtMedium').textContent = artwork.medium;
  document.getElementById('modalArtDescription').textContent = artwork.description;
  document.getElementById('modalLikeCount').textContent = artwork.likes;

  // Render comments for this artwork
  renderModalComments(artwork.comments || []);

  // Show the modal
  openModal('detailsModal');
}

/**
 * Renders the comments list inside the details modal.
 */
function renderModalComments(comments) {
  const listContainer = document.getElementById('modalCommentsList');
  const countSpan = document.getElementById('modalCommentsCount');

  countSpan.textContent = comments.length;

  if (comments.length === 0) {
    listContainer.innerHTML = `<p class="no-comments-msg">No comments yet. Be the first visitor to share your thoughts!</p>`;
    return;
  }

  let html = '';
  comments.forEach(comment => {
    html += `
      <div class="comment-item">
        <div class="comment-author-bar">
          <span class="comment-author">${escapeHtml(comment.author)}</span>
          <span class="comment-date">${escapeHtml(comment.date)}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

// ------------------------------------------------------------------------------
// 7. COMMENT SYSTEM
// ------------------------------------------------------------------------------

/**
 * Handles submitting the comment form
 */
function handlePostComment(event) {
  event.preventDefault();

  if (currentActiveArtworkId === null) return;

  const authorInput = document.getElementById('commentAuthor');
  const textInput = document.getElementById('commentText');

  const author = authorInput.value.trim();
  const text = textInput.value.trim();

  if (!author || !text) {
    alert("Please enter your name and a comment.");
    return;
  }

  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === currentActiveArtworkId);

  if (artwork) {
    if (!artwork.comments) {
      artwork.comments = [];
    }

    // Format current date: YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const newComment = {
      id: Date.now(),
      author: author,
      text: text,
      date: today
    };

    artwork.comments.push(newComment);
    saveArtworks(artworks);

    // Refresh comments in modal
    renderModalComments(artwork.comments);

    // Reset comment form inputs
    authorInput.value = '';
    textInput.value = '';

    // Re-render gallery cards to update comment counter on card
    renderGallery();

    // Re-render admin table if logged in
    if (isArtistLoggedIn()) {
      renderAdminTable();
    }
  }
}

// ------------------------------------------------------------------------------
// 8. ARTIST AUTHENTICATION (LOGIN / LOGOUT)
// ------------------------------------------------------------------------------

/**
 * Opens or closes the login modal based on current auth state.
 */
function toggleAuthModal() {
  if (isArtistLoggedIn()) {
    // If already logged in, scroll to admin dashboard
    const dashboard = document.getElementById('adminDashboard');
    dashboard.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Open login modal
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').classList.add('hidden');
    openModal('loginModal');
  }
}

/**
 * Handles the login form submission.

 */
function handleLoginSubmit(event) {
  event.preventDefault();

  const user = document.getElementById('loginUsername').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const errorDiv = document.getElementById('loginError');

  // Basic authentication check
  if (user === 'admin' && pass === '1234') {
    setArtistLoggedIn(true);
    closeModal('loginModal');
    updateAuthUI();
    alert("Welcome back, Elena! Artist Studio Mode is now activated.");
    
    // Scroll smoothly to dashboard
    const dashboard = document.getElementById('adminDashboard');
    dashboard.scrollIntoView({ behavior: 'smooth' });
  } else {
    errorDiv.classList.remove('hidden');
  }
}

/**
 * Logs out the artist and returns to visitor view.
 */
function handleLogout() {
  if (confirm("Are you sure you want to log out of Artist Studio?")) {
    setArtistLoggedIn(false);
    updateAuthUI();
    alert("You have been logged out. Returned to visitor view.");
  }
}

/**
 * Updates UI elements based on whether the artist is logged in or not.
 */
function updateAuthUI() {
  const loggedIn = isArtistLoggedIn();
  const authBtn = document.getElementById('authBtn');
  const adminDashboard = document.getElementById('adminDashboard');

  if (loggedIn) {
    authBtn.innerHTML = '⚙️ Artist Studio';
    authBtn.classList.remove('btn-primary');
    authBtn.classList.add('btn-secondary');
    adminDashboard.classList.remove('hidden');
    renderAdminTable();
  } else {
    authBtn.innerHTML = '🔑 Artist Login';
    authBtn.classList.remove('btn-secondary');
    authBtn.classList.add('btn-primary');
    adminDashboard.classList.add('hidden');
  }
}

// ------------------------------------------------------------------------------
// 9. ARTIST DASHBOARD (ADD, EDIT, DELETE CRUD OPERATIONS)
// ------------------------------------------------------------------------------

function fillSampleImage(url) {
  const imgInput = document.getElementById('artImage');
  if (imgInput) {
    imgInput.value = url;
    imgInput.focus();
  }
}

/**
 * Handles adding a new artwork from the admin form.
 */
function handleAddNewArtwork(event) {
  event.preventDefault();

  const title = document.getElementById('artTitle').value.trim();
  const category = document.getElementById('artCategory').value;
  const year = parseInt(document.getElementById('artYear').value, 10);
  const medium = document.getElementById('artMedium').value.trim();
  const imageUrl = document.getElementById('artImage').value.trim();
  const description = document.getElementById('artDescription').value.trim();

  if (!title || !medium || !imageUrl || !description) {
    alert("Please fill in all required fields!");
    return;
  }

  // Create new artwork object
  const newArtwork = {
    id: Date.now(), // Generate unique ID using current timestamp
    title: title,
    category: category,
    year: year || new Date().getFullYear(),
    medium: medium,
    imageUrl: imageUrl,
    description: description,
    likes: 0,
    comments: []
  };

  // Prepend to artworks array (newest first)
  const artworks = getArtworks();
  artworks.unshift(newArtwork);
  saveArtworks(artworks);

  // Reset form
  document.getElementById('addArtworkForm').reset();
  document.getElementById('artYear').value = new Date().getFullYear();

  // Re-render gallery and admin table
  renderGallery();
  renderAdminTable();

  alert(`"${title}" was successfully published to your portfolio!`);
}

/**
 * Renders the table of existing artworks in the admin dashboard.
 */
function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const countSpan = document.getElementById('adminTotalCount');
  const artworks = getArtworks();

  countSpan.textContent = artworks.length;

  if (artworks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No artworks in portfolio yet. Use the form above to add one!</td></tr>`;
    return;
  }

  let rowsHtml = '';
  artworks.forEach(art => {
    rowsHtml += `
      <tr>
        <td>
          <img src="${escapeHtml(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="table-thumb" onerror="this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=100&q=80'">
        </td>
        <td><strong>${escapeHtml(art.title)}</strong></td>
        <td><span class="badge ${getCategoryBadgeClass(art.category)}">${escapeHtml(art.category)}</span></td>
        <td>${art.year}</td>
        <td>❤️ ${art.likes || 0}</td>
        <td>💬 ${art.comments ? art.comments.length : 0}</td>
        <td>
          <div class="table-actions">
            <button class="btn-edit" onclick="openEditModal(${art.id})">✏️ Edit</button>
            <button class="btn-delete" onclick="handleDeleteArtwork(${art.id})">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
}

/**
 * Deletes an artwork from the portfolio after confirmation.
 */
function handleDeleteArtwork(artworkId) {
  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === artworkId);

  if (!artwork) return;

  const confirmed = confirm(`Are you sure you want to permanently delete "${artwork.title}"?`);
  if (!confirmed) return;

  // Filter out the deleted item
  const updatedArtworks = artworks.filter(item => item.id !== artworkId);
  saveArtworks(updatedArtworks);

  // If the deleted artwork was open in modal, close it
  if (currentActiveArtworkId === artworkId) {
    closeModal('detailsModal');
  }

  renderGallery();
  renderAdminTable();

  alert(`Artwork "${artwork.title}" was deleted.`);
}

/**
 * Opens the Edit Artwork modal and loads existing values into the fields.
 */
function openEditModal(artworkId) {
  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === artworkId);

  if (!artwork) return;

  document.getElementById('editArtId').value = artwork.id;
  document.getElementById('editArtTitle').value = artwork.title;
  document.getElementById('editArtCategory').value = artwork.category;
  document.getElementById('editArtYear').value = artwork.year;
  document.getElementById('editArtMedium').value = artwork.medium;
  document.getElementById('editArtImage').value = artwork.imageUrl;
  document.getElementById('editArtDescription').value = artwork.description;

  openModal('editModal');
}

/**
 * Saves edits made to an existing artwork.
 */
function handleSaveEditArtwork(event) {
  event.preventDefault();

  const id = parseInt(document.getElementById('editArtId').value, 10);
  const title = document.getElementById('editArtTitle').value.trim();
  const category = document.getElementById('editArtCategory').value;
  const year = parseInt(document.getElementById('editArtYear').value, 10);
  const medium = document.getElementById('editArtMedium').value.trim();
  const imageUrl = document.getElementById('editArtImage').value.trim();
  const description = document.getElementById('editArtDescription').value.trim();

  const artworks = getArtworks();
  const artwork = artworks.find(item => item.id === id);

  if (!artwork) {
    alert("Could not find the artwork to update.");
    return;
  }

  // Update properties
  artwork.title = title;
  artwork.category = category;
  artwork.year = year;
  artwork.medium = medium;
  artwork.imageUrl = imageUrl;
  artwork.description = description;

  saveArtworks(artworks);
  closeModal('editModal');

  // Refresh UI
  renderGallery();
  renderAdminTable();

  // If details modal happens to be open for this item, update it too
  if (currentActiveArtworkId === id) {
    openDetailsModal(id);
  }

  alert("Artwork updated successfully!");
}

// ------------------------------------------------------------------------------
// 10. UTILITY & MODAL HELPERS
// ------------------------------------------------------------------------------

/**
 * Displays a modal by removing its 'hidden' CSS class.
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Closes a modal by adding its 'hidden' CSS class.
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    // Restore scrolling
    document.body.style.overflow = '';
  }
  if (modalId === 'detailsModal') {
    currentActiveArtworkId = null;
  }
}

/**
 * Closes the modal if user clicks on the dark backdrop outside the modal dialog.
 */
function handleBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

/**
 * Closes modals when the Escape key is pressed.
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal('detailsModal');
    closeModal('loginModal');
    closeModal('editModal');
  }
});

/**
 * Basic HTML sanitizer to prevent XSS injection in user-entered comments/titles.
 */
function escapeHtml(string) {
  if (typeof string !== 'string') return string;
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
