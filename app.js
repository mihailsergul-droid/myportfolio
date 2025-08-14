const { createApp } = Vue;

createApp({
    data() {
        return {
            profile: {
                name: 'Михаил Сергеев',
                title: 'Senior Frontend Developer',
                email: 'mihail.sergul@gmail.com',
                phone: '+7 (999) XXX-XX-67',
                github: 'github.com/mihailsergul-droid',
                about: 'Опытный frontend разработчик с 7+ годами опыта создания современных веб-приложений. Специализируюсь на Vue.js, React и TypeScript. Имею опыт руководства командой и архитектурного планирования.'
            },
            skills: [
                {
                    category: 'Frontend',
                    technologies: ['Vue.js', 'React', 'TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3', 'SCSS']
                },
                {
                    category: 'Инструменты',
                    technologies: ['Webpack', 'Vite', 'Git', 'Docker', 'Jest', 'Cypress']
                },
                {
                    category: 'Backend',
                    technologies: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API']
                }
            ],
            experience: [
                {
                    id: 1,
                    position: 'Senior Frontend Developer',
                    company: 'Tech Company',
                    period: '2021 - настоящее время',
                    tasks: [
                        'Разработка SPA приложений на Vue.js и React',
                        'Архитектурное планирование frontend решений',
                        'Менторинг junior разработчиков',
                        'Оптимизация производительности приложений'
                    ]
                },
                {
                    id: 2,
                    position: 'Frontend Developer',
                    company: 'Digital Agency',
                    period: '2019 - 2021',
                    tasks: [
                        'Создание адаптивных веб-интерфейсов',
                        'Интеграция с REST API',
                        'Настройка CI/CD процессов'
                    ]
                }
            ],

            stats: [
                { label: 'Лет опыта', value: 7 },
                { label: 'Проектов', value: 25 },
                { label: 'Клиентов', value: 15 },
                { label: 'Строк кода', value: 100000 }
            ],

        }
    },

    
    methods: {

        
        getParticleStyle(index) {
            return {
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 10 + 's',
                animationDuration: (Math.random() * 3 + 2) + 's'
            };
        },
        
        initAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, observerOptions);
            
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        },
        
        initParallax() {
            let ticking = false;
            
            const updateParallax = () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                const parallaxBg = document.querySelector('.parallax-bg');
                const shapes = document.querySelectorAll('.shape');
                const particles = document.querySelectorAll('.particle');
                const waves = document.querySelectorAll('.wave');
                
                if (parallaxBg) {
                    parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
                }
                
                shapes.forEach((shape, index) => {
                    const speed = 0.2 + (index * 0.1);
                    shape.style.transform = `translate3d(0, ${scrolled * speed}px, 0) rotate(${scrolled * 0.1}deg)`;
                });
                
                particles.forEach((particle, index) => {
                    const speed = 0.1 + (index * 0.01);
                    particle.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                });
                
                waves.forEach((wave, index) => {
                    const speed = 0.3 + (index * 0.1);
                    wave.style.transform = `translateX(${-scrolled * speed}px)`;
                });
                
                ticking = false;
            };
            
            const requestTick = () => {
                if (!ticking) {
                    requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            };
            
            window.addEventListener('scroll', requestTick);
        },
        
        initMouseEffects() {
            let mouseX = 0, mouseY = 0;
            let targetX = 0, targetY = 0;
            let isAnimating = false;
            
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // Cursor trail effect
                this.createCursorTrail(e.clientX, e.clientY);
            });
            
            const animateElements = () => {
                targetX += (mouseX - targetX) * 0.1;
                targetY += (mouseY - targetY) * 0.1;
                
                const shapes = document.querySelectorAll('.shape');
                shapes.forEach((shape, index) => {
                    const speed = 0.02 + (index * 0.01);
                    const x = (targetX - window.innerWidth / 2) * speed;
                    const y = (targetY - window.innerHeight / 2) * speed;
                    const currentTransform = shape.style.transform || '';
                    const baseTransform = currentTransform.replace(/translate3d\([^)]*\)/g, '');
                    shape.style.transform = baseTransform + ` translate3d(${x}px, ${y}px, 0)`;
                });
                
                // Parallax effect for cards - only when not hovering
                const parallaxElements = document.querySelectorAll('.parallax-element:not(:hover)');
                parallaxElements.forEach((element, index) => {
                    const rect = element.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const deltaX = (mouseX - centerX) * 0.01;
                    const deltaY = (mouseY - centerY) * 0.01;
                    
                    if (!element.dataset.isHovered) {
                        element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateY(${deltaX * 0.1}deg) rotateX(${-deltaY * 0.1}deg)`;
                    }
                });
                
                requestAnimationFrame(animateElements);
            };
            
            animateElements();
        },
        
        createCursorTrail(x, y) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.8), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: trailFade 0.8s ease-out forwards;
            `;
            
            document.body.appendChild(trail);
            
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
            }, 800);
        },
        
        initAdvancedAnimations() {
            // Staggered animations for skill tags
            const skillTags = document.querySelectorAll('.skill-tag');
            skillTags.forEach((tag, index) => {
                let hasAnimated = false;
                
                tag.addEventListener('mouseenter', () => {
                    if (!hasAnimated) {
                        hasAnimated = true;
                        tag.style.animation = `tagHover 0.3s ease-out forwards`;
                        setTimeout(() => {
                            tag.classList.add('hovered');
                            tag.style.animation = '';
                        }, 300);
                    }
                });
            });
            
            // Magnetic effect for buttons
            const buttons = document.querySelectorAll('.demo-link, .contact-item');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.dataset.isHovered = 'true';
                });
                
                button.addEventListener('mousemove', (e) => {
                    const rect = button.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    button.style.transform = `translate3d(${x * 0.1}px, ${y * 0.1}px, 0) scale(1.05)`;
                });
                
                button.addEventListener('mouseleave', () => {
                    button.dataset.isHovered = 'false';
                    button.style.transform = '';
                });
            });
            
            // Parallax elements hover handling
            const parallaxElements = document.querySelectorAll('.parallax-element');
            parallaxElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    element.dataset.isHovered = 'true';
                });
                
                element.addEventListener('mouseleave', () => {
                    element.dataset.isHovered = 'false';
                });
            });
            
            // Typing animation for section titles
            const titles = document.querySelectorAll('.section-title');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.typed) {
                        entry.target.dataset.typed = 'true';
                        this.typeWriter(entry.target);
                    }
                });
            });
            
            titles.forEach(title => observer.observe(title));
        },
        
        typeWriter(element) {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid #667eea';
            
            let i = 0;
            const timer = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;
                
                if (i >= text.length) {
                    clearInterval(timer);
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 500);
                }
            }, 100);
        },
        
        initCounterAnimations() {
            const counters = document.querySelectorAll('.stat-number');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                    }
                });
            });
            
            counters.forEach(counter => observer.observe(counter));
        },
        
        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target') || element.textContent);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        }
    },
    
    mounted() {
        this.initAnimations();
        this.initParallax();
        this.initMouseEffects();
        this.initAdvancedAnimations();
        this.initCounterAnimations();
        
        // Add shimmer elements to project cards
        this.$nextTick(() => {
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                if (!card.querySelector('.shimmer')) {
                    const shimmer = document.createElement('div');
                    shimmer.className = 'shimmer';
                    card.appendChild(shimmer);
                }
            });
        });
        
        // Add CSS for cursor trail animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes trailFade {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0);
                }
            }
            
            @keyframes tagHover {
                0% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.1) rotate(5deg); }
                100% { transform: scale(1.05) rotate(0deg); }
            }
            
            .skill-tag.hovered {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
}).mount('#app');