// Global variables
let workTimer = null;
let pomodoroTimer = null;
let breakTimer = null;
let workSessionId = null;
let pomodoroSessionId = null;
let breakSessionId = null;
let isWorkRunning = false;
let isPomodoroRunning = false;
let isBreakRunning = false;
let isWorkPaused = false;
let isPomodoroPaused = false;
let isBreakPaused = false;
let workStartTime = 0;
let pomodoroStartTime = 0;
let breakStartTime = 0;
let workPauseTime = 0;
let pomodoroPauseTime = 0;
let breakPauseTime = 0;
let totalWorkTime = 0;
let totalPomodoroTime = 0;
let totalBreakTime = 0;
let idleTimer = null;
let lastActivity = Date.now();
let notificationPermission = false;
let openDropdownTaskId = null;

// Pomodoro timer variables
let pomodoroPhase = 'work'; // 'work' or 'break'
let pomodoroTime = 25 * 60 * 1000; // 25 minutes in milliseconds
let breakTime = 5 * 60 * 1000; // 5 minutes in milliseconds

// Sound settings
let pomodoroSoundEnabled = true;
let breakSoundEnabled = true;

// Music Player State
let musicEnabled = false;
let currentMusic = 'music1';

// DOM elements
const elements = {
    // Timers
    workTimer: document.getElementById('workTimer'),
    pomodoroTimer: document.getElementById('pomodoroTimer'),
    breakTimer: document.getElementById('breakTimer'),
    pomodoroPhase: document.getElementById('pomodoroPhase'),
    
    // Work timer buttons
    workStart: document.getElementById('workStart'),
    workPause: document.getElementById('workPause'),
    workStop: document.getElementById('workStop'),
    workReset: document.getElementById('workReset'),
    
    // Pomodoro timer buttons
    pomodoroStart: document.getElementById('pomodoroStart'),
    pomodoroPause: document.getElementById('pomodoroPause'),
    pomodoroStop: document.getElementById('pomodoroStop'),
    pomodoroReset: document.getElementById('pomodoroReset'),
    
    // Break timer buttons
    breakStart: document.getElementById('breakStart'),
    breakPause: document.getElementById('breakPause'),
    breakStop: document.getElementById('breakStop'),
    breakReset: document.getElementById('breakReset'),
    
    // Timer settings
    pomodoroWorkTime: document.getElementById('pomodoroWorkTime'),
    pomodoroBreakTime: document.getElementById('pomodoroBreakTime'),
    breakDuration: document.getElementById('breakDuration'),
    
    // Sound toggles
    togglePomodoroSound: document.getElementById('togglePomodoroSound'),
    toggleBreakSound: document.getElementById('toggleBreakSound'),
    
    // Timer cards
    pomodoroCard: document.getElementById('pomodoroCard'),
    breakCard: document.getElementById('breakCard'),
    
    // File upload
    taskFile: document.getElementById('taskFile'),
    selectedFileName: document.getElementById('selectedFileName'),
    uploadBtn: document.getElementById('uploadBtn'),
    
    // Tasks
    tasksList: document.getElementById('tasksList'),
    refreshTasks: document.getElementById('refreshTasks'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    addTaskForm: document.getElementById('addTaskForm'),
    taskForm: document.getElementById('taskForm'),
    taskText: document.getElementById('taskText'),
    cancelAddTask: document.getElementById('cancelAddTask'),
    
    // Stats
    totalWorkTime: document.getElementById('totalWorkTime'),
    tasksCompleted: document.getElementById('tasksCompleted'),
    currentStreak: document.getElementById('currentStreak'),
    streakCount: document.getElementById('streakCount'),
    currentDate: document.getElementById('currentDate'),
    
    // Missed days
    missedDaysSection: document.getElementById('missedDaysSection'),
    missedDaysList: document.getElementById('missedDaysList'),
    
    // Audio
    alarmSound: document.getElementById('alarmSound'),
    breakSound: document.getElementById('breakSound'),
    
    // Notifications
    notificationContainer: document.getElementById('notificationContainer'),
    clearTasksBtn: document.getElementById('clearTasks'),
    
    // Music
    toggleMusic: document.getElementById('toggleMusic'),
    musicSelect: document.getElementById('musicSelect'),
    music1: document.getElementById('music1'),
    music2: document.getElementById('music2'),
    music3: document.getElementById('music3'),
    music4: document.getElementById('music4'),
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDailyStats();
    loadTasks();
    checkMissedDays();
    requestNotificationPermission();
    setupIdleDetection();
    loadMusicSettings();
});

