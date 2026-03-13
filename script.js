const STORAGE_KEY = 'todo.tasks.v1';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const EVENTS_KEY = 'todo.events.v1';
let events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');

let activeYear = new Date().getFullYear();
let activeMonth = new Date().getMonth();

// Task Management
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateCounts();
    syncEvents();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value && input.value.trim();
    if (!text) return;
    const task = { id: Date.now(), text, done: false };
    tasks.unshift(task);
    save();
    input.value = '';
    renderTasks();
}

function toggleDone(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save();
    renderTasks();
}

function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    if (!tasks.length) {
        list.innerHTML = '<li class="task-item">No tasks yet</li>';
        return;
    }
    tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div>
                <div class="text" style="text-decoration:${t.done ? 'line-through' : ''}">${escapeHtml(t.text)}</div>
                <div class="meta">Added: ${new Date(t.id).toLocaleString()}</div>
            </div>
            <div>
                <button onclick="toggleDone(${t.id})">${t.done ? '↺' : '✓'}</button>
                <button onclick="removeTask(${t.id})">✕</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Calendar Logic
function renderCalendar(year, month) {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('monthLabel');
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const totalDays = last.getDate();
    
    label.textContent = first.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    grid.innerHTML = '';

    // Fill previous month days
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const el = document.createElement('div');
        el.className = 'calendar-day inactive';
        el.innerHTML = `<div class="date">${prevLast - i}</div>`;
        grid.appendChild(el);
    }

    // Fill current month days
    for (let d = 1; d <= totalDays; d++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        const date = new Date(year, month, d);
        if (date.toDateString() === new Date().toDateString()) el.classList.add('today');
        
        el.innerHTML = `<div class="date">${d}</div><div class="events"></div>`;
        
        // Add click listener to add events
        el.addEventListener('click', () => {
            const text = prompt('Add event for ' + date.toDateString());
            if (text) {
                events.push({ id: Date.now(), date: date.toISOString().slice(0, 10), text });
                localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
                renderCalendar(activeYear, activeMonth);
            }
        });
        grid.appendChild(el);
    }
}

function updateCounts() {
    document.getElementById('pendingCount').textContent = tasks.filter(t => !t.done).length;
    document.getElementById('completedCount').textContent = tasks.filter(t => t.done).length;
}

function syncEvents() {
    const evList = document.getElementById('eventsList');
    evList.innerHTML = '';
    tasks.slice(0, 4).forEach(t => {
        const li = document.createElement('li');
        const time = new Date(t.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        li.innerHTML = `<span class="time">${time}</span><span class="ev">${escapeHtml(t.text)}</span>`;
        evList.appendChild(li);
    });
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[c]);
}

// Nav Listeners
document.getElementById('prevMonth').addEventListener('click', () => {
    activeMonth--; if (activeMonth < 0) { activeMonth = 11; activeYear--; }
    renderCalendar(activeYear, activeMonth);
});
document.getElementById('nextMonth').addEventListener('click', () => {
    activeMonth++; if (activeMonth > 11) { activeMonth = 0; activeYear++; }
    renderCalendar(activeYear, activeMonth);
});

// Init
renderTasks();
renderCalendar(activeYear, activeMonth);
updateCounts();
syncEvents();