(function() {
    'use strict';

    // Hero dots converge
    var heroDots = document.getElementById('heroDots');
    if (heroDots) {
        setTimeout(function() { heroDots.classList.add('converged'); }, 100);
    }

    // Typed tagline
    var heroTagline = document.getElementById('heroTagline');
    if (heroTagline) {
        var taglineText = 'Operational intelligence for regulated environments';
        var i = 0;
        heroTagline.textContent = '';
        var cursor = document.createElement('span');
        cursor.className = 'typed-cursor';
        heroTagline.appendChild(cursor);
        function typeChar() {
            if (i < taglineText.length) {
                heroTagline.insertBefore(document.createTextNode(taglineText.charAt(i)), cursor);
                i++;
                setTimeout(typeChar, 50);
            }
        }
        setTimeout(typeChar, 1000);
    }

    // Hero parallax
    var heroDotsEl = document.getElementById('heroDots');
    var heroSection = document.getElementById('hero');
    if (heroDotsEl && heroSection) {
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY || window.pageYOffset;
            var heroHeight = heroSection.offsetHeight;
            if (scrollY < heroHeight) {
                var progress = scrollY / heroHeight;
                heroDotsEl.style.transform = 'translateY(' + (progress * 50) + 'px)';
                heroDotsEl.style.opacity = 1 - progress * 1.5;
            }
        }, { passive: true });
    }

    // Loading screen
    window.addEventListener('load', function() {
        var loader = document.getElementById('loader');
        if (loader) {
            setTimeout(function() {
                loader.classList.add('hidden');
                document.querySelectorAll('.ambient-flare').forEach(function(f) {
                    f.classList.add('active');
                });
            }, 800);
        }
    });

    // Progress bar
    var progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', function() {
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        });
    }

    // Initialize Lucide icons
    document.addEventListener('DOMContentLoaded', function() {
        if (window.lucide) { lucide.createIcons(); }
    });

    // Nav visibility — on inner pages, nav is always visible via .nav-visible class
    // On homepage, nav shows after scrolling past hero
    var nav = document.getElementById('mainNav');
    var hero = document.getElementById('hero');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (nav && hero && !nav.classList.contains('nav-visible')) {
        var navObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    nav.classList.remove('visible');
                } else {
                    nav.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        navObserver.observe(hero);
    }

    // Mobile nav toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-open');
        });
    }

    // Close mobile nav on link click
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (navLinks) navLinks.classList.remove('mobile-open');
        });
    });

    // Back to top
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll reveal
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) { entry.target.classList.add('visible'); }
            });
        }, { threshold: 0.05 });
        reveals.forEach(function(el) { revealObserver.observe(el); });

        setTimeout(function() {
            reveals.forEach(function(el) {
                if (!el.classList.contains('visible')) {
                    var rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight + 200) { el.classList.add('visible'); }
                }
            });
        }, 2000);
    }

    // Video modals
    function setupVideoModal(modalId, closeId, videoId, btnId) {
        var modal = document.getElementById(modalId);
        var closeBtn = document.getElementById(closeId);
        var video = document.getElementById(videoId);
        var btn = document.getElementById(btnId);
        if (!modal || !video) return;

        if (btn) {
            btn.addEventListener('click', function() {
                modal.classList.add('active');
                video.play();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
                video.pause();
                video.currentTime = 0;
            });
        }
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                video.pause();
                video.currentTime = 0;
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    setupVideoModal('videoModal', 'videoModalClose', 'explainerVideo', 'heroVideoBtn');
    setupVideoModal('rkidVideoModal', 'rkidVideoModalClose', 'rkidVideo', 'rkidVideoBtn');

    // Particle field
    function initParticleField() {
        var canvas = document.getElementById('particleField');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var w, h;
        var mouseX = -1000, mouseY = -1000;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            var count = window.innerWidth < 768 ? 25 : 60;
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w, y: Math.random() * h,
                    r: Math.random() * 1.2 + 0.3,
                    vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15,
                    alpha: Math.random() * 0.25 + 0.05,
                    baseAlpha: Math.random() * 0.25 + 0.05,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                    pulseOffset: Math.random() * Math.PI * 2,
                });
            }
        }

        var time = 0;
        function draw() {
            ctx.clearRect(0, 0, w, h);
            time += 1;
            particles.forEach(function(p) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
                p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * p.baseAlpha * 0.5;
                var dx = p.x - mouseX, dy = p.y - mouseY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var mouseFactor = dist < 150 ? (1 - dist / 150) * 0.3 : 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + Math.min(p.alpha + mouseFactor, 0.6) + ')';
                ctx.fill();
            });
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - dist / 120) * 0.03) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }

        resize(); createParticles(); draw();
        window.addEventListener('resize', function() { resize(); createParticles(); });
        document.addEventListener('mousemove', function(e) { mouseX = e.clientX; mouseY = e.clientY; });
        document.addEventListener('mouseleave', function() { mouseX = -1000; mouseY = -1000; });
    }

    initParticleField();

    // Smooth scroll for same-page anchor links only
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Contact type selector
    document.querySelectorAll('.contact-type-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.contact-type-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var subjectField = document.getElementById('contactSubject');
            if (subjectField) { subjectField.value = btn.textContent.trim(); }
        });
    });

})();