function initializeApp() {
    // Set current date
    const now = new Date();
    elements.currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Initialize timers
    updateWorkTimerDisplay();
    updatePomodoroTimerDisplay();
    updateBreakTimerDisplay();
    
    // Load timer settings from localStorage
    loadTimerSettings();
}

function setupEventListeners() {
    // Work timer events
    elements.workStart.addEventListener('click', startWorkTimer);
    elements.workPause.addEventListener('click', pauseWorkTimer);
    elements.workStop.addEventListener('click', stopWorkTimer);
    elements.workReset.addEventListener('click', resetWorkTimer);
    
    // Pomodoro timer events
    elements.pomodoroStart.addEventListener('click', startPomodoroTimer);
    elements.pomodoroPause.addEventListener('click', pausePomodoroTimer);
    elements.pomodoroStop.addEventListener('click', stopPomodoroTimer);
    elements.pomodoroReset.addEventListener('click', resetPomodoroTimer);
    
    // Break timer events
    elements.breakStart.addEventListener('click', startBreakTimer);
    elements.breakPause.addEventListener('click', pauseBreakTimer);
    elements.breakStop.addEventListener('click', stopBreakTimer);
    elements.breakReset.addEventListener('click', resetBreakTimer);
    
    // Timer settings events
    elements.pomodoroWorkTime.addEventListener('change', updatePomodoroSettings);
    elements.pomodoroBreakTime.addEventListener('change', updatePomodoroSettings);
    elements.breakDuration.addEventListener('change', updateBreakSettings);
    
    // Sound toggle events
    elements.togglePomodoroSound.addEventListener('click', togglePomodoroSound);
    elements.toggleBreakSound.addEventListener('click', toggleBreakSound);
    
    // File upload events
    elements.taskFile.addEventListener('change', handleFileSelect);
    elements.uploadBtn.addEventListener('click', uploadTasks);
    
    // Task management events
    elements.refreshTasks.addEventListener('click', loadTasks);
    elements.addTaskBtn.addEventListener('click', showAddTaskForm);
    elements.cancelAddTask.addEventListener('click', hideAddTaskForm);
    elements.taskForm.addEventListener('submit', handleAddTask);
    elements.clearTasksBtn.addEventListener('click', clearAllTasks);
    
    // Activity tracking
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);
    
    // Music
    elements.toggleMusic.addEventListener('click', toggleMusic);
    elements.musicSelect.addEventListener('change', selectMusic);
}

// Timer Settings Functions
function loadTimerSettings() {
    const settings = JSON.parse(localStorage.getItem('timerSettings') || '{}');
    
    if (settings.pomodoroWorkTime) {
        elements.pomodoroWorkTime.value = settings.pomodoroWorkTime;
        pomodoroTime = parseInt(settings.pomodoroWorkTime) * 60 * 1000;
    }
    if (settings.pomodoroBreakTime) {
        elements.pomodoroBreakTime.value = settings.pomodoroBreakTime;
        breakTime = parseInt(settings.pomodoroBreakTime) * 60 * 1000;
    }
    if (settings.breakDuration) {
        elements.breakDuration.value = settings.breakDuration;
    }
    if (settings.pomodoroSoundEnabled !== undefined) {
        pomodoroSoundEnabled = settings.pomodoroSoundEnabled;
        updatePomodoroSoundButton();
    }
    if (settings.breakSoundEnabled !== undefined) {
        breakSoundEnabled = settings.breakSoundEnabled;
        updateBreakSoundButton();
    }
    
    updatePomodoroTimerDisplay();
    updateBreakTimerDisplay();
}

