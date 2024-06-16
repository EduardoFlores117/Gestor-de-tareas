$(document).ready(function() {
    const taskList = $('#task-list');
    const searchResults = $('#search-results');
    const messageDiv = $('#message');

    function showMessage(type, text) {
        messageDiv.html(`<div class="alert alert-${type}" role="alert">${text}</div>`);
        setTimeout(() => messageDiv.html(''), 3000);
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToList(task, taskList));
    }

    function saveTask(task) {
        console.log('Guardando tarea:', task); // Log para verificar que la tarea se está guardando
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTaskToList(task, listElement) {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = task.endDate < today;
        const isCompleted = task.completed;
        
        let taskClass = 'task-pending';
        let taskTextClass = '';
        let additionalInfo = '';
        if (isOverdue) {
            taskClass = 'task-overdue';
            taskTextClass = 'task-expired';
            additionalInfo = ' (tarea expirada, sin cambios posibles)';
        }
        if (isCompleted) taskClass = 'task-completed';

        const taskItem = $(`
            <li class="list-group-item ${taskClass}" data-id="${task.id}">
                <div class="${taskTextClass}">
                    <strong>${task.name}</strong><br>
                    <small>Inicio: ${task.startDate} | Fin: ${task.endDate} | Responsable: ${task.responsible}</small>
                </div>
                <div>
                    ${!isOverdue ? `<button class="btn btn-success btn-sm mark-complete">${isCompleted ? 'Desmarcar' : 'Marcar'} como Resuelta</button>` : ''}
                    <button class="btn btn-danger btn-sm delete-task">Eliminar${additionalInfo}</button>
                </div>
            </li>
        `);
        listElement.append(taskItem);
    }

    $('#task-form').submit(function(event) {
        event.preventDefault();
        const name = $('#task-name').val();
        const startDate = $('#task-start-date').val();
        const endDate = $('#task-end-date').val();
        const responsible = $('#task-responsible').val();

        console.log('Datos del formulario:', { name, startDate, endDate, responsible }); // Log para verificar los datos del formulario

        if (endDate < startDate) {
            showMessage('danger', 'La fecha de fin no puede ser menor a la fecha de inicio.');
            return;
        }

        const task = {
            id: Date.now(),
            name,
            startDate,
            endDate,
            responsible,
            completed: false
        };

        saveTask(task);
        addTaskToList(task, taskList);

        $('#task-form')[0].reset();
        showMessage('success', 'Tarea creada exitosamente.');
    });

    taskList.on('click', '.mark-complete', function() {
        const taskId = $(this).closest('li').data('id');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            const confirmAction = task.completed 
                ? confirm('¿Está seguro de que desea desmarcar la tarea entregada?')
                : true;

            if (confirmAction) {
                task.completed = !task.completed;
                updateTasks(tasks);
                location.reload();
            }
        }
    });

    taskList.on('click', '.delete-task', function() {
        const taskId = $(this).closest('li').data('id');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const updatedTasks = tasks.filter(task => task.id !== taskId);

        if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
            updateTasks(updatedTasks);
            location.reload();
        }
    });

    function searchTasks(searchTerm) {
        searchResults.empty(); // Clear previous search results
        if (searchTerm) {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchTerm));
            filteredTasks.forEach(task => addTaskToList(task, searchResults));
        }
    }

    $('#task-search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        searchTasks(searchTerm);
    });

    $('#search-button').on('click', function() {
        const searchTerm = $('#task-search').val().toLowerCase();
        searchTasks(searchTerm);
    });

    loadTasks();
});
