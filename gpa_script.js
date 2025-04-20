document.addEventListener('DOMContentLoaded', () => {
    const coursesList = document.getElementById('courses-list');
    const addCourseBtn = document.getElementById('add-course-btn');
    const calculateGpaBtn = document.getElementById('calculate-gpa-btn');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const resultsArea = document.getElementById('results-area');
    const totalCreditsSpan = document.getElementById('total-credits');
    const totalGradePointsSpan = document.getElementById('total-grade-points');
    const gpaValueSpan = document.getElementById('gpa-value');
    const printGpaBtn = document.getElementById('print-gpa-btn');
    const currentTimeElement = document.getElementById('current-time');

    // --- Clock Logic (Static for now) ---
    // In a real app, you would use setInterval to update this every second
    // and fetch/calculate the actual time in the WAT timezone.
    function updateClock() {
        // Static time based on your request for now
        const currentTime = "16:30 WAT"; // Replace with dynamic time in a real app
        currentTimeElement.textContent = currentTime;

        // Example of how you might get current local time (needs timezone handling for WAT)
        /*
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}`; // This is local time, not WAT
        */
    }

    // Initial call to set the clock text
    updateClock();

    // --- GPA Calculator Logic ---

    // Function to create a new course input row
    function createCourseRow() {
        const row = document.createElement('div');
        row.classList.add('course-input-row');
        row.innerHTML = `
            <input type="text" class="course-name" placeholder="Course Name">
            <input type="number" class="course-credits" placeholder="Credits" min="1" value="3">
            <select class="course-grade">
                <option value="">Select Grade</option>
                <option value="4.0">A</option>
                <option value="3.7">A-</option>
                <option value="3.3">B+</option>
                <option value="3.0">B</option>
                <option value="2.7">B-</option>
                <option value="2.3">C+</option>
                <option value="2.0">C</option>
                <option value="1.7">C-</option>
                <option value="1.3">D+</option>
                <option value="1.0">D</option>
                <option value="0.0">F</option>
            </select>
            <button class="remove-course-btn">&times;</button>
        `;

        // Add event listener to the remove button in the new row
        row.querySelector('.remove-course-btn').addEventListener('click', function() {
            row.remove(); // Remove the parent course row
            // Optionally recalculate GPA or hide results if list becomes empty
            if (coursesList.children.length === 0) {
                 resultsArea.classList.add('hidden');
            }
        });

        return row;
    }

    // Add initial course row if the list is empty (or ensure one exists)
    if (coursesList.children.length === 0) {
        coursesList.appendChild(createCourseRow());
    }


    // Event listener for the "Add Course" button
    addCourseBtn.addEventListener('click', () => {
        coursesList.appendChild(createCourseRow());
    });

    // Event listener for the "Calculate GPA" button
    calculateGpaBtn.addEventListener('click', () => {
        let totalCredits = 0;
        let totalGradePoints = 0;
        const courseRows = coursesList.querySelectorAll('.course-input-row');
        let validInputs = true; // Flag to check if all inputs are valid

        courseRows.forEach(row => {
            const creditsInput = row.querySelector('.course-credits');
            const gradeSelect = row.querySelector('.course-grade');

            const credits = parseFloat(creditsInput.value);
            const gradeValue = parseFloat(gradeSelect.value); // This is the point value (4.0, 3.7, etc.)

            // Validate inputs
            if (isNaN(credits) || credits <= 0 || gradeSelect.value === "") {
                validInputs = false;
                // Optionally highlight the invalid row or show an error message
                row.style.border = '1px solid #FF3B30'; // Highlight with red border
                return; // Skip calculation for this row
            } else {
                 row.style.border = '1px solid var(--border-color)'; // Reset border if valid
            }

            totalCredits += credits;
            totalGradePoints += credits * gradeValue;
        });

        // Only proceed if all inputs were valid
        if (validInputs && totalCredits > 0) {
            const gpa = totalGradePoints / totalCredits;

            // Display results
            totalCreditsSpan.textContent = totalCredits.toFixed(2);
            totalGradePointsSpan.textContent = totalGradePoints.toFixed(2);
            gpaValueSpan.textContent = gpa.toFixed(2); // Format GPA to 2 decimal places
            resultsArea.classList.remove('hidden'); // Show the results area
        } else if (!validInputs) {
             alert("Please ensure all courses have valid credits (greater than 0) and a selected grade.");
             resultsArea.classList.add('hidden'); // Hide results if validation fails
        } else {
             // Case where totalCredits is 0 (e.g., no courses added or all removed)
             resultsArea.classList.add('hidden');
             alert("Please add at least one course with valid credits and grade to calculate GPA.");
        }
    });

    // Event listener for the "Reset" button
    resetFormBtn.addEventListener('click', () => {
        // Remove all course rows except one (or remove all and add one new)
        coursesList.innerHTML = ''; // Clear existing rows
        coursesList.appendChild(createCourseRow()); // Add one fresh row

        // Hide results area
        resultsArea.classList.add('hidden');

        // Reset spans
        totalCreditsSpan.textContent = '0';
        totalGradePointsSpan.textContent = '0';
        gpaValueSpan.textContent = '0.00';
    });

    // Event listener for the "Print GPA" button
    printGpaBtn.addEventListener('click', () => {
        window.print(); // Trigger the browser's print dialog
    });

    // Optional: Add animation on page load for initial elements
    // You could add a class to elements and use CSS transitions/animations
    // document.querySelector('.gpa-calculator-section').classList.add('loaded');
});