function saveTimerSettings() {
    const settings = {
        pomodoroWorkTime: elements.pomodoroWorkTime.value,
        pomodoroBreakTime: elements.pomodoroBreakTime.value,
        breakDuration: elements.breakDuration.value,
        pomodoroSoundEnabled: pomodoroSoundEnabled,
        breakSoundEnabled: breakSoundEnabled
    };
    localStorage.setItem('timerSettings', JSON.stringify(settings));
}

function updatePomodoroSettings() {
    saveTimerSettings();
    if (!isPomodoroRunning) {
        pomodoroTime = parseInt(elements.pomodoroWorkTime.value) * 60 * 1000;
        breakTime = parseInt(elements.pomodoroBreakTime.value) * 60 * 1000;
        updatePomodoroTimerDisplay();
    }
}

function updateBreakSettings() {
    saveTimerSettings();
    if (!isBreakRunning) {
        updateBreakTimerDisplay();
    }
}

function togglePomodoroSound() {
    pomodoroSoundEnabled = !pomodoroSoundEnabled;
    updatePomodoroSoundButton();
    saveTimerSettings();
}

function toggleBreakSound() {
    breakSoundEnabled = !breakSoundEnabled;
    updateBreakSoundButton();
    saveTimerSettings();
}

function updatePomodoroSoundButton() {
    elements.togglePomodoroSound.textContent = pomodoroSoundEnabled ? 'ON' : 'OFF';
    elements.togglePomodoroSound.className = pomodoroSoundEnabled 
        ? 'bg-vivid-orange/20 text-vivid-orange px-2 py-1 rounded text-xs font-medium border border-vivid-orange/30'
        : 'bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs font-medium border border-gray-600/30';
}

function updateBreakSoundButton() {
    elements.toggleBreakSound.textContent = breakSoundEnabled ? 'ON' : 'OFF';
    elements.toggleBreakSound.className = breakSoundEnabled 
        ? 'bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30'
        : 'bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs font-medium border border-gray-600/30';
}

// Add Task Functions
function showAddTaskForm() {
    elements.addTaskForm.classList.remove('hidden');
    elements.taskText.focus();
    elements.addTaskBtn.disabled = true;
}

function hideAddTaskForm() {
    elements.addTaskForm.classList.add('hidden');
    elements.taskForm.reset();
    elements.addTaskBtn.disabled = false;
}

function handleAddTask(event) {
    event.preventDefault();
    
    const taskText = elements.taskText.value.trim();
    if (!taskText) {
        showNotification('Error!', 'Please enter a task description', false);
        return;
    }
    
    // Disable form during submission
    const submitBtn = elements.taskForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_text: taskText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success!', data.message, false);
            hideAddTaskForm();
            loadTasks();
            loadDailyStats();
        } else {
            showNotification('Error!', data.error, false);
        }
    })
    .catch(error => {
        showNotification('Error!', 'Failed to add task', false);
        console.error('Add task error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Work Timer Functions
function startWorkTimer() {
    if (!isWorkRunning) {
        isWorkRunning = true;
        isWorkPaused = false;
        workStartTime = Date.now() - totalWorkTime;
        
        // Start session on server
        fetch('/api/work-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'work' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                workSessionId = data.session_id;
            }
        });
        
        workTimer = setInterval(updateWorkTimer, 1000);
        updateWorkTimerButtons();
    }
}

function pauseWorkTimer() {
    if (isWorkRunning && !isWorkPaused) {
        isWorkPaused = true;
        workPauseTime = Date.now();
        clearInterval(workTimer);
        updateWorkTimerButtons();
    }
}

function stopWorkTimer() {
    if (isWorkRunning) {
        isWorkRunning = false;
        isWorkPaused = false;
        clearInterval(workTimer);
        
        // End session on server
        if (workSessionId) {
            fetch(`/api/work-session/${workSessionId}/end`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    workSessionId = null;
                    loadDailyStats();
                }
            });
        }
        
        updateWorkTimerButtons();
    }
}

