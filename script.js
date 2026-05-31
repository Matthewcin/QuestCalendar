const habitSelect = document.getElementById('habitSelect');
const newHabitInput = document.getElementById('newHabitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const deleteHabitBtn = document.getElementById('deleteHabitBtn');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const daysGrid = document.getElementById('daysGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let habitsData = JSON.parse(localStorage.getItem('habitsData')) || {};

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function saveToLocalStorage() {
    localStorage.setItem('habitsData', JSON.stringify(habitsData));
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
    } else {
        habitsData[habit].push(dateKey);
        element.classList.add('completed');
    }

    saveToLocalStorage();
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
