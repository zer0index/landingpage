document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const daySelectionContainer = document.getElementById('day-selection-container');
    const timeslotsContainer = document.getElementById('timeslots-container');
    const timeslotsList = document.getElementById('timeslots-list');
    const timeslotsTitle = document.getElementById('timeslots-title');
    const selectionSummary = document.getElementById('selection-summary');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const currentYearSpan = document.getElementById('current-year');
    const currentYearConfirmSpan = document.getElementById('current-year-confirm'); // In case needed on confirm page too

    // --- State ---
    let selectedDate = null; // Format: 'YYYY-MM-DD'
    let selectedTimeSlot = null; // Format: 'HH:MM-HH:MM'
    let availableSlots = {}; // To be populated

    // --- Configuration ---
    const numberOfDaysToShow = 7; // How many upcoming days to show cards for
    const trialDurationHours = 2;

    // --- Functions ---

    /**
     * Formats a Date object into YYYY-MM-DD string
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Simulates fetching available slots (replace with real API call eventually)
     * Returns an object like: { 'YYYY-MM-DD': ['09:00-11:00', '11:00-13:00', ...], ... }
     */
    function fetchAvailableSlots() {
        const slots = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < numberOfDaysToShow + 5; i++) { // Generate a bit more than needed
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            const dateStr = formatDate(currentDate);
            const daySlots = [];

            if (dayOfWeek > 0 && dayOfWeek < 6) { // Weekdays (Mon-Fri)
                for (let hour = 9; hour < 18; hour += trialDurationHours) { // 9am to 5pm slots
                    const startHourStr = String(hour).padStart(2, '0');
                    const endHourStr = String(hour + trialDurationHours).padStart(2, '0');
                    daySlots.push(`${startHourStr}:00-${endHourStr}:00`);
                }
            } else if (dayOfWeek === 6) { // Saturday
                for (let hour = 10; hour < 16; hour += trialDurationHours) { // 10am to 3pm slots
                    const startHourStr = String(hour).padStart(2, '0');
                    const endHourStr = String(hour + trialDurationHours).padStart(2, '0');
                    daySlots.push(`${startHourStr}:00-${endHourStr}:00`);
                }
            }
            // No slots for Sunday (dayOfWeek === 0)

            if (daySlots.length > 0) {
                slots[dateStr] = daySlots;
            }
        }
        // console.log("Generated Slots:", slots);
        return slots;
    }

    /**
     * Renders the day cards based on availability
     */
    function renderDayCards() {
        daySelectionContainer.innerHTML = ''; // Clear loading message or previous cards
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let daysRendered = 0;
        let checkDay = 0;

        while (daysRendered < numberOfDaysToShow && checkDay < 30) { // Limit checks
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + checkDay);
            const dateStr = formatDate(currentDate);
            const isAvailable = availableSlots[dateStr] && availableSlots[dateStr].length > 0;

            // Only render if it's today or in the future and has slots
            if (isAvailable || checkDay === 0) { // Show today even if no slots, but disabled
                const dayCard = document.createElement('div');
                dayCard.classList.add('day-card');
                dayCard.dataset.date = dateStr;

                const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = currentDate.getDate();
                const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });

                dayCard.innerHTML = `
                    <span class="day-name">${dayName}</span>
                    <span class="day-number">${dayNumber}</span>
                    <span class="month-name">${monthName}</span>
                `;

                if (isAvailable) {
                    dayCard.classList.add('available');
                    dayCard.addEventListener('click', handleDayCardClick);
                } else {
                    dayCard.classList.add('disabled');
                }
                daySelectionContainer.appendChild(dayCard);
                daysRendered++;
            }
            checkDay++;
        }
         // Add animation class after rendering
        daySelectionContainer.classList.add('animate-on-scroll', 'slide-up');
        setupAnimationObserver(daySelectionContainer);
    }

    /**
     * Renders time slot buttons for the selected date
     */
    function renderTimeSlots(dateStr) {
        timeslotsList.innerHTML = ''; // Clear previous
        const times = availableSlots[dateStr] || [];
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        timeslotsTitle.textContent = `Available Times for ${dateObj.toLocaleDateString('en-US', dateOptions)}:`;

        if (times.length > 0) {
            times.forEach(time => {
                const timeBtn = document.createElement('button');
                timeBtn.classList.add('timeslot-btn', 'available');
                timeBtn.textContent = time;
                timeBtn.dataset.time = time;
                timeBtn.addEventListener('click', handleTimeSlotClick);
                timeslotsList.appendChild(timeBtn);
            });
        } else {
            timeslotsList.innerHTML = '<p>No available time slots for this date.</p>';
        }
        timeslotsContainer.style.display = 'block';
    }

    /**
     * Updates the summary text based on current selection
     */
    function updateSelectionSummary() {
        if (selectedDate && selectedTimeSlot) {
            const dateObj = new Date(selectedDate + 'T00:00:00');
            const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
            selectionSummary.textContent = `Selected: ${dateObj.toLocaleDateString('en-US', dateOptions)} @ ${selectedTimeSlot}`;
            confirmBookingBtn.disabled = false;
        } else if (selectedDate) {
            const dateObj = new Date(selectedDate + 'T00:00:00');
            const dateOptions = { month: 'long', day: 'numeric' };
            selectionSummary.textContent = `Selected Date: ${dateObj.toLocaleDateString('en-US', dateOptions)}. Now choose a time.`;
            confirmBookingBtn.disabled = true;
        } else {
            selectionSummary.textContent = 'Please select a day and time slot.';
            confirmBookingBtn.disabled = true;
        }
    }

    /**
     * Handles clicking on an available day card
     */
    function handleDayCardClick(event) {
        const clickedCard = event.currentTarget;
        const dateStr = clickedCard.dataset.date;

        // If already selected, do nothing (or maybe deselect? For now, no)
        if (dateStr === selectedDate) return;

        // Remove selection from previously selected card
        const currentlySelected = daySelectionContainer.querySelector('.day-card.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }

        // Select the new card
        clickedCard.classList.add('selected');
        selectedDate = dateStr;
        selectedTimeSlot = null; // Reset time slot when day changes

        // Render timeslots
        renderTimeSlots(dateStr);
        updateSelectionSummary();
    }

    /**
     * Handles clicking on an available time slot button
     */
    function handleTimeSlotClick(event) {
        const clickedBtn = event.currentTarget;
        const timeStr = clickedBtn.dataset.time;

        if (timeStr === selectedTimeSlot) return; // Clicked same slot again

        const currentlySelected = timeslotsList.querySelector('.timeslot-btn.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }

        clickedBtn.classList.add('selected');
        selectedTimeSlot = timeStr;
        updateSelectionSummary();
    }

    /**
     * Handles the final booking confirmation
     */
    function handleConfirmBooking() {
        if (!selectedDate || !selectedTimeSlot) {
            alert('Please select both a date and a time slot.');
            return;
        }

        // Construct URL and redirect
        const confirmationUrl = `confirmation.html?date=${selectedDate}&time=${selectedTimeSlot}`;
        window.location.href = confirmationUrl;
    }

    /**
     * Sets up Intersection Observer to trigger animations
     */
    function setupAnimationObserver(element) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Animate only once
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        observer.observe(element);
    }

    /**
     * Initialize animations for all designated elements
     */
    function initializeAnimations() {
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        elementsToAnimate.forEach(el => {
             // Apply specific animation class if needed, e.g., slide-up
             if (!el.classList.contains('day-cards-container')) { // Day cards handled separately
                 el.classList.add('slide-up');
             }
             setupAnimationObserver(el);
        });
    }

    /**
     * Update footer year
     */
    function updateFooterYear() {
        const year = new Date().getFullYear();
        if (currentYearSpan) currentYearSpan.textContent = year;
        // Check needed if script runs on confirmation page without this element
        // if (currentYearConfirmSpan) currentYearConfirmSpan.textContent = year; 
    }

    // --- Initialization ---
    updateFooterYear();
    availableSlots = fetchAvailableSlots();
    renderDayCards();
    updateSelectionSummary();
    initializeAnimations(); // Setup observers for entry animations

    // --- Event Listeners ---
    confirmBookingBtn.addEventListener('click', handleConfirmBooking);
}); 