function resetWorkTimer() {
    stopWorkTimer();
    totalWorkTime = 0;
    updateWorkTimerDisplay();
}

function updateWorkTimer() {
    if (!isWorkPaused) {
        totalWorkTime = Date.now() - workStartTime;
        updateWorkTimerDisplay();
    }
}

function updateWorkTimerDisplay() {
    const hours = Math.floor(totalWorkTime / 3600000);
    const minutes = Math.floor((totalWorkTime % 3600000) / 60000);
    const seconds = Math.floor((totalWorkTime % 60000) / 1000);
    
    elements.workTimer.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateWorkTimerButtons() {
    elements.workStart.disabled = isWorkRunning;
    elements.workPause.disabled = !isWorkRunning || isWorkPaused;
    elements.workStop.disabled = !isWorkRunning;
    elements.workReset.disabled = isWorkRunning;
}

// Pomodoro Timer Functions
function startPomodoroTimer() {
    if (!isPomodoroRunning) {
        isPomodoroRunning = true;
        isPomodoroPaused = false;
        pomodoroStartTime = Date.now() - (pomodoroTime - pomodoroTime);
        
        // Start session on server
        fetch('/api/work-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'pomodoro' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                pomodoroSessionId = data.session_id;
            }
        });
        
        pomodoroTimer = setInterval(updatePomodoroTimer, 1000);
        updatePomodoroTimerButtons();
        elements.pomodoroCard.classList.add('timer-active');
    }
}

function pausePomodoroTimer() {
    if (isPomodoroRunning && !isPomodoroPaused) {
        isPomodoroPaused = true;
        pomodoroPauseTime = Date.now();
        clearInterval(pomodoroTimer);
        updatePomodoroTimerButtons();
        elements.pomodoroCard.classList.remove('timer-active');
    }
}

function stopPomodoroTimer() {
    if (isPomodoroRunning) {
        isPomodoroRunning = false;
        isPomodoroPaused = false;
        clearInterval(pomodoroTimer);
        
        // End session on server
        if (pomodoroSessionId) {
            fetch(`/api/work-session/${pomodoroSessionId}/end`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    pomodoroSessionId = null;
                    loadDailyStats();
                }
            });
        }
        
        updatePomodoroTimerButtons();
        elements.pomodoroCard.classList.remove('timer-active');
    }
}

function resetPomodoroTimer() {
    stopPomodoroTimer();
    pomodoroPhase = 'work';
    pomodoroTime = parseInt(elements.pomodoroWorkTime.value) * 60 * 1000;
    breakTime = parseInt(elements.pomodoroBreakTime.value) * 60 * 1000;
    pomodoroStartTime = Date.now(); // Reset the start time
    updatePomodoroTimerDisplay();
    updatePomodoroPhaseDisplay();
}

function updatePomodoroTimer() {
    if (!isPomodoroPaused) {
        const elapsed = Date.now() - pomodoroStartTime;
        const remaining = pomodoroTime - elapsed;
        
        if (remaining <= 0) {
            // Timer finished
            if (pomodoroPhase === 'work') {
                // Switch to break
                pomodoroPhase = 'break';
                pomodoroTime = breakTime;
                pomodoroStartTime = Date.now();
                
                if (pomodoroSoundEnabled) {
                    playSound(elements.alarmSound);
                }
                showNotification('Pomodoro Work Session Complete!', 'Time for a break!', false);
                
                // Automatically start the break timer
                setTimeout(() => {
                    if (!isBreakRunning) {
                        startBreakTimer();
                    }
                }, 1000); // Start break timer after 1 second
            } else {
                // Break finished, switch back to work
                pomodoroPhase = 'work';
                pomodoroTime = parseInt(elements.pomodoroWorkTime.value) * 60 * 1000;
                pomodoroStartTime = Date.now();
                
                if (pomodoroSoundEnabled) {
                    // Play a louder sound for break completion
                    playSound(elements.alarmSound);
                    setTimeout(() => playSound(elements.alarmSound), 500);
                    setTimeout(() => playSound(elements.alarmSound), 1000);
                }
                showNotification('Break Time Complete!', 'Back to work!', false);
            }
            updatePomodoroPhaseDisplay();
        }
        
        updatePomodoroTimerDisplay();
    }
}

