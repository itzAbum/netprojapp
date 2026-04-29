// Secure Task Manager - Frontend JavaScript
// Features: CSRF protection, input sanitization, lazy loading, performance optimization

let csrfToken = null;
let currentUser = null;

// ===== UTILITY FUNCTIONS =====

// Show/hide loading overlay
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Toast notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-message">${escapeHtml(message)}</div>`;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// XSS Prevention - Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sanitize input (client-side validation)
function sanitizeInput(input) {
    return input.trim().replace(/[<>'"]/g, '');
}

// ===== API FUNCTIONS =====

async function apiRequest(url, options = {}) {
    try {
        showLoading();
        
        // Add CSRF token to headers if available
        if (csrfToken && options.method !== 'GET') {
            options.headers = {
                ...options.headers,
                'X-CSRF-Token': csrfToken
            };
        }
        
        // Add credentials for session cookies
        options.credentials = 'include';
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        hideLoading();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

// Get CSRF token
async function getCsrfToken() {
    try {
        const data = await apiRequest('/api/csrf-token');
        csrfToken = data.csrf_token;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
    }
}

// ===== AUTHENTICATION =====

// Register user
async function register(name, email, password) {
    try {
        const data = await apiRequest('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: sanitizeInput(name),
                email: sanitizeInput(email),
                password: password
            })
        });
        
        showToast('Registration successful! Please login.', 'success');
        showLoginForm();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Login user
async function login(email, password) {
    try {
        const data = await apiRequest('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: sanitizeInput(email),
                password: password
            })
        });
        
        currentUser = data.user;
        csrfToken = data.csrf_token;
        
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        showDashboard();
        await loadTasks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Logout user
async function logout() {
    try {
        await apiRequest('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        currentUser = null;
        csrfToken = null;
        
        showToast('Logged out successfully', 'success');
        showAuthPage();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ===== TASK MANAGEMENT =====

let allTasks = [];

// Load tasks with lazy loading for better performance
async function loadTasks() {
    try {
        const data = await apiRequest('/api/tasks');
        allTasks = data.tasks;
        renderTasks();
        updateStats();
    } catch (error) {
        showToast('Failed to load tasks', 'error');
    }
}

// Render tasks with performance optimization
function renderTasks() {
    const container = document.getElementById('tasks-list');
    
    if (allTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No tasks yet. Create your first task above!</p>';
        return;
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    allTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        fragment.appendChild(taskCard);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
    
    // Lazy load images if any (for future enhancements)
    setupLazyLoading();
}

// Create task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.taskId = task._id;
    
    const createdDate = new Date(task.created_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <span>Created: ${createdDate}</span>
            </div>
        </div>
        <div class="task-actions">
            <button onclick="toggleTaskComplete('${task._id}', ${!task.completed})" class="btn btn-success">
                ${task.completed ? '↩️ Undo' : '✅ Complete'}
            </button>
            <button onclick="deleteTask('${task._id}')" class="btn btn-danger">🗑️ Delete</button>
        </div>
    `;
    
    return card;
}

// Create new task
async function createTask(title, description) {
    try {
        const data = await apiRequest('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: sanitizeInput(title),
                description: sanitizeInput(description)
            })
        });
        
        allTasks.unshift(data.task);
        renderTasks();
        updateStats();
        
        showToast('Task created successfully!', 'success');
        
        // Clear form
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Toggle task completion
async function toggleTaskComplete(taskId, completed) {
    try {
        await apiRequest(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        const task = allTasks.find(t => t._id === taskId);
        if (task) {
            task.completed = completed;
            renderTasks();
            updateStats();
        }
        
        showToast(completed ? 'Task completed!' : 'Task marked as pending', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await apiRequest(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        allTasks = allTasks.filter(t => t._id !== taskId);
        renderTasks();
        updateStats();
        
        showToast('Task deleted successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Update task statistics
function updateStats() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('total-tasks').textContent = `Total: ${total}`;
    document.getElementById('completed-tasks').textContent = `Completed: ${completed}`;
    document.getElementById('pending-tasks').textContent = `Pending: ${pending}`;
}

// ===== LAZY LOADING (Performance Optimization) =====

function setupLazyLoading() {
    // Lazy load images when they come into viewport
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== UI FUNCTIONS =====

function showAuthPage() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('dashboard-container').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
    }
}

function showLoginForm() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', async () => {
    // Get CSRF token on page load
    await getCsrfToken();
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await login(email, password);
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // Client-side validation
        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        
        await register(name, email, password);
    });
    
    // Task form
    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        
        if (!title.trim()) {
            showToast('Task title is required', 'error');
            return;
        }
        
        await createTask(title, description);
    });
    
    // Toggle between login/register
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Performance: Debounce resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Handle resize if needed
        }, 250);
    });
});

// ===== SERVICE WORKER FOR OFFLINE SUPPORT (PWA) =====
// Register service worker for caching and offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
