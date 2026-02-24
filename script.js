const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function save(){
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render(){
  list.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' completed' : '');

    // checkbox to mark complete
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!t.completed;
    checkbox.addEventListener('change', () => {
      tasks[i].completed = checkbox.checked;
      save();
      render();
    });

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = t.text;
    // clicking text toggles completion
    text.addEventListener('click', () => {
      tasks[i].completed = !tasks[i].completed;
      save();
      render();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(i,1);
      save();
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) return;
  tasks.push({text: val, completed: false});
  input.value = '';
  save();
  render();
});

render();