function updatePomodoroTimerDisplay() {
    if (isPomodoroRunning) {
        const elapsed = Date.now() - pomodoroStartTime;
        const remaining = Math.max(0, pomodoroTime - elapsed);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        elements.pomodoroTimer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        // Timer is not running, show the full time
        const minutes = Math.floor(pomodoroTime / 60000);
        const seconds = Math.floor((pomodoroTime % 60000) / 1000);
        
        elements.pomodoroTimer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updatePomodoroPhaseDisplay() {
    elements.pomodoroPhase.textContent = pomodoroPhase === 'work' ? 'Work Time' : 'Break Time';
}

function updatePomodoroTimerButtons() {
    elements.pomodoroStart.disabled = isPomodoroRunning;
    elements.pomodoroPause.disabled = !isPomodoroRunning || isPomodoroPaused;
    elements.pomodoroStop.disabled = !isPomodoroRunning;
    elements.pomodoroReset.disabled = isPomodoroRunning;
}

// Break Timer Functions
function startBreakTimer() {
    if (!isBreakRunning) {
        isBreakRunning = true;
        isBreakPaused = false;
        breakStartTime = Date.now() - totalBreakTime;
        
        // Start session on server
        fetch('/api/work-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'break' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                breakSessionId = data.session_id;
            }
        });
        
        breakTimer = setInterval(updateBreakTimer, 1000);
        updateBreakTimerButtons();
        elements.breakCard.classList.add('timer-active');
    }
}

function pauseBreakTimer() {
    if (isBreakRunning && !isBreakPaused) {
        isBreakPaused = true;
        breakPauseTime = Date.now();
        clearInterval(breakTimer);
        updateBreakTimerButtons();
        elements.breakCard.classList.remove('timer-active');
    }
}

function stopBreakTimer() {
    if (isBreakRunning) {
        isBreakRunning = false;
        isBreakPaused = false;
        clearInterval(breakTimer);
        
        // End session on server
        if (breakSessionId) {
            fetch(`/api/work-session/${breakSessionId}/end`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    breakSessionId = null;
                    loadDailyStats();
                }
            });
        }
        
        updateBreakTimerButtons();
        elements.breakCard.classList.remove('timer-active');
    }
}

function resetBreakTimer() {
    stopBreakTimer();
    totalBreakTime = 0;
    updateBreakTimerDisplay();
}

function updateBreakTimer() {
    if (!isBreakPaused) {
        totalBreakTime = Date.now() - breakStartTime;
        updateBreakTimerDisplay();
        
        // Check if break time is complete
        const breakDuration = parseInt(elements.breakDuration.value) * 60 * 1000;
        if (totalBreakTime >= breakDuration) {
            stopBreakTimer();
            if (breakSoundEnabled) {
                // Play a louder sound for break completion
                playSound(elements.breakSound);
                setTimeout(() => playSound(elements.breakSound), 500);
                setTimeout(() => playSound(elements.breakSound), 1000);
            }
            showNotification('Break Time Complete!', 'Time to get back to work!', false);
        }
    }
}

function updateBreakTimerDisplay() {
    const breakDuration = parseInt(elements.breakDuration.value) * 60 * 1000;
    const remaining = Math.max(0, breakDuration - totalBreakTime);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    elements.breakTimer.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateBreakTimerButtons() {
    elements.breakStart.disabled = isBreakRunning;
    elements.breakPause.disabled = !isBreakRunning || isBreakPaused;
    elements.breakStop.disabled = !isBreakRunning;
    elements.breakReset.disabled = isBreakRunning;
}

// Sound Functions
function playSound(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log('Audio play failed:', e));
}

// File Upload Functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        elements.selectedFileName.textContent = file.name;
        elements.uploadBtn.disabled = false;
    } else {
        elements.selectedFileName.textContent = 'No file selected';
        elements.uploadBtn.disabled = true;
    }
}

