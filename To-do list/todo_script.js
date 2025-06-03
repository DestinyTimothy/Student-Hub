document.addEventListener('DOMContentLoaded', () => {
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionTextarea = document.getElementById('task-description');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskDueTimeInput = document.getElementById('task-due-time');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskAlarmCheckbox = document.getElementById('task-alarm');
    const addTaskBtn = document.getElementById('add-task-btn');
    const updateTaskBtn = document.getElementById('update-task-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const taskListDiv = document.getElementById('task-list');
    const filterStatusSelect = document.getElementById('filter-status');
    const sortBySelect = document.getElementById('sort-by');
    const requestNotificationPermissionBtn = document.getElementById('request-notification-permission-btn');
    const alarmSound = document.getElementById('alarm-sound'); // Audio element for alarm
    const currentTimeElement = document.getElementById('current-time');
    const noTasksMessage = document.querySelector('.no-tasks-message');

    let tasks = []; // Array to store tasks
    let currentEditTaskId = null; // To track the task being edited

    // --- Clock Logic (Live) ---
    function updateClock() {
        const now = new Date();
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
             const utcOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'UTC'
             };
             const utcTime = now.toLocaleTimeString('en-US', utcOptions);
             currentTimeElement.textContent = `${utcTime} UTC`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    // --- Task Data Management ---

    // Load tasks from local storage
    function loadTasks() {
        const storedTasks = localStorage.getItem('studentTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            tasks = [];
        }
        renderTasks(); // Render the list after loading
        scheduleAlarms(); // Schedule alarms for tasks with alarms set
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('studentTasks', JSON.stringify(tasks));
        renderTasks(); // Re-render after saving
    }

    // Render the list of tasks
    function renderTasks() {
        taskListDiv.innerHTML = ''; // Clear current list
        const filterStatus = filterStatusSelect.value;
        const sortBy = sortBySelect.value;

        let filteredTasks = tasks;

        // Filter tasks
        if (filterStatus === 'active') {
            filteredTasks = tasks.filter(task => !task.isComplete);
        } else if (filterStatus === 'completed') {
            filteredTasks = tasks.filter(task => task.isComplete);
        }

        // Sort tasks
        filteredTasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                const dateA = a.dueDate && a.dueTime ? new Date(`${a.dueDate}T${a.dueTime}`) : (a.dueDate ? new Date(a.dueDate) : null);
                const dateB = b.dueDate && b.dueTime ? new Date(`${b.dueDate}T${b.dueTime}`) : (b.dueDate ? new Date(b.dueDate) : null);

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1; // Tasks without due dates come last
                if (!dateB) return -1;
                return dateA - dateB;
            } else if (sortBy === 'priority') {
                const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortBy === 'creationDate') {
                return new Date(a.timestamp) - new Date(b.timestamp);
            }
            return 0; // Default sort
        });


        if (filteredTasks.length === 0) {
             noTasksMessage.style.display = 'block';
             taskListDiv.appendChild(noTasksMessage);
        } else {
             noTasksMessage.style.display = 'none';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.classList.add('task-item', `priority-${task.priority}`);
                if (task.isComplete) {
                    taskItem.classList.add('completed');
                }
                taskItem.dataset.id = task.id; // Store task ID

                const dueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : null; // Parse date only
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const formattedDueDate = dueDate ? dueDate.toLocaleDateString(undefined, options) : 'No due date';
                const formattedDueTime = task.dueTime || 'No due time';

                taskItem.innerHTML = `
                    <div class="task-item-header">
                        <h3>${task.title}</h3>
                        <div class="task-actions">
                            <button class="complete-btn" title="Mark Complete">
                                <i class="ph-fill ph-check-circle"></i>
                            </button>
                             <button class="edit-btn" title="Edit Task">
                                <i class="ph-fill ph-pencil-simple"></i>
                            </button>
                            <button class="delete-btn" title="Delete Task">
                                <i class="ph-fill ph-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${task.description ? `<div class="task-item-body">${task.description}</div>` : ''}
                    <div class="task-item-footer">
                        <div class="due-date">
                             <i class="ph-fill ph-calendar-blank"></i> ${formattedDueDate} ${task.dueTime ? `at ${formattedDueTime}` : ''}
                        </div>
                        ${task.setAlarm ? '<div class="alarm-icon" title="Alarm Set"><i class="ph-fill ph-bell"></i></div>' : ''}
                    </div>
                `;

                // Add event listeners for actions
                taskItem.querySelector('.complete-btn').addEventListener('click', () => toggleTaskComplete(task.id));
                taskItem.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
                taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));


                taskListDiv.appendChild(taskItem);
            });
        }
    }

    // --- Task Actions ---

    // Add new task
    addTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionTextarea.value.trim();
        const dueDate = taskDueDateInput.value;
        const dueTime = taskDueTimeInput.value;
        const priority = taskPrioritySelect.value;
        const setAlarm = taskAlarmCheckbox.checked;

        if (!title) {
            alert("Task title is required.");
            return;
        }

        const newTask = {
            id: Date.now(), // Simple unique ID
            title: title,
            description: description,
            dueDate: dueDate,
            dueTime: dueTime,
            priority: priority,
            isComplete: false,
            setAlarm: setAlarm,
            timestamp: new Date().toISOString() // Creation timestamp
        };

        tasks.push(newTask);
        saveTasks();
        clearForm();
        scheduleAlarms(); // Reschedule alarms after adding a new task
    });

    // Toggle task complete status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.isComplete = !task.isComplete;
                // If marking complete, cancel any pending alarm for this task
                if (task.isComplete) {
                     cancelAlarm(task.id);
                }
            }
            return task;
        });
        saveTasks();
        // No need to reschedule all alarms here, only cancel the one if completed
    }

    // Edit task
    function editTask(id) {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            currentEditTaskId = taskToEdit.id;
            taskIdInput.value = taskToEdit.id;
            taskTitleInput.value = taskToEdit.title;
            taskDescriptionTextarea.value = taskToEdit.description;
            taskDueDateInput.value = taskToEdit.dueDate;
            taskDueTimeInput.value = taskToEdit.dueTime;
            taskPrioritySelect.value = taskToEdit.priority;
            taskAlarmCheckbox.checked = taskToEdit.setAlarm;

            // Switch button visibility
            addTaskBtn.classList.add('hidden');
            updateTaskBtn.classList.remove('hidden');
            cancelEditBtn.classList.remove('hidden');
        }
    }

    // Update task
    updateTaskBtn.addEventListener('click', () => {
        const id = parseFloat(taskIdInput.value); // Get ID from hidden input
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionTextarea.value.trim();
        const dueDate = taskDueDateInput.value;
        const dueTime = taskDueTimeInput.value;
        const priority = taskPrioritySelect.value;
        const setAlarm = taskAlarmCheckbox.checked;

        if (!title) {
            alert("Task title is required.");
            return;
        }

        tasks = tasks.map(task => {
            if (task.id === id) {
                 // Cancel existing alarm before updating
                 cancelAlarm(task.id);
                return {
                    id: task.id,
                    title: title,
                    description: description,
                    dueDate: dueDate,
                    dueTime: dueTime,
                    priority: priority,
                    isComplete: task.isComplete, // Keep existing completion status
                    setAlarm: setAlarm,
                    timestamp: task.timestamp // Keep original creation timestamp
                };
            }
            return task;
        });

        saveTasks();
        clearForm();
        // Switch button visibility back
        addTaskBtn.classList.remove('hidden');
        updateTaskBtn.classList.add('hidden');
        cancelEditBtn.classList.add('hidden');
        currentEditTaskId = null; // Reset edit ID
        scheduleAlarms(); // Reschedule alarms after updating
    });

    // Cancel edit
    cancelEditBtn.addEventListener('click', () => {
        clearForm();
        addTaskBtn.classList.remove('hidden');
        updateTaskBtn.classList.add('hidden');
        cancelEditBtn.classList.add('hidden');
        currentEditTaskId = null; // Reset edit ID
    });


    // Delete task
    function deleteTask(id) {
        if (confirm("Are you sure you want to delete this task?")) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            cancelAlarm(id); // Cancel alarm if task is deleted
            // If the deleted task was being edited, clear the form
            if (currentEditTaskId === id) {
                 clearForm();
                 addTaskBtn.classList.remove('hidden');
                 updateTaskBtn.classList.add('hidden');
                 cancelEditBtn.classList.add('hidden');
                 currentEditTaskId = null;
            }
        }
    }

    // Clear input form
    function clearForm() {
        taskIdInput.value = '';
        taskTitleInput.value = '';
        taskDescriptionTextarea.value = '';
        taskDueDateInput.value = '';
        taskDueTimeInput.value = '';
        taskPrioritySelect.value = 'medium';
        taskAlarmCheckbox.checked = false;
    }

    // --- Filtering and Sorting ---
    filterStatusSelect.addEventListener('change', renderTasks);
    sortBySelect.addEventListener('change', renderTasks);


    // --- Alarm/Notification Logic ---

    // Request notification permission (same as Timetable)
    requestNotificationPermissionBtn.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications.");
        } else if (Notification.permission === "granted") {
            alert("Notification permission already granted!");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    alert("Notification permission granted! You will receive task alarms when the app is open.");
                } else {
                    alert("Notification permission denied. You will not receive task alarms.");
                }
            });
        } else {
            alert("Notification permission denied. Please enable it in your browser settings to receive alarms.");
        }
    });

    // Store timer IDs for alarms so they can be cancelled
    const alarmTimers = {};

    // Schedule alarms for tasks that need them
    function scheduleAlarms() {
        // Clear all existing timers before rescheduling
        for (const id in alarmTimers) {
            clearTimeout(alarmTimers[id]);
            delete alarmTimers[id];
        }

        const now = new Date();

        tasks.forEach(task => {
            // Only schedule alarms for active tasks with alarm set and a future due date/time
            if (!task.isComplete && task.setAlarm && task.dueDate && task.dueTime) {
                const [year, month, day] = task.dueDate.split('-').map(Number);
                const [hour, minute] = task.dueTime.split(':').map(Number);

                // Create a Date object for the task's due time in the local timezone
                // Note: For precise timezone handling (like WAT), using a library or server is better.
                // This uses the browser's local timezone interpretation of the date/time string.
                const taskDateTime = new Date(year, month - 1, day, hour, minute, 0);

                const timeUntilAlarm = taskDateTime.getTime() - now.getTime();

                // Schedule the alarm if the due time is in the future
                if (timeUntilAlarm > 0) {
                    alarmTimers[task.id] = setTimeout(() => {
                        if (Notification.permission === "granted") {
                            new Notification(`Task Alarm: ${task.title}`, {
                                body: `Your task "${task.title}" is due now!`,
                                icon: 'icon.png' // Replace with your app icon
                            });
                            // Play the alarm sound
                            if (alarmSound) {
                                alarmSound.play().catch(error => console.error("Error playing alarm sound:", error));
                            }
                        }
                        // Clean up the timer ID after the alarm fires
                        delete alarmTimers[task.id];
                    }, timeUntilAlarm);
                }
            }
        });
    }

    // Cancel a specific alarm by task ID
    function cancelAlarm(taskId) {
        if (alarmTimers[taskId]) {
            clearTimeout(alarmTimers[taskId]);
            delete alarmTimers[taskId];
            console.log(`Alarm for task ${taskId} cancelled.`); // For debugging
        }
    }


    // --- Initial Load ---
    loadTasks(); // Load tasks and render on page load

});
