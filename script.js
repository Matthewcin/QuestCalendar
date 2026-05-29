const habitSelect = document.getElementById('habitSelect');
const newHabitInput = document.getElementById('newHabitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const deleteHabitBtn = document.getElementById('deleteHabitBtn');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const daysGrid = document.getElementById('daysGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const levelDisplay = document.getElementById('levelDisplay');
const xpDisplay = document.getElementById('xpDisplay');
const xpBar = document.getElementById('xpBar');
const badgesGrid = document.getElementById('badgesGrid');

let currentDate = new Date();
let habitsData = JSON.parse(localStorage.getItem('habitsData')) || {};
let userStats = JSON.parse(localStorage.getItem('userStats')) || { xp: 0, unlockedBadges: [] };

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const badges = [
    { id: 'b1', name: 'Semilla', icon: '🌱', check: () => userStats.xp >= 10 },
    { id: 'b2', name: 'Constante', icon: '🔥', check: () => userStats.xp >= 50 },
    { id: 'b3', name: 'Estrella', icon: '⭐', check: () => calculateLevel() >= 2 },
    { id: 'b4', name: 'Imparable', icon: '🚀', check: () => userStats.xp >= 200 },
    { id: 'b5', name: 'Maestro', icon: '👑', check: () => userStats.xp >= 500 }
];

function saveToLocalStorage() {
    localStorage.setItem('habitsData', JSON.stringify(habitsData));
    localStorage.setItem('userStats', JSON.stringify(userStats));
}

function calculateLevel() {
    return Math.floor(userStats.xp / 100) + 1;
}

function updateStatsUI() {
    const level = calculateLevel();
    const xpInCurrentLevel = userStats.xp % 100;
    
    levelDisplay.textContent = `Nivel ${level}`;
    xpDisplay.textContent = `${xpInCurrentLevel} / 100 XP`;
    xpBar.style.width = `${xpInCurrentLevel}%`;
    
    checkBadges();
    renderBadges();
}

function updateXP(amount) {
    userStats.xp += amount;
    if (userStats.xp < 0) userStats.xp = 0;
    saveToLocalStorage();
    updateStatsUI();
}

function checkBadges() {
    badges.forEach(badge => {
        if (badge.check() && !userStats.unlockedBadges.includes(badge.id)) {
            userStats.unlockedBadges.push(badge.id);
            saveToLocalStorage();
        }
    });
}

function renderBadges() {
    badgesGrid.innerHTML = '';
    badges.forEach(badge => {
        const badgeDiv = document.createElement('div');
        badgeDiv.classList.add('badge');
        if (userStats.unlockedBadges.includes(badge.id)) {
            badgeDiv.classList.add('unlocked');
        }
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('badge-icon');
        iconSpan.textContent = badge.icon;
        
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('badge-name');
        nameSpan.textContent = badge.name;
        
        badgeDiv.appendChild(iconSpan);
        badgeDiv.appendChild(nameSpan);
        badgesGrid.appendChild(badgeDiv);
    });
}

function updateHabitSelect() {
    habitSelect.innerHTML = '';
    const habits = Object.keys(habitsData);

    if (habits.length === 0) {
        const option = document.createElement('option');
        option.text = 'No hay hábitos. ¡Agrega uno!';
        option.value = '';
        habitSelect.appendChild(option);
        habitSelect.disabled = true;
        deleteHabitBtn.disabled = true;
        daysGrid.innerHTML = '';
        monthYearDisplay.textContent = '---';
        return;
    }

    habitSelect.disabled = false;
    deleteHabitBtn.disabled = false;

    habits.forEach(habit => {
        const option = document.createElement('option');
        option.value = habit;
        option.text = habit;
        habitSelect.appendChild(option);
    });

    renderCalendar();
}

function renderCalendar() {
    daysGrid.innerHTML = '';
    const currentHabit = habitSelect.value;

    if (!currentHabit) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = `${months[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        daysGrid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = i;

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (habitsData[currentHabit] && habitsData[currentHabit].includes(dateKey)) {
            dayDiv.classList.add('completed');
        }

        dayDiv.addEventListener('click', () => {
            toggleHabitDay(currentHabit, dateKey, dayDiv);
        });

        daysGrid.appendChild(dayDiv);
    }
}

function toggleHabitDay(habit, dateKey, element) {
    if (!habitsData[habit]) {
        habitsData[habit] = [];
    }

    const index = habitsData[habit].indexOf(dateKey);

    if (index > -1) {
        habitsData[habit].splice(index, 1);
        element.classList.remove('completed');
        updateXP(-10);
    } else {
        habitsData[habit].push(dateKey);
        element.classList.add('completed');
        updateXP(10);
    }
}

addHabitBtn.addEventListener('click', () => {
    const newHabit = newHabitInput.value.trim();
    if (newHabit && !habitsData[newHabit]) {
        habitsData[newHabit] = [];
        newHabitInput.value = '';
        saveToLocalStorage();
        updateHabitSelect();
        habitSelect.value = newHabit;
        renderCalendar();
    }
});

deleteHabitBtn.addEventListener('click', () => {
    const currentHabit = habitSelect.value;
    if (currentHabit && confirm(`¿Seguro que quieres eliminar el hábito "${currentHabit}" y todo su progreso?`)) {
        delete habitsData[currentHabit];
        saveToLocalStorage();
        updateHabitSelect();
    }
});

habitSelect.addEventListener('change', renderCalendar);

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

updateHabitSelect();
updateStatsUI();
