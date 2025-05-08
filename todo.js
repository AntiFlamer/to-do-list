document.addEventListener('DOMContentLoaded', () => {
    // DOM elementleri
    const taskInput = document.getElementById('taskInput');
    const reminderTimeInput = document.getElementById('reminderTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Tema değiştirme
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Bildirim izinlerini kontrol et
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Görev eklemeyi idare etme
    const handleAddTask = () => {
        const taskText = taskInput.value.trim();
        const reminderTime = reminderTimeInput.value;
        if (taskText) {
            addTask(taskText, reminderTime);
            taskInput.value = '';
            reminderTimeInput.value = '';
            taskInput.focus();
        }
    };

    // Event listeners
    addTaskBtn.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    // Görev ekleme fonksiyonu
    function addTask(taskText, reminderTime = null, isCompleted = false, isPinned = false) {
        const li = document.createElement('li');
        li.className = `${isCompleted ? 'completed' : ''} ${isPinned ? 'pinned' : ''}`;
        li.innerHTML = `
            <span class="task-text">${taskText}</span>
            <div class="task-actions">
                <button class="pin-btn"><i class="fas ${isPinned ? 'fa-thumbtack' : 'fa-thumbtack fa-rotate-90'}"></i></button>
                <button class="complete-btn"><i class="far ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `; // Sabitlediğimiz task için ikon değişikliği

        if (isPinned) {
            taskList.prepend(li); // Sabitlenmiş görevleri en başa ekle
        } else {
            taskList.appendChild(li); // Normal görevleri sona ekle
        }

        // Hatırlatıcı ayarla
        if (reminderTime) {
            const reminderDate = new Date(reminderTime);
            const now = new Date();
            const timeUntilReminder = reminderDate - now;

            if (timeUntilReminder > 0) {
                setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification('Hatırlatma', {
                            body: `Görev zamanı: ${taskText}`,
                        });
                    } else {
                        alert(`Hatırlatma: ${taskText}`);
                    }
                }, timeUntilReminder);
            }
        }

        // Sabitleme butonu
        li.querySelector('.pin-btn').addEventListener('click', () => {
            const isCurrentlyPinned = li.classList.contains('pinned');
            li.classList.toggle('pinned');
            const icon = li.querySelector('.pin-btn i');
            if (isCurrentlyPinned) {
                icon.classList.remove('fa-thumbtack');
                icon.classList.add('fa-thumbtack', 'fa-rotate-90');
                taskList.appendChild(li); // Sabitlenmeyi kaldırınca sona taşı
            } else {
                icon.classList.remove('fa-thumbtack', 'fa-rotate-90');
                icon.classList.add('fa-thumbtack');
                taskList.prepend(li); // Sabitlenince en üste taşı
            }
            saveTasks(); // Güncellenen listeyi kaydet
        });

        // Tamamlama butonu
        li.querySelector('.complete-btn').addEventListener('click', () => {
            li.classList.toggle('completed');
            const icon = li.querySelector('.complete-btn i');
            icon.classList.toggle('fa-circle');
            icon.classList.toggle('fa-check-circle');
            saveTasks();
        });

        // Silme butonu
        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.classList.add('fade-out');
            setTimeout(() => {
                li.remove();
                saveTasks();
            }, 300);
        });
    }

    // Görevleri kaydetme
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#taskList li').forEach(task => {
            tasks.push({
                text: task.querySelector('.task-text').textContent,
                completed: task.classList.contains('completed'),
                pinned: taskList.firstChild === task, // Görev en başta mı?
                reminderTime: task.dataset.reminderTime || null
            });
        });
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('LocalStorage kayıt hatası:', e);
        }
    }

    // Görevleri yükleme
    function loadTasks() {
        try {
            const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            savedTasks.forEach(task => {
                addTask(task.text, task.reminderTime, task.completed, task.pinned);
            });
        } catch (e) {
            console.error('LocalStorage okuma hatası:', e);
            localStorage.removeItem('tasks');
        }
    }

    // Sayfa yüklendiğinde görevleri yükle
    loadTasks();
});