document.addEventListener('DOMContentLoaded', () => {
    const timetableDisplay = document.getElementById('timetable-display');
    const saveTimetableBtn = document.getElementById('save-timetable-btn');
    const requestNotificationPermissionBtn = document.getElementById('request-notification-permission-btn');
    const notificationSound = document.getElementById('notification-sound');
    const currentTimeElement = document.getElementById('current-time');
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const courseColors = [
        'var(--course-color-1)',
        'var(--course-color-2)',
        'var(--course-color-3)',
        'var(--course-color-4)',
        'var(--course-color-5)',
        'var(--course-color-6)',
        'var(--course-color-7)'
    ]; // Using CSS variables for colors
    let colorIndex = 0; // To cycle through colors

    // --- Clock Logic (Live) ---
    function updateClock() {
        const now = new Date();
        // To get the time in WAT (West Africa Time), we can format the date.
        // This might not handle all edge cases like DST changes if Nigeria had them,
        // but for a standard time zone, toLocaleTimeString with options is usually sufficient.
        // Nigeria (WAT) is UTC+1.
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
            timeZone: 'Africa/Lagos' // Specify the timezone for WAT
        };
        try {
             const formattedTime = now.toLocaleTimeString('en-US', options);
             currentTimeElement.textContent = `${formattedTime} WAT`;
        } catch (error) {
             console.error("Error getting time in Africa/Lagos timezone, falling back to UTC:", error);
             // Fallback to UTC if timezone is not supported or error occurs
             const utcOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'UTC'
             };
             const utcTime = now.toLocaleTimeString('en-US', utcOptions);
             currentTimeElement.textContent = `${utcTime} UTC`; // Indicate it's UTC
        }

    }

    // Update the clock every second
    setInterval(updateClock, 1000);
    // Initial call to set the clock text immediately
    updateClock();


    // --- Timetable Input Handling ---

    // Function to add a new course input row to a specific day
    function addCourseInputRow(dayElement, course = {}) {
        const coursesForDayDiv = dayElement.querySelector('.courses-for-day');
        const row = document.createElement('div');
        row.classList.add('course-input-row');
        row.innerHTML = `
            <input type="text" class="course-name" placeholder="Course Name" value="${course.name || ''}">
            <input type="time" class="course-start-time" value="${course.startTime || ''}">
            <input type="time" class="course-end-time" value="${course.endTime || ''}">
            <button class="remove-course-btn">&times;</button>
        `;

        // Add event listener to the remove button
        row.querySelector('.remove-course-btn').addEventListener('click', function() {
            row.remove();
             // Optionally re-save or update display after removing
        });

        coursesForDayDiv.appendChild(row);
    }

    // Populate initial input rows for each day
    document.querySelectorAll('.day-input-block').forEach(dayBlock => {
        const addBtn = dayBlock.querySelector('.add-course-btn');
        addBtn.addEventListener('click', () => {
            addCourseInputRow(dayBlock);
        });

        // Add one initial empty row if none exist (handled in loadTimetable now)
    });


    // --- Timetable Data Management ---

    // Load timetable from local storage and populate input forms
    function loadTimetable() {
        const savedTimetable = localStorage.getItem('studentTimetable');
        if (savedTimetable) {
            const timetable = JSON.parse(savedTimetable);

            // Clear existing input rows first
            document.querySelectorAll('.courses-for-day').forEach(coursesDiv => {
                coursesDiv.innerHTML = '';
            });

            // Populate input forms
            daysOfWeek.forEach(day => {
                const dayBlock = document.querySelector(`.day-input-block[data-day="${day}"]`);
                if (dayBlock && timetable[day]) {
                    timetable[day].forEach(course => {
                        addCourseInputRow(dayBlock, course);
                    });
                     // Ensure at least one empty row if the day was empty
                     if (timetable[day].length === 0) {
                          addCourseInputRow(dayBlock);
                     }
                } else if (dayBlock) {
                     // If day exists but no data saved, ensure one empty row
                     addCourseInputRow(dayBlock);
                }
            });

            renderTimetableDisplay(timetable); // Also render the display
            return timetable; // Return the loaded timetable
        } else {
             // If no timetable saved, ensure one empty row for each day
             document.querySelectorAll('.day-input-block').forEach(dayBlock => {
                 if (dayBlock.querySelectorAll('.course-input-row').length === 0) {
                      addCourseInputRow(dayBlock);
                 }
             });
            renderTimetableDisplay({}); // Render empty display
            return {}; // Return empty timetable
        }
    }

    // Save timetable from input forms to local storage
    saveTimetableBtn.addEventListener('click', () => {
        const timetable = {};
        // Reset color index for consistent color assignment on save
        colorIndex = 0;
        document.querySelectorAll('.day-input-block').forEach(dayBlock => {
            const day = dayBlock.dataset.day;
            const courses = [];
            dayBlock.querySelectorAll('.course-input-row').forEach(row => {
                const nameInput = row.querySelector('.course-name');
                const startTimeInput = row.querySelector('.course-start-time');
                const endTimeInput = row.querySelector('.course-end-time');

                const name = nameInput.value.trim();
                const startTime = startTimeInput.value;
                const endTime = endTimeInput.value;

                if (name && startTime && endTime) {
                    courses.push({
                        id: Date.now() + Math.random(), // Simple unique ID
                        name: name,
                        startTime: startTime,
                        endTime: endTime,
                        color: courseColors[colorIndex % courseColors.length] // Assign a color
                    });
                     colorIndex++; // Move to the next color for the next course
                }
            });
            timetable[day] = courses;
        });

        localStorage.setItem('studentTimetable', JSON.stringify(timetable));
        renderTimetableDisplay(timetable); // Update the display after saving
        alert("Timetable saved!");
        // After saving, re-schedule notifications based on the new timetable
        scheduleRealtimeNotifications(timetable);
    });

    // Render the timetable display section
    function renderTimetableDisplay(timetable) {
        timetableDisplay.innerHTML = ''; // Clear current display
        let hasCourses = false;

        daysOfWeek.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.classList.add('day-column');
            dayColumn.innerHTML = `<h3>${day}</h3>`; // Day name header

            if (timetable[day] && timetable[day].length > 0) {
                hasCourses = true;
                // Sort courses by start time
                timetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));

                timetable[day].forEach(course => {
                    const courseEntry = document.createElement('div');
                    courseEntry.classList.add('course-entry');
                    courseEntry.style.borderLeftColor = course.color; // Apply course color
                    courseEntry.innerHTML = `
                        <div class="course-name">${course.name}</div>
                        <div class="course-time">${course.startTime} - ${course.endTime}</div>
                    `;
                    dayColumn.appendChild(courseEntry);
                });
            } else {
                const noCourses = document.createElement('p');
                noCourses.textContent = "No classes";
                noCourses.style.fontSize = '0.9em';
                noCourses.style.color = 'var(--text-color-secondary)';
                noCourses.style.textAlign = 'center';
                dayColumn.appendChild(noCourses);
            }
            timetableDisplay.appendChild(dayColumn);
        });

        if (!hasCourses) {
             timetableDisplay.innerHTML = '<p class="no-timetable-message">Timetable not set yet. Add courses above and save!</p>';
        }
    }

    // --- Notification Handling ---

    // Request notification permission
    requestNotificationPermissionBtn.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications.");
        } else if (Notification.permission === "granted") {
            alert("Notification permission already granted!");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    alert("Notification permission granted! You will receive notifications when the app is open.");
                    // You can now schedule notifications
                } else {
                    alert("Notification permission denied. You will not receive class notifications.");
                }
            });
        } else {
            alert("Notification permission denied. Please enable it in your browser settings to receive notifications.");
        }
    });

    // Function to schedule real-time notifications (only works when app is open)
    function scheduleRealtimeNotifications(timetable) {
        // Clear any previously scheduled timers to avoid duplicates
        // (In a more complex app, you'd store and clear timer IDs)
        // For this example, simply re-scheduling on save/load is sufficient.

        const now = new Date();
        const today = daysOfWeek[now.getDay()];
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

        if (timetable[today]) {
            timetable[today].forEach(course => {
                const [hour, minute] = course.startTime.split(':').map(Number);
                const courseStartTimeMinutes = hour * 60 + minute;

                // Calculate time until the class starts in milliseconds
                // Add a small buffer (e.g., 1 second) to ensure it triggers slightly after the exact time
                let timeUntilCourse = (courseStartTimeMinutes - currentTimeMinutes) * 60 * 1000 - 1000; // 1 second before

                // If the class is in the future today
                if (timeUntilCourse > 0) {
                     // Schedule the notification
                     setTimeout(() => {
                         if (Notification.permission === "granted") {
                             new Notification(`Upcoming Class: ${course.name}`, {
                                 body: `Time for ${course.name} class! It starts at ${course.startTime}.`,
                                 icon: 'icon.png' // Replace with your app icon
                             });
                             // Play sound
                             if (notificationSound) {
                                 notificationSound.play().catch(error => console.error("Error playing sound:", error));
                             }
                         }
                     }, timeUntilCourse);
                }
            });
        }
    }

    // Function to show daily summary notification (when app is opened on a new day)
    function showDailySummaryNotification(timetable) {
        const now = new Date();
        const today = daysOfWeek[now.getDay()];
        const lastDailyNotificationDate = localStorage.getItem('lastDailyNotificationDate');
        const todayDateString = now.toDateString();

        // Check if the daily notification has already been shown today
        if (lastDailyNotificationDate !== todayDateString && timetable[today] && timetable[today].length > 0) {
            if (Notification.permission === "granted") {
                let summaryBody = `Your classes for today (${today}):\n`;
                timetable[today].sort((a, b) => a.startTime.localeCompare(b.startTime)); // Sort by time
                timetable[today].forEach(course => {
                    summaryBody += `- ${course.name} (${course.startTime} - ${course.endTime})\n`;
                });

                new Notification(`Timetable Summary for ${today}`, {
                    body: summaryBody,
                    icon: 'icon.png' // Replace with your app icon
                });

                // Store the date the daily notification was shown
                localStorage.setItem('lastDailyNotificationDate', todayDateString);
            }
        } else if (lastDailyNotificationDate !== todayDateString && (!timetable[today] || timetable[today].length === 0)) {
             // If no classes today and notification hasn't been shown for today
             if (Notification.permission === "granted") {
                  new Notification(`Timetable Summary for ${today}`, {
                       body: `You have no scheduled classes today.`,
                       icon: 'icon.png' // Replace with your app icon
                  });
                   localStorage.setItem('lastDailyNotificationDate', todayDateString);
             }
        }
    }


    // --- Initial Load ---
    const initialTimetable = loadTimetable(); // Load timetable and render display on page load

    // After loading, schedule notifications for today's classes
    scheduleRealtimeNotifications(initialTimetable);
    showDailySummaryNotification(initialTimetable); // Show daily summary on load if it's a new day

});
