document.addEventListener('DOMContentLoaded', () => {
    const confirmedDateEl = document.getElementById('confirmed-date');
    const confirmedTimeEl = document.getElementById('confirmed-time');
    const confirmedTimeEndEl = document.getElementById('confirmed-time-end');
    const currentYearConfirmSpan = document.getElementById('current-year-confirm');

    /**
     * Parses the time string HH:MM-HH:MM and returns start and end
     */
    function parseTimeSlot(timeSlotString) {
        if (!timeSlotString || !timeSlotString.includes('-')) {
            return { startTime: '[Start Time]', endTime: '[End Time]' }; // Default placeholders
        }
        const parts = timeSlotString.split('-');
        return {
            startTime: parts[0],
            endTime: parts[1]
        };
    }

    /**
     * Formats the date string YYYY-MM-DD into a readable format
     */
    function formatDisplayDate(dateString) {
        if (!dateString) return '[Date]';
        // Add 'T00:00:00' to ensure correct parsing across timezones
        const dateObj = new Date(dateString + 'T00:00:00'); 
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return dateObj.toLocaleDateString('en-US', options);
    }

     /**
     * Update footer year
     */
    function updateFooterYear() {
        const year = new Date().getFullYear();
        if (currentYearConfirmSpan) currentYearConfirmSpan.textContent = year;
    }

    // --- Main Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const timeParam = urlParams.get('time'); // Expected format: HH:MM-HH:MM

    const { startTime, endTime } = parseTimeSlot(timeParam);
    const displayDate = formatDisplayDate(dateParam);

    // Update the HTML elements
    if (confirmedDateEl) {
        confirmedDateEl.textContent = displayDate;
    }
    if (confirmedTimeEl) {
        confirmedTimeEl.textContent = startTime;
    }
    if (confirmedTimeEndEl) {
        confirmedTimeEndEl.textContent = endTime;
    }

    updateFooterYear();

}); 