function uploadTasks() {
    const file = elements.taskFile.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    elements.uploadBtn.disabled = true;
    elements.uploadBtn.textContent = 'Uploading...';
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success!', data.message, false);
            loadTasks();
            elements.taskFile.value = '';
            elements.selectedFileName.textContent = 'No file selected';
        } else {
            showNotification('Error!', data.error, false);
        }
    })
    .catch(error => {
        showNotification('Error!', 'Failed to upload file', false);
        console.error('Upload error:', error);
    })
    .finally(() => {
        elements.uploadBtn.disabled = false;
        elements.uploadBtn.textContent = 'Upload Tasks';
    });
}

// Task Management Functions
function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            displayTasks(tasks);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

function displayTasks(tasks) {
    if (tasks.length === 0) {
        elements.tasksList.innerHTML = `
            <div class="text-center text-light-gray/60 py-8">
                <svg class="w-12 h-12 mx-auto mb-4 text-light-gray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p class="font-medium">No tasks uploaded yet. Please upload a file or add tasks manually to get started.</p>
            </div>
        `;
        return;
    }
    
    const tasksHTML = tasks.map(task => {
        // Youtube icon SVG
        const youtubeIcon = `<svg class='w-5 h-5 text-red-500 inline' fill='currentColor' viewBox='0 0 24 24'><path d='M23.498 6.186a2.994 2.994 0 0 0-2.107-2.12C19.204 3.5 12 3.5 12 3.5s-7.204 0-9.391.566A2.994 2.994 0 0 0 .502 6.186C0 8.373 0 12 0 12s0 3.627.502 5.814a2.994 2.994 0 0 0 2.107 2.12C4.796 20.5 12 20.5 12 20.5s7.204 0 9.391-.566a2.994 2.994 0 0 0 2.107-2.12C24 15.627 24 12 24 12s0-3.627-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>`;
        // Practice icon SVG (dumbbell)
        const practiceIcon = `<svg class='w-5 h-5 text-green-400 inline' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='1' y='9' width='4' height='6' rx='1' fill='currentColor' class='text-green-400'/><rect x='19' y='9' width='4' height='6' rx='1' fill='currentColor' class='text-green-400'/><rect x='5' y='11' width='14' height='2' rx='1' fill='currentColor' class='text-green-400'/></svg>`;
        // Dropdown for Youtube/Practice links
        const dropdown = (openDropdownTaskId === task.task_id) ? `
            <div class="mt-3 bg-deep-black/80 border border-vivid-orange/30 rounded-lg p-3 shadow-lg animate-fade-in">
                <div class="flex flex-col space-y-2">
                    ${task.youtube_link ? `<a href="${task.youtube_link}" target="_blank" rel="noopener noreferrer" class="flex items-center px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded transition-all" style="text-decoration:none;">${youtubeIcon}<span class='ml-2'>Youtube</span></a>` : ''}
                    ${task.practice_link ? `<a href="${task.practice_link}" target="_blank" rel="noopener noreferrer" class="flex items-center px-4 py-2 bg-green-600/80 hover:bg-green-700 text-white rounded transition-all" style="text-decoration:none;">${practiceIcon}<span class='ml-2'>Practice</span></a>` : ''}
                    ${( !task.youtube_link && !task.practice_link ) ? `<span class='text-light-gray/60 text-sm'>No links available</span>` : ''}
                </div>
            </div>
        ` : '';
        return `
        <div class="bg-deep-black/40 rounded-lg p-4 border border-vivid-orange/10 hover:border-vivid-orange/30 transition-all duration-200 mb-2">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" 
                           id="task-${task.task_id}" 
                           class="w-5 h-5 text-vivid-orange bg-deep-black border-vivid-orange/30 rounded focus:ring-vivid-orange/50 focus:ring-2"
                           ${task.completed ? 'checked' : ''}
                           onchange="toggleTask('${task.task_id}', this.checked)">
                    <div class="flex-1">
                        <span class="text-light-gray font-medium cursor-pointer ${task.completed ? 'line-through text-light-gray/50' : ''}" onclick="toggleDropdown('${task.task_id}')">
                            Day ${task.day_number}: ${task.task_text}
                        </span>
                        <p class="text-sm text-light-gray/60 font-medium">
                            ${task.completed ? `Completed on ${task.completed_date}` : 'Pending'}
                        </p>
                        ${dropdown}
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs rounded-full font-medium ${task.completed ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-vivid-orange/20 text-vivid-orange border border-vivid-orange/30'}">
                        ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                    <button onclick="editTaskPrompt('${task.task_id}', '${encodeURIComponent(task.task_text)}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="Edit task">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 00-1.414-1.414L9 11z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteTask('${task.task_id}')" class="text-red-400 hover:text-red-300 transition-colors" title="Delete task">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.tasksList.innerHTML = tasksHTML;
}

function toggleTask(taskId, completed) {
    fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: completed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks();
            loadDailyStats();
        }
    })
    .catch(error => {
        console.error('Error toggling task:', error);
    });
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success!', data.message, false);
            loadTasks();
            loadDailyStats();
        } else {
            showNotification('Error!', data.error, false);
        }
    })
    .catch(error => {
        showNotification('Error!', 'Failed to delete task', false);
        console.error('Delete task error:', error);
    });
}

window.editTaskPrompt = function(taskId, encodedText) {
    const currentText = decodeURIComponent(encodedText);
    const newText = prompt('Edit task description:', currentText);
    if (newText === null) return; // Cancelled
    const trimmed = newText.trim();
    if (!trimmed) {
        showNotification('Error!', 'Task description cannot be empty.', false);
        return;
    }
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_text: trimmed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success!', data.message, false);
            loadTasks();
        } else {
            showNotification('Error!', data.error || 'Failed to update task', false);
        }
    })
    .catch(error => {
        showNotification('Error!', 'Failed to update task', false);
        console.error('Edit task error:', error);
    });
}

// Stats Functions
function loadDailyStats() {
    fetch('/api/daily-stats')
        .then(response => response.json())
        .then(stats => {
            updateStatsDisplay(stats);
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
}

function updateStatsDisplay(stats) {
    // Convert seconds to hours and minutes
    const hours = Math.floor(stats.total_work_time / 3600);
    const minutes = Math.floor((stats.total_work_time % 3600) / 60);
    
    elements.totalWorkTime.textContent = `${hours}h ${minutes}m`;
    elements.tasksCompleted.textContent = stats.tasks_completed;
    elements.currentStreak.textContent = `${stats.streak_count} days`;
    elements.streakCount.textContent = stats.streak_count;
}

// Missed Days Functions
function checkMissedDays() {
    fetch('/api/missed-days')
        .then(response => response.json())
        .then(missedDays => {
            displayMissedDays(missedDays);
        })
        .catch(error => {
            console.error('Error checking missed days:', error);
        });
}

function displayMissedDays(missedDays) {
    if (missedDays.length === 0) {
        elements.missedDaysSection.classList.add('hidden');
        return;
    }
    
    elements.missedDaysSection.classList.remove('hidden');
    
    const missedDaysHTML = missedDays.map(day => `
        <div class="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
            <h3 class="text-red-400 font-semibold mb-2 font-poppins">Missed: ${new Date(day.date).toLocaleDateString()}</h3>
            <div class="space-y-2">
                ${day.tasks.map(task => `
                    <div class="flex items-center space-x-2 text-light-gray/80 font-medium">
                        <span class="text-red-400">•</span>
                        <span>Day ${task.day_number}: ${task.task_text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    elements.missedDaysList.innerHTML = missedDaysHTML;
}

// Notification Functions
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === 'granted';
        });
    }
}

function showNotification(title, message, playSound = false) {
    // Browser notification
    if (notificationPermission && 'Notification' in window) {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    }
    
    // In-app notification
    const notification = document.createElement('div');
    notification.className = 'notification bg-vivid-orange/95 text-white p-4 rounded-lg shadow-lg max-w-sm border border-vivid-orange/30';
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h4 class="font-semibold font-poppins">${title}</h4>
                <p class="text-sm opacity-90 font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    elements.notificationContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Play sound if requested
    if (playSound && elements.alarmSound) {
        playSound(elements.alarmSound);
    }
}

// Idle Detection Functions
function setupIdleDetection() {
    // Check for idle every 30 seconds
    setInterval(checkIdle, 30000);
}

function updateActivity() {
    lastActivity = Date.now();
}

function checkIdle() {
    const idleThreshold = 5 * 60 * 1000; // 5 minutes
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    if (timeSinceLastActivity > idleThreshold && (isWorkRunning || isPomodoroRunning || isBreakRunning)) {
        showNotification('Inactivity Detected!', 'You\'ve been inactive for 5 minutes. Consider taking a break or resuming work.', true);
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, could trigger notifications
        if (isWorkRunning || isPomodoroRunning || isBreakRunning) {
            showNotification('Work in Progress', 'Your timer is still running in the background.', false);
        }
    }
});

// Handle beforeunload to save state
window.addEventListener('beforeunload', function() {
    if (isWorkRunning || isPomodoroRunning || isBreakRunning) {
        // Save timer state to localStorage
        localStorage.setItem('workTimerState', JSON.stringify({
            isRunning: isWorkRunning,
            isPaused: isWorkPaused,
            totalTime: totalWorkTime,
            startTime: workStartTime
        }));
        
        localStorage.setItem('pomodoroTimerState', JSON.stringify({
            isRunning: isPomodoroRunning,
            isPaused: isPomodoroPaused,
            phase: pomodoroPhase,
            time: pomodoroTime,
            startTime: pomodoroStartTime
        }));
        
        localStorage.setItem('breakTimerState', JSON.stringify({
            isRunning: isBreakRunning,
            isPaused: isBreakPaused,
            totalTime: totalBreakTime,
            startTime: breakStartTime
        }));
    }
});

function clearAllTasks() {
    if (!confirm('Are you sure you want to clear all tasks?')) {
        return;
    }
    fetch('/api/tasks/clear', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success!', data.message, false);
            loadTasks();
            loadDailyStats && loadDailyStats();
        } else {
            showNotification('Error!', data.error || 'Failed to clear tasks', false);
        }
    })
    .catch(error => {
        showNotification('Error!', 'Failed to clear tasks', false);
        console.error('Clear tasks error:', error);
    });
}

// Music Player Functions
function loadMusicSettings() {
    const settings = JSON.parse(localStorage.getItem('musicSettings') || '{}');
    if (settings.musicEnabled !== undefined) musicEnabled = settings.musicEnabled;
    if (settings.currentMusic) currentMusic = settings.currentMusic;
    elements.musicSelect.value = currentMusic;
    updateMusicToggleButton();
    updateMusicPlayback();
}

function saveMusicSettings() {
    localStorage.setItem('musicSettings', JSON.stringify({ musicEnabled, currentMusic }));
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    updateMusicToggleButton();
    updateMusicPlayback();
    saveMusicSettings();
}

function selectMusic() {
    currentMusic = elements.musicSelect.value;
    updateMusicPlayback();
    saveMusicSettings();
}

function updateMusicToggleButton() {
    elements.toggleMusic.textContent = musicEnabled ? 'ON' : 'OFF';
    elements.toggleMusic.className = musicEnabled
        ? 'bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/30'
        : 'bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs font-medium border border-gray-600/30';
}

function updateMusicPlayback() {
    // Pause all music
    elements.music1.pause();
    elements.music2.pause();
    elements.music3.pause();
    elements.music4.pause();
    elements.music1.currentTime = 0;
    elements.music2.currentTime = 0;
    elements.music3.currentTime = 0;
    elements.music4.currentTime = 0;
    if (musicEnabled) {
        const audio = elements[currentMusic];
        if (audio) {
            audio.play().catch(e => console.log('Music play failed:', e));
        }
    }
}

window.toggleDropdown = function(taskId) {
    if (openDropdownTaskId === taskId) {
        openDropdownTaskId = null;
    } else {
        openDropdownTaskId = taskId;
    }
    loadTasks();
} 