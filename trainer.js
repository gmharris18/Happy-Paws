// ============================================================================
// TRAINER PORTAL - Complete Application Object
// ============================================================================
const trainerPortal = {
    // Current trainer ID (retrieved from localStorage or session)
    trainerId: null,
    
    // Trainer profile data
    trainerData: null,
    
    // Currently editing class ID (null when creating new)
    editingClassId: null,
    
    // Currently viewing bookings for this class ID
    viewingBookingsForClassId: null,
    
    // Array to store all classes
    classes: [],
    
    // Filtered and sorted classes for display
    displayedClasses: [],
    
    // All bookings data
    bookings: [],
    
    // Current search term
    searchTerm: '',
    
    // Current filter value
    currentFilter: 'all',
    
    // Current sort option
    currentSort: 'newest',

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    /**
     * Initialize the portal when page loads
     */
    async init() {
        // Get trainer ID from localStorage (set during login)
        this.trainerId = localStorage.getItem('trainerId') || localStorage.getItem('hpt_trainer_id');
        
        // Check if trainer is logged in
        if (!this.trainerId) {
            alert('You must be logged in as a trainer to access this page.');
            window.location.href = 'login.html';
            return;
        }

        // Load trainer profile data
        await this.loadTrainerData();
        
        // Load trainer's classes
        await this.loadClasses();
        
        // Load all bookings
        await this.loadBookings();
        
        // Initialize UI
        this.updateProfileDisplay();
        this.renderClasses();
        this.renderAllBookings();
    },

    // ============================================================================
    // TRAINER DATA LOADING
    // ============================================================================
    /**
     * Load trainer profile information
     * TODO: Replace this with actual API call to your backend
     * 
     * Example API call:
     * async loadTrainerData() {
     *     try {
     *         const response = await fetch(`https://api.yourdomain.com/api/trainers/${this.trainerId}`, {
     *             method: 'GET',
     *             headers: {
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             }
     *         });
     * 
     *         if (!response.ok) {
     *             throw new Error('Failed to load trainer data');
     *         }
     * 
     *         const data = await response.json();
     *         this.trainerData = data;
     *         this.updateProfileDisplay();
     *     } catch (error) {
     *         console.error('Error loading trainer data:', error);
     *         this.showError('Failed to load trainer profile');
     *     }
     * }
     */
    async loadTrainerData() {
        try {
            const response = await fetch(`http://localhost:3000/api/trainer?trainerId=${this.trainerId}`);
            if (response.ok) {
                const data = await response.json();
                this.trainerData = {
                    id: data.TrainerID || this.trainerId,
                    name: `${data.FName || ''} ${data.LName || ''}`.trim() || 'Trainer',
                    email: data.Email || '',
                    firstName: data.FName || 'Trainer',
                    lastName: data.LName || '',
                    specialization: data.Specialization || '',
                    yearsOfExperience: data.YearsOfExperience || 0
                };
            } else {
                // Fallback to localStorage if API fails
                const trainerEmail = localStorage.getItem('trainerEmail') || 'trainer@example.com';
                const trainerName = localStorage.getItem('trainerName') || 'Trainer';
                this.trainerData = {
                    id: this.trainerId,
                    name: trainerName,
                    email: trainerEmail,
                    firstName: trainerName.split(' ')[0] || 'Trainer',
                    lastName: trainerName.split(' ').slice(1).join(' ') || ''
                };
            }
        } catch (error) {
            console.error('Error loading trainer data:', error);
            // Fallback to localStorage
            const trainerEmail = localStorage.getItem('trainerEmail') || 'trainer@example.com';
            const trainerName = localStorage.getItem('trainerName') || 'Trainer';
            this.trainerData = {
                id: this.trainerId,
                name: trainerName,
                email: trainerEmail,
                firstName: trainerName.split(' ')[0] || 'Trainer',
                lastName: trainerName.split(' ').slice(1).join(' ') || ''
            };
        }
    },

    /**
     * Update profile display in the sidebar
     */
    updateProfileDisplay() {
        if (!this.trainerData) return;

        // Update avatar with first letter of name
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.textContent = this.trainerData.firstName?.[0]?.toUpperCase() || 'T';
        }

        // Update name and email
        const nameEl = document.getElementById('profileName');
        const emailEl = document.getElementById('profileEmail');
        if (nameEl) nameEl.textContent = this.trainerData.name || 'Trainer';
        if (emailEl) emailEl.textContent = this.trainerData.email || '';

        // Update stats
        this.updateStats();
    },

    /**
     * Update statistics in profile section
     */
    updateStats() {
        const totalClasses = this.classes.length;
        const totalBookings = this.bookings.length;

        const classesEl = document.getElementById('totalClasses');
        const bookingsEl = document.getElementById('totalBookings');
        
        if (classesEl) classesEl.textContent = totalClasses;
        if (bookingsEl) bookingsEl.textContent = totalBookings;
    },

    // ============================================================================
    // CLASS LOADING
    // ============================================================================
    /**
     * Load all classes for the current trainer
     * TODO: Replace this with actual API call to your backend
     * 
     * Example API call:
     * async loadClasses() {
     *     try {
     *         const response = await fetch(`https://api.yourdomain.com/api/classes?trainerId=${this.trainerId}`, {
     *             method: 'GET',
     *             headers: {
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             }
     *         });
     * 
     *         if (!response.ok) {
     *             throw new Error('Failed to load classes');
     *         }
     * 
     *         const data = await response.json();
     *         this.classes = data;
     *         this.applyFiltersAndSort();
     *         this.renderClasses();
     *     } catch (error) {
     *         console.error('Error loading classes:', error);
     *         this.showError('Failed to load classes. Please refresh the page.');
     *     }
     * }
     * 
     * Example MySQL Query:
     * SELECT ClassID, Title, Description, StartDateTime, EndDateTime, Location, Capacity, Status
     * FROM Classes
     * WHERE TrainerID = ?
     * ORDER BY StartDateTime DESC
     */
    async loadClasses() {
        try {
            // Call the API endpoint
            const response = await fetch(`http://localhost:3000/api/classes?trainerId=${this.trainerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load classes');
            }

            const data = await response.json();
            // Transform API response to match UI expectations
            this.classes = (data || []).map(classItem => {
                // Support both old and new field names
                const scheduleDate = new Date(
                    classItem.StartDateTime || 
                    classItem.ScheduleDate || 
                    classItem.startDateTime || 
                    classItem.scheduleDate
                );
                return {
                    id: classItem.ClassID || classItem.classId,
                    name: classItem.Title || classItem.ClassName || classItem.title || classItem.className,
                    description: classItem.Description || classItem.description || '',
                    date: scheduleDate.toISOString().split('T')[0],
                    time: scheduleDate.toTimeString().slice(0, 5), // HH:MM format
                    location: 'Training Facility', // Default since not in DB
                    capacity: classItem.Capacity || classItem.capacity || 0,
                    price: classItem.Price || classItem.price || 0,
                    type: classItem.Type || classItem.type || 'Group',
                    bookedCount: classItem.BookedCount || classItem.bookedCount || 0
                };
            });

            // Apply filters and sorting
            this.applyFiltersAndSort();
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showError('Failed to load classes. Please refresh the page.');
        }
    },

    // ============================================================================
    // BOOKINGS LOADING
    // ============================================================================
    /**
     * Load all bookings for trainer's classes
     * TODO: Replace this with actual API call to your backend
     * 
     * Example API call:
     * async loadBookings() {
     *     try {
     *         const response = await fetch(`https://api.yourdomain.com/api/bookings?trainerId=${this.trainerId}`, {
     *             method: 'GET',
     *             headers: {
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             }
     *         });
     * 
     *         if (!response.ok) {
     *             throw new Error('Failed to load bookings');
     *         }
     * 
     *         const data = await response.json();
     *         this.bookings = data;
     *         this.updateStats();
     *     } catch (error) {
     *         console.error('Error loading bookings:', error);
     *     }
     * }
     * 
     * Example MySQL Query:
     * SELECT b.BookingID, b.CustomerID, b.PetID, b.Status, b.BookingDateTime,
     *        c.FirstName, c.LastName, p.Name AS PetName, cl.ClassID, cl.Title AS ClassName
     * FROM Bookings b
     * JOIN Classes cl ON b.ClassID = cl.ClassID
     * JOIN Customers c ON b.CustomerID = c.CustomerID
     * JOIN Pets p ON b.PetID = p.PetID
     * WHERE cl.TrainerID = ?
     * ORDER BY b.BookingDateTime DESC
     */
    async loadBookings() {
        try {
            // Call the API endpoint
            const response = await fetch(`http://localhost:3000/api/bookings?trainerId=${this.trainerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load bookings');
            }

            const data = await response.json();
            this.bookings = data || [];

            this.updateStats();
            // Automatically render all bookings after loading
            this.renderAllBookings();
        } catch (error) {
            console.error('Error loading bookings:', error);
            // Still try to render (will show empty state)
            this.renderAllBookings();
        }
    },

    /**
     * Load bookings for a specific class
     * @param {number} classId - ID of the class
     */
    async loadClassBookings(classId) {
        this.viewingBookingsForClassId = classId;
        
        // Filter bookings for this class - handle both API field names (ClassID) and frontend names (classId)
        const classBookings = this.bookings.filter(b => {
            const bookingClassId = b.ClassID || b.classId;
            return bookingClassId == classId; // Use == for type coercion
        });
        
        // Render filtered bookings (for specific class view)
        this.renderBookings(classBookings);
    },

    // ============================================================================
    // SEARCH, FILTER, AND SORT
    // ============================================================================
    /**
     * Handle search input
     */
    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        this.searchTerm = searchInput.value.toLowerCase().trim();
        this.applyFiltersAndSort();
        this.renderClasses();
    },

    /**
     * Handle filter change
     */
    handleFilter() {
        const filterSelect = document.getElementById('dateFilter');
        this.currentFilter = filterSelect.value;
        this.applyFiltersAndSort();
        this.renderClasses();
    },

    /**
     * Handle sort change
     */
    handleSort() {
        const sortSelect = document.getElementById('sortSelect');
        this.currentSort = sortSelect.value;
        this.applyFiltersAndSort();
        this.renderClasses();
    },

    /**
     * Apply search, filter, and sort to classes
     */
    applyFiltersAndSort() {
        let filtered = [...this.classes];

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(classItem => {
                const name = (classItem.name || '').toLowerCase();
                const description = (classItem.description || '').toLowerCase();
                return name.includes(this.searchTerm) || description.includes(this.searchTerm);
            });
        }

        // Apply date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        filtered = filtered.filter(classItem => {
            const classDate = new Date(`${classItem.date}T${classItem.time}`);
            
            switch (this.currentFilter) {
                case 'today':
                    return classDate.toDateString() === today.toDateString();
                case 'week':
                    return classDate >= today && classDate <= weekFromNow;
                case 'month':
                    return classDate >= today && classDate <= monthFromNow;
                case 'upcoming':
                    return classDate >= today;
                case 'past':
                    return classDate < today;
                default:
                    return true;
            }
        });

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateB - dateA;
                case 'oldest':
                    const dateA2 = new Date(`${a.date}T${a.time}`);
                    const dateB2 = new Date(`${b.date}T${b.time}`);
                    return dateA2 - dateB2;
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'date-asc':
                    const dateA3 = new Date(`${a.date}T${a.time}`);
                    const dateB3 = new Date(`${b.date}T${b.time}`);
                    return dateA3 - dateB3;
                case 'date-desc':
                    const dateA4 = new Date(`${a.date}T${a.time}`);
                    const dateB4 = new Date(`${b.date}T${b.time}`);
                    return dateB4 - dateA4;
                default:
                    return 0;
            }
        });

        this.displayedClasses = filtered;
    },

    // ============================================================================
    // CLASS RENDERING
    // ============================================================================
    /**
     * Render all classes in the table
     */
    renderClasses() {
        const container = document.getElementById('classesContainer');

        if (this.displayedClasses.length === 0) {
            const emptyMessage = this.classes.length === 0
                ? 'No classes yet. Create your first class to get started!'
                : 'No classes match your search or filter criteria.';
            
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">${emptyMessage}</div>
                </div>
            `;
            return;
        }

        // Build table HTML
        let tableHTML = `
            <table class="classes-table">
                <thead>
                    <tr>
                        <th class="sortable" onclick="trainerPortal.sortByColumn('name')">Class Name</th>
                        <th>Description</th>
                        <th class="sortable" onclick="trainerPortal.sortByColumn('date')">Date & Time</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.displayedClasses.forEach((classItem) => {
            const classDate = new Date(`${classItem.date}T${classItem.time}`);
            const formattedDate = classDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const formattedTime = classDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });

            // Calculate booked count (use bookedCount from API or calculate from bookings)
            const bookedCount = classItem.bookedCount !== undefined 
                ? classItem.bookedCount 
                : this.bookings.filter(b => b.classId === classItem.id).length;
            const isFull = bookedCount >= classItem.capacity;
            const statusBadge = isFull 
                ? '<span class="badge badge-full">Full</span>'
                : `<span class="badge badge-available">${classItem.capacity - bookedCount} Available</span>`;

            tableHTML += `
                <tr>
                    <td class="class-name">${this.escapeHtml(classItem.name)}</td>
                    <td class="class-description" title="${this.escapeHtml(classItem.description || '')}">
                        ${this.escapeHtml(classItem.description || 'No description')}
                    </td>
                    <td>
                        <div>${formattedDate}</div>
                        <div style="font-size: 12px; color: #64748b;">${formattedTime}</div>
                    </td>
                    <td>${this.escapeHtml(classItem.location)}</td>
                    <td>${bookedCount} / ${classItem.capacity}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-view-bookings" onclick="trainerPortal.loadClassBookings(${classItem.id})">
                                Bookings
                            </button>
                            <button class="btn-edit" onclick="trainerPortal.editClass(${classItem.id})">
                                Edit
                            </button>
                            <button class="btn-delete" onclick="trainerPortal.deleteClass(${classItem.id})">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    },

    /**
     * Sort by column header click
     * @param {string} column - Column to sort by
     */
    sortByColumn(column) {
        const sortMap = {
            'name': this.currentSort === 'name-asc' ? 'name-desc' : 'name-asc',
            'date': this.currentSort === 'date-asc' ? 'date-desc' : 'date-asc'
        };

        if (sortMap[column]) {
            this.currentSort = sortMap[column];
            document.getElementById('sortSelect').value = this.currentSort;
            this.applyFiltersAndSort();
            this.renderClasses();
        }
    },

    // ============================================================================
    // BOOKINGS RENDERING
    // ============================================================================
    /**
     * Render bookings for a specific class
     * @param {Array} classBookings - Array of booking objects
     */
    renderBookings(classBookings) {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.classList.add('show');

        if (classBookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No bookings for this class yet</div>
                </div>
            `;
            return;
        }

        // Get class name
        const classItem = this.classes.find(c => c.id === this.viewingBookingsForClassId);
        const className = classItem ? classItem.name : 'Unknown Class';

        let bookingsHTML = `
            <div style="margin-bottom: 16px;">
                <strong>Bookings for: ${this.escapeHtml(className)}</strong>
                <button class="btn-secondary" onclick="trainerPortal.hideBookings()" style="margin-left: 12px; padding: 6px 12px; font-size: 12px;">Close</button>
            </div>
            <table class="bookings-table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Pet Name</th>
                        <th>Booking Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        classBookings.forEach(booking => {
            // Handle both API field names (BookingDate, Status) and frontend names (bookingDateTime, status)
            const bookingDate = booking.BookingDate || booking.bookingDateTime || booking.createdAt;
            const bookingDateObj = bookingDate ? new Date(bookingDate) : new Date();
            const formattedDate = bookingDateObj.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            const status = booking.Status || booking.status || 'Scheduled';
            const statusBadge = status === 'Scheduled' || status === 'Booked'
                ? '<span class="badge badge-available">' + status + '</span>'
                : status === 'Cancelled'
                ? '<span class="badge badge-full">Cancelled</span>'
                : '<span class="badge">' + status + '</span>';

            // Handle both API field names (CustomerName, PetName) and frontend names (customerName, petName)
            const customerName = booking.CustomerName || booking.customerName || 'Unknown';
            const petName = booking.PetName || booking.petName || 'Unknown';
            
            const bookingId = booking.BookingID || booking.bookingId;
            bookingsHTML += `
                <tr>
                    <td>${this.escapeHtml(customerName)}</td>
                    <td>${this.escapeHtml(petName)}</td>
                    <td>${formattedDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${status === 'Scheduled' || status === 'Booked' ? 
                            `<button onclick="trainerPortal.removeCustomerFromClass(${bookingId})" class="btn-danger" style="padding: 4px 8px; font-size: 12px;">Remove</button>` 
                            : ''}
                    </td>
                </tr>
            `;
        });

        bookingsHTML += `
                </tbody>
            </table>
        `;

        bookingsList.innerHTML = bookingsHTML;
    },

    /**
     * Render all bookings (not filtered by class)
     */
    renderAllBookings() {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;
        
        bookingsList.classList.add('show');

        if (this.bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No bookings yet</div>
                </div>
            `;
            return;
        }

        // Sort bookings by date (most recent first)
        const sortedBookings = [...this.bookings].sort((a, b) => {
            const dateA = new Date(a.BookingDate || a.bookingDateTime || 0);
            const dateB = new Date(b.BookingDate || b.bookingDateTime || 0);
            return dateB - dateA;
        });

        let bookingsHTML = `
            <table class="bookings-table">
                <thead>
                    <tr>
                        <th>Class Name</th>
                        <th>Customer Name</th>
                        <th>Pet Name</th>
                        <th>Booking Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sortedBookings.forEach(booking => {
            // Handle both API field names (BookingDate, Status) and frontend names (bookingDateTime, status)
            const bookingDate = booking.BookingDate || booking.bookingDateTime || booking.createdAt;
            const bookingDateObj = bookingDate ? new Date(bookingDate) : new Date();
            const formattedDate = bookingDateObj.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            const status = booking.Status || booking.status || 'Scheduled';
            const statusBadge = status === 'Scheduled' || status === 'Booked'
                ? '<span class="badge badge-available">' + status + '</span>'
                : status === 'Cancelled'
                ? '<span class="badge badge-full">Cancelled</span>'
                : '<span class="badge">' + status + '</span>';

            // Handle both API field names (CustomerName, PetName, ClassTitle) and frontend names
            const customerName = booking.CustomerName || booking.customerName || 'Unknown';
            const petName = booking.PetName || booking.petName || 'Unknown';
            const className = booking.Title || booking.ClassTitle || booking.ClassName || booking.className || 'Unknown Class';
            const bookingId = booking.BookingID || booking.bookingId;
            
            bookingsHTML += `
                <tr>
                    <td>${this.escapeHtml(className)}</td>
                    <td>${this.escapeHtml(customerName)}</td>
                    <td>${this.escapeHtml(petName)}</td>
                    <td>${formattedDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${status === 'Scheduled' || status === 'Booked' ? 
                            `<button onclick="trainerPortal.removeCustomerFromClass(${bookingId})" class="btn-danger" style="padding: 4px 8px; font-size: 12px;">Remove</button>` 
                            : ''}
                    </td>
                </tr>
            `;
        });

        bookingsHTML += `
                </tbody>
            </table>
        `;

        bookingsList.innerHTML = bookingsHTML;
    },

    /**
     * Hide bookings section
     */
    hideBookings() {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.classList.remove('show');
        this.viewingBookingsForClassId = null;
        // Re-render all bookings when hiding specific class bookings
        this.renderAllBookings();
    },

    // ============================================================================
    // MODAL MANAGEMENT
    // ============================================================================
    /**
     * Open modal for creating a new class
     */
    openCreateModal() {
        console.log('openCreateModal called');
        // Check if trainer is logged in
        if (!this.trainerId) {
            console.error('No trainerId - redirecting to login');
            alert('You must be logged in as a trainer to create a class.');
            window.location.href = 'login.html';
            return;
        }
        
        const modal = document.getElementById('classModal');
        if (!modal) {
            console.error('Modal element not found!');
            alert('Error: Modal element not found. Please refresh the page.');
            return;
        }
        
        this.editingClassId = null;
        const modalTitle = document.getElementById('modalTitle');
        const submitButton = document.getElementById('submitButton');
        const classForm = document.getElementById('classForm');
        const classDate = document.getElementById('classDate');
        
        if (modalTitle) modalTitle.textContent = 'Create New Class';
        if (submitButton) submitButton.textContent = 'Create Class';
        if (classForm) classForm.reset();
        this.clearAllErrors();
        
        // Clear any global error/success display
        const errorDisplay = document.getElementById('globalErrorDisplay');
        if (errorDisplay) {
            errorDisplay.style.display = 'none';
            errorDisplay.textContent = '';
        }
        const successDisplay = document.getElementById('globalSuccessDisplay');
        if (successDisplay) {
            successDisplay.style.display = 'none';
            successDisplay.textContent = '';
        }
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        if (classDate) {
            classDate.value = '';
            classDate.setAttribute('min', today);
        }
        
        modal.classList.add('show');
        console.log('Modal opened, classList:', modal.classList.toString());
        
        // Force visibility check
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(modal);
            const modalContent = modal.querySelector('.modal');
            const contentStyle = modalContent ? window.getComputedStyle(modalContent) : null;
            console.log('Modal overlay display:', computedStyle.display);
            console.log('Modal overlay visibility:', computedStyle.visibility);
            console.log('Modal overlay opacity:', computedStyle.opacity);
            if (contentStyle) {
                console.log('Modal content display:', contentStyle.display);
                console.log('Modal content visibility:', contentStyle.visibility);
                console.log('Modal content opacity:', contentStyle.opacity);
                console.log('Modal content background:', contentStyle.backgroundColor);
            } else {
                console.error('Modal content element not found!');
            }
        }, 100);
    },

    /**
     * Open modal for editing an existing class
     * @param {number} classId - ID of the class to edit
     */
    editClass(classId) {
        const classItem = this.classes.find(c => c.id === classId);
        
        if (!classItem) {
            this.showError('Class not found');
            return;
        }

        this.editingClassId = classId;
        document.getElementById('modalTitle').textContent = 'Edit Class';
        document.getElementById('submitButton').textContent = 'Update Class';

        // Populate form with class data
        document.getElementById('className').value = classItem.name;
        document.getElementById('classDescription').value = classItem.description || '';
        document.getElementById('classDate').value = classItem.date;
        document.getElementById('classTime').value = classItem.time;
        document.getElementById('classLocation').value = classItem.location || '';
        document.getElementById('classCapacity').value = classItem.capacity;
        document.getElementById('classPrice').value = classItem.price || 0;
        document.getElementById('classType').value = classItem.type || 'Group';

        this.clearAllErrors();
        document.getElementById('classModal').classList.add('show');
    },

    /**
     * Close the modal
     */
    closeModal() {
        document.getElementById('classModal').classList.remove('show');
        this.editingClassId = null;
        document.getElementById('classForm').reset();
        this.clearAllErrors();
    },

    // ============================================================================
    // FORM VALIDATION
    // ============================================================================
    /**
     * Validate the class form
     * @returns {boolean} - True if form is valid
     */
    validateForm() {
        let isValid = true;
        this.clearAllErrors();

        const className = document.getElementById('className').value.trim();
        const classDate = document.getElementById('classDate').value;
        const classTime = document.getElementById('classTime').value;
        const classLocation = document.getElementById('classLocation').value.trim();
        const classCapacity = parseInt(document.getElementById('classCapacity').value);

        // Validate class name
        if (!className) {
            this.showFieldError('classNameError', 'Class name is required');
            document.getElementById('className').classList.add('error');
            isValid = false;
        } else if (className.length < 3) {
            this.showFieldError('classNameError', 'Class name must be at least 3 characters');
            document.getElementById('className').classList.add('error');
            isValid = false;
        }

        // Validate date
        if (!classDate) {
            this.showFieldError('classDateError', 'Date is required');
            document.getElementById('classDate').classList.add('error');
            isValid = false;
        } else {
            const selectedDate = new Date(classDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.showFieldError('classDateError', 'Date cannot be in the past');
                document.getElementById('classDate').classList.add('error');
                isValid = false;
            }
        }

        // Validate time
        if (!classTime) {
            this.showFieldError('classTimeError', 'Time is required');
            document.getElementById('classTime').classList.add('error');
            isValid = false;
        }

        // Validate location
        if (!classLocation) {
            this.showFieldError('classLocationError', 'Location is required');
            document.getElementById('classLocation').classList.add('error');
            isValid = false;
        }

        // Validate capacity
        if (!classCapacity || classCapacity < 1) {
            this.showFieldError('classCapacityError', 'Capacity must be at least 1');
            document.getElementById('classCapacity').classList.add('error');
            isValid = false;
        } else if (classCapacity > 100) {
            this.showFieldError('classCapacityError', 'Capacity cannot exceed 100');
            document.getElementById('classCapacity').classList.add('error');
            isValid = false;
        }

        // Validate price
        const classPrice = parseFloat(document.getElementById('classPrice').value);
        if (!classPrice || classPrice < 0) {
            this.showFieldError('classPriceError', 'Price must be at least 0');
            document.getElementById('classPrice').classList.add('error');
            isValid = false;
        }

        return isValid;
    },

    /**
     * Show error message for a specific field
     * @param {string} errorId - ID of the error element
     * @param {string} message - Error message to display
     */
    showFieldError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            console.log(`Field error [${errorId}]:`, message);
        } else {
            console.warn(`Error element not found: ${errorId}`);
        }
    },

    /**
     * Clear all error messages
     */
    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });

        const inputElements = document.querySelectorAll('.form-input, .form-textarea, .form-select');
        inputElements.forEach(el => el.classList.remove('error'));
    },

    // ============================================================================
    // FORM SUBMISSION
    // ============================================================================
    /**
     * Handle form submission (create or update class)
     * @param {Event} event - Form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Form submit handler called');

        // Clear previous messages
        const errorDisplay = document.getElementById('globalErrorDisplay');
        const successDisplay = document.getElementById('globalSuccessDisplay');
        if (errorDisplay) errorDisplay.style.display = 'none';
        if (successDisplay) successDisplay.style.display = 'none';

        // Check if trainer is logged in
        if (!this.trainerId) {
            console.error('No trainerId found');
            this.showError('You must be logged in as a trainer to create a class.');
            return;
        }

        console.log('Validating form...');
        // Validate form
        if (!this.validateForm()) {
            console.error('Form validation failed');
            // Show a general error message if validation fails
            this.showError('Please fill in all required fields correctly.');
            return;
        }
        
        console.log('Form validation passed');

        // Get form data
        const formData = {
            name: document.getElementById('className').value.trim(),
            description: document.getElementById('classDescription').value.trim(),
            date: document.getElementById('classDate').value,
            time: document.getElementById('classTime').value,
            location: document.getElementById('classLocation').value.trim(),
            capacity: parseInt(document.getElementById('classCapacity').value),
            price: parseFloat(document.getElementById('classPrice').value) || 0,
            type: document.getElementById('classType').value || 'Group',
            trainerId: this.trainerId
        };

        // Disable submit button
        const submitButton = document.getElementById('submitButton');
        submitButton.disabled = true;
        submitButton.textContent = this.editingClassId ? 'Updating...' : 'Creating...';

        try {
            console.log('Submitting form data:', formData);
            if (this.editingClassId) {
                // Update existing class
                console.log('Updating class:', this.editingClassId);
                await this.updateClass(this.editingClassId, formData);
            } else {
                // Create new class
                console.log('Creating new class');
                await this.createClass(formData);
            }

            console.log('Class saved successfully');
            // Show success message
            this.showSuccess('Class created successfully!');
            // Close modal and refresh after a short delay
            setTimeout(async () => {
                this.closeModal();
                await this.loadClasses();
                await this.loadBookings();
                this.renderClasses();
                this.updateStats();
            }, 1000);
        } catch (error) {
            console.error('Error saving class:', error);
            this.showError(error.message || 'Failed to save class. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = this.editingClassId ? 'Update Class' : 'Create Class';
        }
    },

    // ============================================================================
    // CLASS CRUD OPERATIONS
    // ============================================================================
    /**
     * Create a new class
     * TODO: Replace this with actual API call to your backend
     * 
     * @param {Object} classData - Class data to create
     * 
     * Example API call:
     * async createClass(classData) {
     *     try {
     *         const response = await fetch('https://api.yourdomain.com/api/classes', {
     *             method: 'POST',
     *             headers: {
     *                 'Content-Type': 'application/json',
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             },
     *             body: JSON.stringify(classData)
     *         });
     * 
     *         if (!response.ok) {
     *             const errorData = await response.json();
     *             throw new Error(errorData.message || 'Failed to create class');
     *         }
     * 
     *         const newClass = await response.json();
     *         return newClass;
     *     } catch (error) {
     *         console.error('Error creating class:', error);
     *         throw error;
     *     }
     * }
     * 
     * Example MySQL INSERT query:
     * INSERT INTO Classes (TrainerID, Title, Description, StartDateTime, EndDateTime, Location, Capacity, Status)
     * VALUES (?, ?, ?, CONCAT(?, ' ', ?), DATE_ADD(CONCAT(?, ' ', ?), INTERVAL 60 MINUTE), ?, ?, 'Scheduled')
     */
    async createClass(classData) {
        try {
            console.log('createClass called with:', classData);
            // Combine date and time into startDateTime
            const startDateTime = `${classData.date}T${classData.time}:00`;
            console.log('Combined startDateTime:', startDateTime);
            
            const requestBody = {
                trainerId: parseInt(this.trainerId),
                title: classData.name, // Map name to title
                description: classData.description || '',
                type: classData.type || 'Group',
                startDateTime: startDateTime,
                capacity: parseInt(classData.capacity),
                price: parseFloat(classData.price) || 0
            };
            console.log('API request body:', requestBody);
            
            // Call the API endpoint
            const response = await fetch('http://localhost:3000/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('API response status:', response.status);
            const responseData = await response.json();
            console.log('API response data:', responseData);
            
            if (!response.ok) {
                console.error('API error:', responseData);
                throw new Error(responseData.message || 'Failed to create class');
            }

            console.log('Class created successfully:', responseData);
            // Reload classes to get the full data from the database
            await this.loadClasses();

            return responseData;
        } catch (error) {
            console.error('Error creating class:', error);
            // Provide more specific error message
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to server. Make sure the server is running on http://localhost:3000');
            }
            throw error;
        }
    },

    /**
     * Update an existing class
     * TODO: Replace this with actual API call to your backend
     * 
     * @param {number} classId - ID of the class to update
     * @param {Object} classData - Updated class data
     * 
     * Example API call:
     * async updateClass(classId, classData) {
     *     try {
     *         const response = await fetch(`https://api.yourdomain.com/api/classes/${classId}`, {
     *             method: 'PUT',
     *             headers: {
     *                 'Content-Type': 'application/json',
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             },
     *             body: JSON.stringify(classData)
     *         });
     * 
     *         if (!response.ok) {
     *             const errorData = await response.json();
     *             throw new Error(errorData.message || 'Failed to update class');
     *         }
     * 
     *         const updatedClass = await response.json();
     *         return updatedClass;
     *     } catch (error) {
     *         console.error('Error updating class:', error);
     *         throw error;
     *     }
     * }
     * 
     * Example MySQL UPDATE query:
     * UPDATE Classes 
     * SET Title = ?, Description = ?, StartDateTime = CONCAT(?, ' ', ?), 
     *     EndDateTime = DATE_ADD(CONCAT(?, ' ', ?), INTERVAL 60 MINUTE),
     *     Location = ?, Capacity = ?
     * WHERE ClassID = ? AND TrainerID = ?
     */
    async updateClass(classId, classData) {
        try {
            // Combine date and time into startDateTime
            const startDateTime = `${classData.date}T${classData.time}:00`;
            
            // Map form data to API format
            const updateData = {
                title: classData.name, // Map name to title
                description: classData.description || '',
                type: classData.type || 'Group',
                startDateTime: startDateTime,
                capacity: classData.capacity,
                price: classData.price || 0
            };

            // Call the API endpoint
            const response = await fetch(`http://localhost:3000/api/classes/${classId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                console.error('API error:', responseData);
                throw new Error(responseData.message || 'Failed to update class');
            }

            console.log('Class updated successfully:', responseData);
            // Reload classes to get updated data
            await this.loadClasses();

            return responseData;
        } catch (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    },

    /**
     * Delete a class
     * TODO: Replace this with actual API call to your backend
     * 
     * @param {number} classId - ID of the class to delete
     * 
     * Example API call:
     * async deleteClass(classId) {
     *     if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
     *         return;
     *     }
     * 
     *     try {
     *         const response = await fetch(`https://api.yourdomain.com/api/classes/${classId}`, {
     *             method: 'DELETE',
     *             headers: {
     *                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     *             }
     *         });
     * 
     *         if (!response.ok) {
     *             const errorData = await response.json();
     *             throw new Error(errorData.message || 'Failed to delete class');
     *         }
     * 
     *         // Remove from local array
     *         this.classes = this.classes.filter(c => c.id !== classId);
     *         this.applyFiltersAndSort();
     *         this.renderClasses();
     *     } catch (error) {
     *         console.error('Error deleting class:', error);
     *         this.showError(error.message || 'Failed to delete class');
     *     }
     * }
     * 
     * Example MySQL DELETE query:
     * DELETE FROM Classes WHERE ClassID = ? AND TrainerID = ?
     */
    async deleteClass(classId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/classes/${classId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            console.log('Delete response:', responseData);

            if (!response.ok) {
                throw new Error('Failed to delete class');
            }

            // Reload classes to reflect the deletion
            await this.loadClasses();
            localStorage.setItem(`trainer_${this.trainerId}_bookings`, JSON.stringify(this.bookings));

            // Refresh the display
            this.applyFiltersAndSort();
            this.renderClasses();
            this.updateStats();
            this.hideBookings();
        } catch (error) {
            console.error('Error deleting class:', error);
            this.showError(error.message || 'Failed to delete class');
        }
    },

    /**
     * Remove a customer from a class (cancel their booking)
     * @param {number} bookingId - ID of the booking to cancel
     */
    async removeCustomerFromClass(bookingId) {
        if (!confirm('Are you sure you want to remove this customer from the class?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/bookings?bookingId=${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            console.log('Remove customer response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to remove customer from class');
            }

            // Show success message
            this.showSuccess('Customer removed from class successfully');
            
            // Reload bookings to update the display
            await this.loadBookings();
            
            // If viewing specific class bookings, reload those
            if (this.viewingBookingsForClassId) {
                await this.loadClassBookings(this.viewingBookingsForClassId);
            }
        } catch (error) {
            console.error('Error removing customer from class:', error);
            this.showError(error.message || 'Failed to remove customer from class');
        }
    },

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('showError called:', message);
        // Try to show error in a visible place in the modal
        const modal = document.getElementById('classModal');
        if (modal && modal.classList.contains('show')) {
            // Create or update error display in modal
            let errorDisplay = document.getElementById('globalErrorDisplay');
            if (!errorDisplay) {
                errorDisplay = document.createElement('div');
                errorDisplay.id = 'globalErrorDisplay';
                errorDisplay.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 20px; display: block;';
                const form = document.getElementById('classForm');
                if (form) {
                    form.insertBefore(errorDisplay, form.firstChild);
                }
            }
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            // Scroll to error
            errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Modal not open, show alert
            alert(message);
        }
    },

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        console.log('showSuccess called:', message);
        const modal = document.getElementById('classModal');
        if (modal && modal.classList.contains('show')) {
            // Create or update success display in modal
            let successDisplay = document.getElementById('globalSuccessDisplay');
            if (!successDisplay) {
                successDisplay = document.createElement('div');
                successDisplay.id = 'globalSuccessDisplay';
                successDisplay.style.cssText = 'background: #efe; border: 1px solid #cfc; color: #3c3; padding: 12px; border-radius: 8px; margin-bottom: 20px; display: block;';
                const form = document.getElementById('classForm');
                if (form) {
                    form.insertBefore(successDisplay, form.firstChild);
                }
            }
            successDisplay.textContent = message;
            successDisplay.style.display = 'block';
        }
    },

    /**
     * Logout and redirect to login page
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('trainerId');
            localStorage.removeItem('hpt_trainer_id');
            localStorage.removeItem('trainerEmail');
            localStorage.removeItem('trainerName');
            window.location.href = 'login.html';
        }
    }
};

// ============================================================================
// INITIALIZE PORTAL WHEN PAGE LOADS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    trainerPortal.init();
});

// Close modal when clicking outside (but not on the modal content itself)
document.addEventListener('click', (e) => {
    const modal = document.getElementById('classModal');
    const modalContent = modal ? modal.querySelector('.modal') : null;
    // Only close if clicking directly on the overlay, not on the modal content
    if (modal && e.target === modal && !modalContent?.contains(e.target)) {
        trainerPortal.closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        trainerPortal.closeModal();
    }
});
