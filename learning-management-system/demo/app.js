const { createApp } = Vue;

createApp({
    data() {
        return {
            isLoggedIn: false,
            currentView: 'dashboard',
            currentUser: null,
            loginForm: {
                email: '',
                password: ''
            },
            
            // Demo users
            users: {
                'student@lms.com': {
                    password: 'student123',
                    name: 'Александр Иванов',
                    role: 'Студент',
                    id: 1
                },
                'instructor@lms.com': {
                    password: 'instructor123',
                    name: 'Др. Мария Петрова',
                    role: 'Преподаватель',
                    id: 2
                }
            },
            
            // Course data
            courses: [
                {
                    id: 1,
                    title: 'Основы JavaScript',
                    description: 'Изучите основы программирования на JavaScript',
                    progress: 75,
                    lessons: [
                        {
                            id: 1,
                            title: 'Введение в JavaScript',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            duration: 600
                        }
                    ]
                },
                {
                    id: 2,
                    title: 'Разработка на React',
                    description: 'Создавайте современные веб-приложения с React',
                    progress: 45,
                    lessons: [
                        {
                            id: 2,
                            title: 'Компоненты React',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            duration: 720
                        }
                    ]
                },
                {
                    id: 3,
                    title: 'Backend на Node.js',
                    description: 'Серверная разработка с Node.js',
                    progress: 20,
                    lessons: [
                        {
                            id: 3,
                            title: 'Основы Express.js',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            duration: 540
                        }
                    ]
                }
            ],
            
            // Quiz data
            quizzes: {
                1: {
                    title: 'Тест по основам JavaScript',
                    questions: [
                        {
                            question: 'Какой правильный способ объявления переменной в JavaScript?',
                            answers: [
                                { text: 'var myVar = 5;', correct: true },
                                { text: 'variable myVar = 5;', correct: false },
                                { text: 'v myVar = 5;', correct: false },
                                { text: 'declare myVar = 5;', correct: false }
                            ],
                            explanation: 'В JavaScript переменные объявляются с помощью ключевых слов var, let или const.'
                        },
                        {
                            question: 'Какой метод используется для добавления элемента в конец массива?',
                            answers: [
                                { text: 'append()', correct: false },
                                { text: 'push()', correct: true },
                                { text: 'add()', correct: false },
                                { text: 'insert()', correct: false }
                            ],
                            explanation: 'Метод push() добавляет один или несколько элементов в конец массива.'
                        }
                    ]
                }
            },
            
            // Current states
            selectedCourse: null,
            currentLesson: null,
            currentQuiz: null,
            currentQuestionIndex: 0,
            selectedAnswer: null,
            showResults: false,
            quizCompleted: false,
            quizStarted: false,
            correctAnswers: 0,
            lessonProgress: 0,
            bookmarks: [],
            
            // User stats
            userStats: {
                coursesEnrolled: 3,
                lessonsCompleted: 12,
                certificatesEarned: 2,
                studyHours: 45
            },
            
            recentActivity: [
                { id: 1, action: 'Завершил урок', course: 'Основы JavaScript', time: '2 часа назад' },
                { id: 2, action: 'Начал тест', course: 'Разработка на React', time: '1 день назад' },
                { id: 3, action: 'Получил сертификат', course: 'HTML и CSS', time: '3 дня назад' }
            ],
            
            achievements: [
                { id: 1, icon: '🏆', title: 'Первый курс завершен' },
                { id: 2, icon: '🔥', title: '7-дневная серия обучения' },
                { id: 3, icon: '⭐', title: 'Мастер тестов' }
            ],
            
            certificates: [
                {
                    id: 'CERT-001',
                    courseName: 'Основы JavaScript',
                    completedDate: '15.01.2024',
                    score: 95
                },
                {
                    id: 'CERT-002',
                    courseName: 'Основы HTML и CSS',
                    completedDate: '10.01.2024',
                    score: 88
                }
            ],
            
            // New features data
            upcomingWebinars: [
                {
                    id: 1,
                    title: 'Введение в Vue.js 3',
                    instructor: 'Др. Мария Петрова',
                    date: '25.01.2024',
                    time: '14:00',
                    zoomLink: 'https://zoom.us/j/123456789'
                },
                {
                    id: 2,
                    title: 'Лучшие практики React',
                    instructor: 'Александр Смирнов',
                    date: '27.01.2024',
                    time: '16:00',
                    zoomLink: 'https://zoom.us/j/987654321'
                }
            ],
            
            weeklyAssignments: [
                {
                    id: 1,
                    title: 'Проект: То-до приложение',
                    course: 'Основы JavaScript',
                    dueDate: 'До 26.01',
                    urgent: true
                },
                {
                    id: 2,
                    title: 'Тест по компонентам',
                    course: 'Разработка на React',
                    dueDate: 'До 30.01',
                    urgent: false
                }
            ],
            
            forumTopics: [
                {
                    id: 1,
                    title: 'Как лучше изучать JavaScript?',
                    author: 'Александр Иванов',
                    date: '20.01.2024',
                    replies: 15,
                    views: 234
                },
                {
                    id: 2,
                    title: 'Проблемы с асинхронным кодом',
                    author: 'Мария Козлова',
                    date: '22.01.2024',
                    replies: 8,
                    views: 156
                },
                {
                    id: 3,
                    title: 'Рекомендации по React хукам',
                    author: 'Дмитрий Петров',
                    date: '23.01.2024',
                    replies: 12,
                    views: 189
                }
            ],
            
            libraryResources: [
                {
                    id: 1,
                    title: 'JavaScript: Полное руководство',
                    type: 'PDF книга',
                    author: 'Дэвид Фланаган',
                    description: 'Полное руководство по JavaScript для начинающих и профессионалов',
                    icon: '📚',
                    category: 'javascript'
                },
                {
                    id: 2,
                    title: 'React Паттерны и лучшие практики',
                    type: 'Видео курс',
                    author: 'Макс Шварцмюллер',
                    description: 'Продвинутые паттерны и техники разработки на React',
                    icon: '🎥',
                    category: 'react'
                },
                {
                    id: 3,
                    title: 'Node.js Архитектура приложений',
                    type: 'Статья',
                    author: 'Андрей Ковалев',
                    description: 'Лучшие практики построения скалируемых Node.js приложений',
                    icon: '📝',
                    category: 'nodejs'
                },
                {
                    id: 4,
                    title: 'CSS Grid и Flexbox шпаргалка',
                    type: 'Шпаргалка',
                    author: 'CSS-Tricks',
                    description: 'Полная шпаргалка по современным CSS лайаутам',
                    icon: '📋',
                    category: 'css'
                }
            ],
            
            notifications: [
                {
                    id: 1,
                    title: 'Новый урок доступен',
                    message: 'Урок "Асинхронность в JavaScript" теперь доступен',
                    time: '10 мин назад',
                    read: false
                },
                {
                    id: 2,
                    title: 'Напоминание о вебинаре',
                    message: 'Вебинар "Введение в Vue.js 3" начнется через 2 часа',
                    time: '2 часа назад',
                    read: false
                },
                {
                    id: 3,
                    title: 'Оценка за тест',
                    message: 'Вы получили 95% за тест по JavaScript',
                    time: '1 день назад',
                    read: true
                }
            ],
            
            // UI states
            showNotifications: false,
            newTopicTitle: '',
            librarySearch: '',
            
            // Admin panel data
            adminTab: 'courses',
            adminStats: {
                totalStudents: 156,
                activeCourses: 12,
                completionRate: 78,
                avgScore: 85
            },
            
            newCourse: {
                title: '',
                description: ''
            },
            
            studentsList: [
                {
                    id: 1,
                    name: 'Александр Иванов',
                    enrolledCourses: 3,
                    overallProgress: 75,
                    lastActivity: '2 часа назад'
                },
                {
                    id: 2,
                    name: 'Мария Козлова',
                    enrolledCourses: 2,
                    overallProgress: 92,
                    lastActivity: '1 день назад'
                }
            ],
            
            topStudents: [
                { id: 2, name: 'Мария Козлова', overallProgress: 92, rank: 1 },
                { id: 1, name: 'Александр Иванов', overallProgress: 75, rank: 2 }
            ],
            
            adminSettings: {
                emailNotifications: true,
                pushNotifications: false,
                weeklyReports: true
            },
            filteredLibraryResources: []
        }
    },
    
    computed: {
        currentQuestion() {
            if (!this.currentQuiz) return null;
            return this.currentQuiz.questions[this.currentQuestionIndex];
        },
        
        isLastQuestion() {
            if (!this.currentQuiz) return false;
            return this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        },
        
        quizScore() {
            if (!this.currentQuiz) return 0;
            return Math.round((this.correctAnswers / this.currentQuiz.questions.length) * 100);
        },
        
        overallProgress() {
            const total = this.courses.reduce((sum, course) => sum + course.progress, 0);
            return Math.round(total / this.courses.length);
        },
        
        learningStreak() {
            return 12;
        },
        
        unreadNotifications() {
            return this.notifications.filter(n => !n.read).length;
        },
        
        filteredLibraryResources() {
            if (!this.librarySearch) {
                return this.libraryResources;
            }
            return this.libraryResources.filter(resource => 
                resource.title.toLowerCase().includes(this.librarySearch.toLowerCase()) ||
                resource.description.toLowerCase().includes(this.librarySearch.toLowerCase()) ||
                resource.category.toLowerCase().includes(this.librarySearch.toLowerCase())
            );
        }
    },
    
    methods: {
        quickLogin(type) {
            if (type === 'student') {
                this.loginForm.email = 'student@lms.com';
                this.loginForm.password = 'student123';
            } else {
                this.loginForm.email = 'instructor@lms.com';
                this.loginForm.password = 'instructor123';
            }
            this.login();
        },
        
        login() {
            const user = this.users[this.loginForm.email];
            if (user && user.password === this.loginForm.password) {
                this.currentUser = user;
                this.isLoggedIn = true;
                this.currentView = 'dashboard';
            } else {
                alert('Неверные данные для входа');
            }
        },
        
        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            this.loginForm = { email: '', password: '' };
        },
        
        openCourse(course) {
            this.selectedCourse = course;
            this.currentLesson = course.lessons[0];
            this.currentView = 'course-content';
            this.loadBookmarks();
        },
        
        updateProgress(event) {
            const video = event.target;
            if (video.duration > 0) {
                this.lessonProgress = (video.currentTime / video.duration) * 100;
            }
        },
        
        markLessonComplete() {
            this.lessonProgress = 100;
            if (this.selectedCourse) {
                this.selectedCourse.progress = Math.min(this.selectedCourse.progress + 10, 100);
            }
        },
        
        changeSpeed(event) {
            const video = document.querySelector('.video-player');
            if (video) {
                video.playbackRate = parseFloat(event.target.value);
            }
        },
        
        addBookmark() {
            const video = document.querySelector('.video-player');
            if (video) {
                const currentTime = video.currentTime;
                const note = prompt('Добавьте заметку к закладке:') || 'Закладка';
                
                this.bookmarks.push({
                    id: Date.now(),
                    time: currentTime,
                    note: note
                });
                
                this.saveBookmarks();
            }
        },
        
        removeBookmark(bookmark) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== bookmark.id);
            this.saveBookmarks();
        },
        
        seekTo(time) {
            const video = document.querySelector('.video-player');
            if (video) {
                video.currentTime = time;
            }
        },
        
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },
        
        loadBookmarks() {
            const saved = localStorage.getItem(`bookmarks_${this.currentLesson?.id}`);
            this.bookmarks = saved ? JSON.parse(saved) : [];
        },
        
        saveBookmarks() {
            if (this.currentLesson) {
                localStorage.setItem(`bookmarks_${this.currentLesson.id}`, JSON.stringify(this.bookmarks));
            }
        },
        
        startQuiz() {
            this.currentQuiz = this.quizzes[this.selectedCourse.id];
            if (this.currentQuiz) {
                this.currentView = 'quiz';
                this.quizStarted = true;
                this.currentQuestionIndex = 0;
                this.selectedAnswer = null;
                this.showResults = false;
                this.quizCompleted = false;
                this.correctAnswers = 0;
            }
        },
        
        selectAnswer(index) {
            if (!this.showResults) {
                this.selectedAnswer = index;
            }
        },
        
        submitAnswer() {
            if (this.selectedAnswer !== null) {
                const isCorrect = this.currentQuestion.answers[this.selectedAnswer].correct;
                if (isCorrect) {
                    this.correctAnswers++;
                }
                this.showResults = true;
            }
        },
        
        nextQuestion() {
            this.currentQuestionIndex++;
            this.selectedAnswer = null;
            this.showResults = false;
        },
        
        finishQuiz() {
            this.quizCompleted = true;
            
            // Generate certificate if score is high enough
            if (this.quizScore >= 70) {
                const newCert = {
                    id: `CERT-${Date.now()}`,
                    courseName: this.selectedCourse.title,
                    completedDate: new Date().toISOString().split('T')[0],
                    score: this.quizScore
                };
                this.certificates.push(newCert);
                this.userStats.certificatesEarned++;
            }
        },
        
        closeQuiz() {
            this.currentView = 'course-content';
            this.currentQuiz = null;
            this.quizStarted = false;
        },
        
        downloadCertificate(certificate) {
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
                `Сертификат о прохождении\n\n` +
                `Курс: ${certificate.courseName}\n` +
                `Студент: ${this.currentUser.name}\n` +
                `Завершено: ${certificate.completedDate}\n` +
                `Оценка: ${certificate.score}%\n` +
                `ID сертификата: ${certificate.id}`
            );
            link.download = `certificate-${certificate.id}.txt`;
            link.click();
        },
        
        joinWebinar(webinar) {
            window.open(webinar.zoomLink, '_blank');
            alert(`Подключение к вебинару: ${webinar.title}`);
        },
        
        createTopic() {
            if (this.newTopicTitle.trim()) {
                const newTopic = {
                    id: Date.now(),
                    title: this.newTopicTitle,
                    author: this.currentUser.name,
                    date: new Date().toLocaleDateString('ru-RU'),
                    replies: 0,
                    views: 1
                };
                this.forumTopics.unshift(newTopic);
                this.newTopicTitle = '';
                alert('Тема успешно создана!');
            }
        },
        
        openTopic(topic) {
            topic.views++;
            alert(`Открытие темы: ${topic.title}`);
        },
        
        downloadResource(resource) {
            alert(`Скачивание: ${resource.title}`);
        },
        
        viewResource(resource) {
            alert(`Просмотр: ${resource.title}`);
        },
        
        createCourse() {
            if (this.newCourse.title && this.newCourse.description) {
                const course = {
                    id: Date.now(),
                    title: this.newCourse.title,
                    description: this.newCourse.description,
                    progress: 0,
                    lessons: []
                };
                this.courses.push(course);
                this.newCourse = { title: '', description: '' };
                alert('Курс успешно создан!');
            }
        },
        
        editCourse(course) {
            const newTitle = prompt('Новое название:', course.title);
            if (newTitle) {
                course.title = newTitle;
                alert('Курс обновлен!');
            }
        },
        
        deleteCourse(course) {
            if (confirm(`Удалить курс "${course.title}"?`)) {
                const index = this.courses.findIndex(c => c.id === course.id);
                this.courses.splice(index, 1);
                alert('Курс удален!');
            }
        },
        
        getEnrolledCount(courseId) {
            return Math.floor(Math.random() * 50) + 10;
        },
        
        viewStudentDetails(student) {
            alert(`Просмотр деталей студента: ${student.name}`);
        },
        
        saveSettings() {
            alert('Настройки сохранены!');
        },
        
        exportStudentData() {
            const data = JSON.stringify(this.studentsList, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'students-data.json';
            link.click();
        },
        
        exportCourseData() {
            const data = JSON.stringify(this.courses, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'courses-data.json';
            link.click();
        },
        
        exportAnalytics() {
            const analytics = {
                adminStats: this.adminStats,
                topStudents: this.topStudents
            };
            const data = JSON.stringify(analytics, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'analytics-data.json';
            link.click();
        }
    },
    
    mounted() {
        // Auto-login for demo
        setTimeout(() => {
            if (!this.isLoggedIn) {
                this.quickLogin('student');
            }
        }, 1000);
    }
}).mount('#app');