// ============================================================================
// CUSTOMER PORTAL - Booking Functionality
// ============================================================================
const customerPortal = {
    customerId: null,
    searchTerm: '',
    currentFilter: 'all',
    currentSort: 'date-asc',
    displayedBookings: [],
    pets: [],
    availableClasses: [],
    bookings: [],

    // Initialize
    async init() {
        // Get customer ID from localStorage
        this.customerId = localStorage.getItem('hpt_customer_id') || localStorage.getItem('customerId');
        
        if (!this.customerId) {
            console.warn('No customer ID found in localStorage');
            // Don't redirect, just show message
            const nameEl = document.getElementById('customerName');
            if (nameEl) {
                nameEl.textContent = 'Guest';
            }
            return;
        }

        // Load customer data, pets, classes, and bookings
        await this.loadCustomerData();
        await this.loadPets();
        await this.loadClasses();
        await this.loadBookings();
        
        // Initialize filters
        this.applyFiltersAndSort();
    },

    // Load customer data
    async loadCustomerData() {
        try {
            const response = await fetch(`http://localhost:3000/api/customer?customerId=${this.customerId}`);
            if (response.ok) {
                const customer = await response.json();
                const nameEl = document.getElementById('customerName');
                if (nameEl && customer) {
                    const firstName = customer.FName || customer.firstName || '';
                    const lastName = customer.LName || customer.lastName || '';
                    nameEl.textContent = `${firstName} ${lastName}`.trim() || 'Customer';
                }
            }
        } catch (error) {
            console.error('Error loading customer data:', error);
            // Don't fail if customer data can't be loaded
        }
    },

    // Load customer's pets
    async loadPets() {
        try {
            const response = await fetch(`http://localhost:3000/api/pets?customerId=${this.customerId}`);
            if (response.ok) {
                const data = await response.json();
                this.pets = data || [];
                this.renderPets();
                this.updatePetCount();
            } else {
                this.pets = [];
                this.renderPets();
                this.updatePetCount();
            }
        } catch (error) {
            console.error('Error loading pets:', error);
            this.pets = [];
            this.renderPets();
            this.updatePetCount();
        }
    },

    // Render pets in the UI
    renderPets() {
        const petsListEl = document.getElementById('petsList');
        if (!petsListEl) return;

        if (this.pets.length === 0) {
            petsListEl.innerHTML = `
                <div class="text-xs text-slate-500 text-center py-4">
                    No pets added yet. Click "Add a pet" to get started.
                </div>
            `;
            return;
        }

        // Get emoji for species
        const getSpeciesEmoji = (species) => {
            if (!species) return '🐾';
            const s = species.toLowerCase();
            if (s.includes('dog')) return '🐕';
            if (s.includes('cat')) return '🐱';
            if (s.includes('bird')) return '🐦';
            if (s.includes('rabbit')) return '🐰';
            return '🐾';
        };

        // Get color for avatar based on species
        const getAvatarColor = (species, index) => {
            if (!species) return 'bg-slate-100';
            const s = species.toLowerCase();
            const colors = ['bg-sky-100', 'bg-amber-100', 'bg-emerald-100', 'bg-purple-100', 'bg-rose-100'];
            if (s.includes('dog')) return colors[0];
            if (s.includes('cat')) return colors[1];
            return colors[index % colors.length];
        };

        petsListEl.innerHTML = this.pets.map((pet, index) => {
            const emoji = getSpeciesEmoji(pet.Species);
            const avatarColor = getAvatarColor(pet.Species, index);
            const breedText = pet.Breed ? ` • ${pet.Breed}` : '';
            
            return `
                <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                    <div class="h-12 w-12 rounded-full ${avatarColor} flex items-center justify-center text-2xl">
                        ${emoji}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-slate-900">${this.escapeHtml(pet.Name || 'Unnamed')}</div>
                        <div class="text-xs text-slate-500">${this.escapeHtml(pet.Species || 'Unknown')}${breedText ? ' • ' + this.escapeHtml(pet.Breed) : ''}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="customerPortal.openEditPetModal(${pet.PetID})" class="text-xs text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded hover:bg-sky-50">
                            Edit
                        </button>
                        <button onclick="customerPortal.deletePet(${pet.PetID})" class="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Update pet count in stats
    updatePetCount() {
        const petCountEl = document.getElementById('petsCount');
        if (petCountEl) {
            petCountEl.textContent = this.pets.length;
        }
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Open calendar modal
    openCalendarModal() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.classList.add('show');
            this.renderCalendar();
        }
    },

    // Close calendar modal
    closeCalendarModal() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Render calendar view
    renderCalendar() {
        const content = document.getElementById('calendarContent');
        if (!content) return;

        const now = new Date();
        const bookings = this.bookings || [];
        
        // Group bookings by month
        const bookingsByMonth = {};
        bookings.forEach(booking => {
            if (!booking.StartDateTime) return;
            const date = new Date(booking.StartDateTime);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!bookingsByMonth[monthKey]) {
                bookingsByMonth[monthKey] = [];
            }
            bookingsByMonth[monthKey].push(booking);
        });

        if (Object.keys(bookingsByMonth).length === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-4">📅</div>
                    <p class="text-slate-600 mb-2">No classes scheduled</p>
                    <p class="text-sm text-slate-500">Book a class to see it on your calendar!</p>
                </div>
            `;
            return;
        }

        // Sort months
        const sortedMonths = Object.keys(bookingsByMonth).sort();

        content.innerHTML = sortedMonths.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const monthDate = new Date(year, parseInt(month) - 1, 1);
            const monthName = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            const monthBookings = bookingsByMonth[monthKey].sort((a, b) => 
                new Date(a.StartDateTime) - new Date(b.StartDateTime)
            );

            return `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-slate-900 mb-3">${monthName}</h3>
                    <div class="space-y-2">
                        ${monthBookings.map(booking => {
                            const classDate = new Date(booking.StartDateTime);
                            const isPast = classDate < now;
                            const isToday = classDate.toDateString() === now.toDateString();
                            const dateStr = classDate.toLocaleDateString(undefined, { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                            });
                            const timeStr = classDate.toLocaleTimeString(undefined, { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                            });
                            
                            const statusColor = booking.Status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPast 
                                ? 'bg-slate-50 text-slate-600 border-slate-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200';
                            
                            return `
                                <div class="flex items-center gap-3 p-3 rounded-lg border ${statusColor} ${isToday ? 'ring-2 ring-sky-400' : ''}">
                                    <div class="flex-shrink-0">
                                        <div class="text-xs font-semibold">${dateStr}</div>
                                        <div class="text-xs opacity-75">${timeStr}</div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium">${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')}</div>
                                        <div class="text-xs opacity-75">${this.escapeHtml(booking.PetName || 'Pet')} · ${booking.Status || 'Scheduled'}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Open progress modal
    openProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.classList.add('show');
            this.renderProgress();
        }
    },

    // Close progress modal
    closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Render progress view
    renderProgress() {
        const content = document.getElementById('progressContent');
        if (!content) return;

        const bookings = this.bookings || [];
        const completed = bookings.filter(b => b.Status === 'Completed');
        const upcoming = bookings.filter(b => {
            if (!b.StartDateTime) return false;
            return new Date(b.StartDateTime) > new Date() && (b.Status === 'Scheduled' || b.Status === 'Booked');
        });
        const total = bookings.length;

        // Group by pet
        const progressByPet = {};
        bookings.forEach(booking => {
            const petName = booking.PetName || 'Unknown Pet';
            if (!progressByPet[petName]) {
                progressByPet[petName] = {
                    total: 0,
                    completed: 0,
                    upcoming: 0
                };
            }
            progressByPet[petName].total++;
            if (booking.Status === 'Completed') {
                progressByPet[petName].completed++;
            } else if (new Date(booking.StartDateTime) > new Date()) {
                progressByPet[petName].upcoming++;
            }
        });

        if (total === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-4">📊</div>
                    <p class="text-slate-600 mb-2">No training progress yet</p>
                    <p class="text-sm text-slate-500">Book classes to start tracking your progress!</p>
                </div>
            `;
            return;
        }

        const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Overall Stats -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-sky-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-sky-600">${total}</div>
                        <div class="text-xs text-slate-600 mt-1">Total Classes</div>
                    </div>
                    <div class="bg-emerald-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-emerald-600">${completed.length}</div>
                        <div class="text-xs text-slate-600 mt-1">Completed</div>
                    </div>
                    <div class="bg-amber-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-amber-600">${upcoming.length}</div>
                        <div class="text-xs text-slate-600 mt-1">Upcoming</div>
                    </div>
                </div>

                <!-- Completion Rate -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-slate-700">Completion Rate</span>
                        <span class="text-sm font-semibold text-slate-900">${completionRate}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-3">
                        <div class="bg-emerald-600 h-3 rounded-full transition-all" style="width: ${completionRate}%"></div>
                    </div>
                </div>

                <!-- Progress by Pet -->
                ${Object.keys(progressByPet).length > 0 ? `
                    <div>
                        <h3 class="text-sm font-semibold text-slate-700 mb-3">Progress by Pet</h3>
                        <div class="space-y-3">
                            ${Object.entries(progressByPet).map(([petName, stats]) => {
                                const petCompletionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                                return `
                                    <div class="border border-slate-200 rounded-lg p-4">
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="font-medium text-slate-900">${this.escapeHtml(petName)}</span>
                                            <span class="text-sm text-slate-600">${stats.completed}/${stats.total} completed</span>
                                        </div>
                                        <div class="w-full bg-slate-200 rounded-full h-2">
                                            <div class="bg-sky-600 h-2 rounded-full transition-all" style="width: ${petCompletionRate}%"></div>
                                        </div>
                                        <div class="flex gap-4 mt-2 text-xs text-slate-500">
                                            <span>✓ ${stats.completed} completed</span>
                                            <span>📅 ${stats.upcoming} upcoming</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Recent Completed Classes -->
                ${completed.length > 0 ? `
                    <div>
                        <h3 class="text-sm font-semibold text-slate-700 mb-3">Recent Completed Classes</h3>
                        <div class="space-y-2">
                            ${completed.slice(0, 5).map(booking => {
                                const classDate = new Date(booking.StartDateTime);
                                return `
                                    <div class="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                        <div class="text-emerald-600">✓</div>
                                        <div class="flex-1">
                                            <div class="text-sm font-medium text-slate-900">${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')}</div>
                                            <div class="text-xs text-slate-600">${this.escapeHtml(booking.PetName || 'Pet')} · ${classDate.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ============================================================================
    // SEARCH, FILTER, AND SORT
    // ============================================================================
    
    /**
     * Handle search input
     */
    handleSearch() {
        const searchInput = document.getElementById('customerSearchInput');
        this.searchTerm = searchInput.value.toLowerCase().trim();
        this.applyFiltersAndSort();
        this.renderUpcomingClasses();
    },

    /**
     * Handle filter change
     */
    handleFilter() {
        const filterSelect = document.getElementById('customerDateFilter');
        this.currentFilter = filterSelect.value;
        this.applyFiltersAndSort();
        this.renderUpcomingClasses();
    },

    /**
     * Handle sort change
     */
    handleSort() {
        const sortSelect = document.getElementById('customerSortSelect');
        this.currentSort = sortSelect.value;
        this.applyFiltersAndSort();
        this.renderUpcomingClasses();
    },

    /**
     * Apply search, filter, and sort to bookings
     */
    applyFiltersAndSort() {
        let filtered = [...this.bookings];

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(booking => {
                const className = (booking.Title || booking.ClassTitle || '').toLowerCase();
                const petName = (booking.PetName || '').toLowerCase();
                return className.includes(this.searchTerm) || petName.includes(this.searchTerm);
            });
        }

        // Apply date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        filtered = filtered.filter(booking => {
            if (!booking.StartDateTime) return false;
            const classDate = new Date(booking.StartDateTime);
            const classDateOnly = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate());
            
            switch (this.currentFilter) {
                case 'today':
                    return classDateOnly.toDateString() === today.toDateString();
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
            const dateA = a.StartDateTime ? new Date(a.StartDateTime) : new Date(0);
            const dateB = b.StartDateTime ? new Date(b.StartDateTime) : new Date(0);
            const nameA = (a.Title || a.ClassTitle || '').toLowerCase();
            const nameB = (b.Title || b.ClassTitle || '').toLowerCase();
            
            switch (this.currentSort) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                case 'date-asc':
                    return dateA - dateB;
                case 'date-desc':
                    return dateB - dateA;
                default:
                    return 0;
            }
        });

        this.displayedBookings = filtered;
    },

    // Render upcoming classes
    renderUpcomingClasses() {
        const upcomingListEl = document.getElementById('upcomingClassesList');
        const detailedListEl = document.getElementById('upcomingClassesDetailedList');
        
        // Use displayedBookings if filters are applied, otherwise use all bookings
        const bookingsToRender = this.displayedBookings.length > 0 || this.searchTerm || this.currentFilter !== 'all' 
            ? this.displayedBookings 
            : this.bookings;
        
        // Get upcoming bookings (future classes) for the small card - limit to 3
        const now = new Date();
        const upcomingBookings = this.bookings.filter(b => {
            if (!b.StartDateTime) return false;
            const classDate = new Date(b.StartDateTime);
            return classDate > now && (b.Status === 'Scheduled' || b.Status === 'Booked');
        }).slice(0, 3); // Show max 3

        // Render in the small card (upcomingClassesList)
        if (upcomingListEl) {
            if (upcomingBookings.length === 0) {
                upcomingListEl.innerHTML = `
                    <div class="text-xs text-slate-500 text-center py-4">
                        No upcoming classes. Book a class to get started!
                    </div>
                `;
            } else {
                upcomingListEl.innerHTML = upcomingBookings.map(booking => {
                    const classDate = new Date(booking.StartDateTime);
                    const isTomorrow = classDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                    const dateText = isTomorrow ? 'Tomorrow' : classDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    const timeText = classDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                    
                    // Get emoji for pet species
                    const pet = this.pets.find(p => p.PetID === booking.PetID);
                    const petEmoji = pet && pet.Species ? (pet.Species.toLowerCase().includes('dog') ? '🐕' : pet.Species.toLowerCase().includes('cat') ? '🐱' : '🐾') : '🐾';
                    
                    return `
                        <div class="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div class="h-16 w-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                ${petEmoji}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 class="font-semibold text-slate-900">${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')}</h3>
                                        <p class="text-sm text-slate-600 mt-1">
                                            ${dateText} · ${timeText}
                                        </p>
                                        <p class="text-xs text-slate-500 mt-1">
                                            ${this.escapeHtml(booking.PetName || 'Pet')}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
                                            ${booking.Status || 'Confirmed'}
                                        </span>
                                        <button onclick="customerPortal.cancelBooking(${booking.BookingID})" class="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render in the detailed list (upcomingClassesDetailedList)
        if (detailedListEl) {
            if (bookingsToRender.length === 0) {
                detailedListEl.innerHTML = `
                    <div class="text-xs text-slate-500 text-center py-4">
                        ${this.searchTerm || this.currentFilter !== 'all' 
                            ? 'No bookings match your search criteria.' 
                            : 'No bookings found. Book a class to get started!'}
                    </div>
                `;
            } else {
                const avatarColors = ['bg-sky-100 text-sky-600', 'bg-amber-100 text-amber-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600'];
                
                detailedListEl.innerHTML = bookingsToRender.map((booking, index) => {
                    const classDate = new Date(booking.StartDateTime);
                    const isToday = classDate.toDateString() === now.toDateString();
                    const isTomorrow = classDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                    let dateText = '';
                    if (isToday) {
                        dateText = 'Today';
                    } else if (isTomorrow) {
                        dateText = 'Tomorrow';
                    } else {
                        dateText = classDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    }
                    const timeText = classDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                    
                    // Get emoji for pet species
                    const pet = this.pets.find(p => p.PetID === booking.PetID);
                    const petEmoji = pet && pet.Species ? (pet.Species.toLowerCase().includes('dog') ? '🐕' : pet.Species.toLowerCase().includes('cat') ? '🐱' : pet.Species.toLowerCase().includes('bird') ? '🐦' : '🐾') : '🐾';
                    const avatarColor = avatarColors[index % avatarColors.length];
                    
                    return `
                        <div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-colors">
                            <div class="flex-shrink-0">
                                <div class="h-12 w-12 rounded-full ${avatarColor} flex items-center justify-center font-semibold">
                                    ${petEmoji}
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 class="font-semibold text-slate-900">${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')}</h3>
                                        <p class="text-sm text-slate-600 mt-1">
                                            ${dateText} · ${timeText}
                                        </p>
                                        <p class="text-xs text-slate-500 mt-1">
                                            ${this.escapeHtml(booking.PetName || 'Pet')}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
                                            ${booking.Status || 'Confirmed'}
                                        </span>
                                        <button onclick="customerPortal.cancelBooking(${booking.BookingID})" class="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    // Update stats
    updateStats() {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Upcoming classes (this week)
        const upcomingThisWeek = this.bookings.filter(b => {
            if (!b.StartDateTime) return false;
            const classDate = new Date(b.StartDateTime);
            return classDate > now && classDate <= weekFromNow && (b.Status === 'Scheduled' || b.Status === 'Booked');
        }).length;

        // Total bookings
        const totalBookings = this.bookings.length;

        // Completed classes
        const completed = this.bookings.filter(b => b.Status === 'Completed').length;

        const upcomingEl = document.getElementById('upcomingClassesCount');
        if (upcomingEl) upcomingEl.textContent = upcomingThisWeek;

        const totalEl = document.getElementById('totalBookingsCount');
        if (totalEl) totalEl.textContent = totalBookings;

        const completedEl = document.getElementById('completedClassesCount');
        if (completedEl) completedEl.textContent = completed;
    },

    // Render recent activity
    renderRecentActivity() {
        const activityListEl = document.getElementById('recentActivityList');
        if (!activityListEl) return;

        if (this.bookings.length === 0 && this.pets.length === 0) {
            activityListEl.innerHTML = `
                <div class="text-xs text-slate-500 text-center py-4">
                    No recent activity. Book a class or add a pet to get started!
                </div>
            `;
            return;
        }

        // Create activity items from bookings and pets
        const activities = [];

        // Add recent bookings
        this.bookings.slice(0, 5).forEach(booking => {
            const classDate = new Date(booking.StartDateTime);
            const isPast = classDate < new Date();
            const daysAgo = Math.floor((new Date() - classDate) / (1000 * 60 * 60 * 24));
            const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

            activities.push({
                type: isPast && booking.Status === 'Completed' ? 'completed' : 'booked',
                icon: isPast && booking.Status === 'Completed' ? '✓' : '📅',
                iconBg: isPast && booking.Status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600',
                text: isPast && booking.Status === 'Completed' 
                    ? `Completed: ${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')} with ${this.escapeHtml(booking.PetName || 'pet')}`
                    : `Booked: ${this.escapeHtml(booking.Title || booking.ClassTitle || 'Class')} with ${this.escapeHtml(booking.PetName || 'pet')}`,
                subtext: timeAgo,
                date: classDate
            });
        });

        // Sort by date (most recent first)
        activities.sort((a, b) => b.date - a.date);

        if (activities.length === 0) {
            activityListEl.innerHTML = `
                <div class="text-xs text-slate-500 text-center py-4">
                    No recent activity.
                </div>
            `;
            return;
        }

        activityListEl.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div class="h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center flex-shrink-0">
                    ${activity.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-slate-900">
                        <span class="font-medium">${activity.type === 'completed' ? 'Completed:' : 'Booked:'}</span> ${activity.text}
                    </p>
                    <p class="text-xs text-slate-500 mt-1">${activity.subtext}</p>
                </div>
            </div>
        `).join('');
    },

    // Load available classes
    async loadClasses() {
        try {
            const response = await fetch('http://localhost:3000/api/classes');
            if (response.ok) {
                const data = await response.json();
                this.availableClasses = data || [];
                this.renderUpcomingClasses();
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            this.availableClasses = [];
            this.renderUpcomingClasses();
        }
    },

    // Load customer's bookings
    async loadBookings() {
        try {
            const response = await fetch(`http://localhost:3000/api/bookings?customerId=${this.customerId}`);
            if (response.ok) {
                const data = await response.json();
                this.bookings = data || [];
            } else {
                this.bookings = [];
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = [];
        }
        // Always update UI after loading bookings
        this.applyFiltersAndSort();
        this.updateStats();
        this.renderRecentActivity();
        this.renderUpcomingClasses();
    },

    // Open booking modal
    openBookingModal() {
        if (!this.customerId) {
            alert('Please log in as a customer first.');
            window.location.href = 'login.html';
            return;
        }

        if (this.pets.length === 0) {
            alert('Please add a pet first before booking a class.');
            return;
        }

        // Populate pet dropdown
        const petSelect = document.getElementById('bookingPetId');
        if (petSelect) {
            petSelect.innerHTML = '<option value="">Select a pet...</option>';
            this.pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.PetID;
                option.textContent = `${pet.Name} (${pet.Species})`;
                petSelect.appendChild(option);
            });
        }

        // Populate class dropdown
        const classSelect = document.getElementById('bookingClassId');
        if (classSelect) {
            classSelect.innerHTML = '<option value="">Select a class...</option>';
            this.availableClasses.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.ClassID;
                const date = new Date(cls.StartDateTime || cls.ScheduleDate);
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                option.textContent = `${cls.Title || cls.ClassName} • ${dateStr} @ ${timeStr}`;
                classSelect.appendChild(option);
            });
        }

        // Clear form and errors
        document.getElementById('bookingForm').reset();
        this.clearBookingErrors();
        
        // Show modal
        document.getElementById('bookingModal').classList.add('show');
    },

    // Close booking modal
    closeBookingModal() {
        document.getElementById('bookingModal').classList.remove('show');
        document.getElementById('bookingForm').reset();
        this.clearBookingErrors();
    },

    // Clear booking errors
    clearBookingErrors() {
        const errorEl = document.getElementById('bookingError');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        const successEl = document.getElementById('bookingSuccess');
        if (successEl) {
            successEl.textContent = '';
            successEl.style.display = 'none';
        }
    },

    // Handle booking form submission
    async handleBookingSubmit(event) {
        event.preventDefault();
        this.clearBookingErrors();

        if (!this.customerId) {
            this.showBookingError('Please log in as a customer first.');
            return;
        }

        const petId = document.getElementById('bookingPetId').value;
        const classId = document.getElementById('bookingClassId').value;

        if (!petId) {
            this.showBookingError('Please select a pet.');
            return;
        }

        if (!classId) {
            this.showBookingError('Please select a class.');
            return;
        }

        const submitButton = document.getElementById('bookingSubmitBtn');
        submitButton.disabled = true;
        submitButton.textContent = 'Booking...';

        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: Number(this.customerId),
                    petId: Number(petId),
                    classId: Number(classId)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to book class');
            }

            // Success!
            this.showBookingSuccess('Class booked successfully!');
            
            // Reload bookings, pets, and classes to refresh data
            await this.loadBookings();
            await this.loadPets();
            await this.loadClasses();
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                this.closeBookingModal();
            }, 1500);

        } catch (error) {
            console.error('Error booking class:', error);
            let errorMessage = 'Failed to book class. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Make sure the server is running on http://localhost:3000';
            }
            this.showBookingError(errorMessage);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Book Class';
        }
    },

    // Show booking error
    showBookingError(message) {
        const errorEl = document.getElementById('bookingError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    // Show booking success
    showBookingSuccess(message) {
        const successEl = document.getElementById('bookingSuccess');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    },

    // ============================================================================
    // PET MANAGEMENT
    // ============================================================================

    // Open add pet modal
    openAddPetModal() {
        if (!this.customerId) {
            alert('Please log in as a customer first.');
            window.location.href = 'login.html';
            return;
        }

        // Clear form and errors
        document.getElementById('addPetForm').reset();
        this.clearPetErrors();
        
        // Show modal
        document.getElementById('addPetModal').classList.add('show');
    },

    // Close add pet modal
    closeAddPetModal() {
        document.getElementById('addPetModal').classList.remove('show');
        document.getElementById('addPetForm').reset();
        this.clearPetErrors();
    },

    // Clear pet errors
    clearPetErrors() {
        const errorEl = document.getElementById('addPetError');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        const successEl = document.getElementById('addPetSuccess');
        if (successEl) {
            successEl.textContent = '';
            successEl.style.display = 'none';
        }
    },

    // Handle add pet form submission
    async handleAddPetSubmit(event) {
        event.preventDefault();
        this.clearPetErrors();

        if (!this.customerId) {
            this.showPetError('Please log in as a customer first.');
            return;
        }

        const name = document.getElementById('petName').value.trim();
        const species = document.getElementById('petSpecies').value;
        const breed = document.getElementById('petBreed').value.trim();

        if (!name) {
            this.showPetError('Please enter a pet name.');
            return;
        }

        if (!species) {
            this.showPetError('Please select a species.');
            return;
        }

        const submitButton = document.getElementById('addPetSubmitBtn');
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';

        try {
            const response = await fetch('http://localhost:3000/api/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: Number(this.customerId),
                    name: name,
                    species: species,
                    breed: breed || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add pet');
            }

            // Success!
            this.showPetSuccess('Pet added successfully!');
            
            // Reload pets (this will also re-render the list)
            await this.loadPets();
            // Reload bookings to update activity
            await this.loadBookings();
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                this.closeAddPetModal();
            }, 1500);

        } catch (error) {
            console.error('Error adding pet:', error);
            let errorMessage = 'Failed to add pet. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Make sure the server is running on http://localhost:3000';
            }
            this.showPetError(errorMessage);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Add Pet';
        }
    },

    // Show pet error
    showPetError(message) {
        const errorEl = document.getElementById('addPetError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    // Show pet success
    showPetSuccess(message) {
        const successEl = document.getElementById('addPetSuccess');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    },

    // Open edit pet modal
    openEditPetModal(petId) {
        if (!this.customerId) {
            alert('Please log in as a customer first.');
            return;
        }

        const pet = this.pets.find(p => p.PetID === petId);
        if (!pet) {
            alert('Pet not found');
            return;
        }

        // Populate form
        document.getElementById('editPetId').value = petId;
        document.getElementById('editPetName').value = pet.Name || '';
        document.getElementById('editPetSpecies').value = pet.Species || '';
        document.getElementById('editPetBreed').value = pet.Breed || '';
        
        // Clear errors
        this.clearEditPetErrors();
        
        // Show modal
        document.getElementById('editPetModal').classList.add('show');
    },

    // Close edit pet modal
    closeEditPetModal() {
        document.getElementById('editPetModal').classList.remove('show');
        document.getElementById('editPetForm').reset();
        this.clearEditPetErrors();
    },

    // Clear edit pet errors
    clearEditPetErrors() {
        const errorEl = document.getElementById('editPetError');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        const successEl = document.getElementById('editPetSuccess');
        if (successEl) {
            successEl.textContent = '';
            successEl.style.display = 'none';
        }
    },

    // Handle edit pet form submission
    async handleEditPetSubmit(event) {
        event.preventDefault();
        this.clearEditPetErrors();

        const petId = document.getElementById('editPetId').value;
        const name = document.getElementById('editPetName').value.trim();
        const species = document.getElementById('editPetSpecies').value;
        const breed = document.getElementById('editPetBreed').value.trim();

        if (!name) {
            this.showEditPetError('Please enter a pet name.');
            return;
        }

        if (!species) {
            this.showEditPetError('Please select a species.');
            return;
        }

        const submitButton = document.getElementById('editPetSubmitBtn');
        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';

        try {
            const response = await fetch(`http://localhost:3000/api/pets/${petId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    species: species,
                    breed: breed || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update pet');
            }

            // Success!
            this.showEditPetSuccess('Pet updated successfully!');
            
            // Reload pets
            await this.loadPets();
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                this.closeEditPetModal();
            }, 1500);

        } catch (error) {
            console.error('Error updating pet:', error);
            let errorMessage = 'Failed to update pet. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Make sure the server is running on http://localhost:3000';
            }
            this.showEditPetError(errorMessage);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Update Pet';
        }
    },

    // Show edit pet error
    showEditPetError(message) {
        const errorEl = document.getElementById('editPetError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    // Show edit pet success
    showEditPetSuccess(message) {
        const successEl = document.getElementById('editPetSuccess');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    },

    // Delete pet
    async deletePet(petId) {
        if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete pet');
            }

            // Success!
            alert('Pet deleted successfully!');
            
            // Reload pets
            await this.loadPets();
            // Reload bookings to update activity
            await this.loadBookings();

        } catch (error) {
            console.error('Error deleting pet:', error);
            let errorMessage = 'Failed to delete pet. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Make sure the server is running on http://localhost:3000';
            }
            alert(errorMessage);
        }
    },

    // Cancel booking
    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/bookings?bookingId=${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel booking');
            }

            // Success!
            alert('Booking cancelled successfully!');
            
            // Reload bookings
            await this.loadBookings();
            // Reload classes to update availability
            await this.loadClasses();

        } catch (error) {
            console.error('Error cancelling booking:', error);
            let errorMessage = 'Failed to cancel booking. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Make sure the server is running on http://localhost:3000';
            }
            alert(errorMessage);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    customerPortal.init();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        customerPortal.closeBookingModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('bookingModal');
        if (modal && modal.classList.contains('show')) {
            customerPortal.closeBookingModal();
        }
    }
});

