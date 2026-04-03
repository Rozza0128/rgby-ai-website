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

    // Data readout
    var dataReadout = document.getElementById('dataReadout');
    var svR = document.getElementById('svR');
    var svG = document.getElementById('svG');
    var svB = document.getElementById('svB');
    var svY = document.getElementById('svY');
    var svStatus = document.getElementById('svStatus');

    if (dataReadout && svR) {
        var readoutStates = {
            'hero':       { r:'0.00', g:'0.00', b:'0.00', y:'0.00', status:'STANDBY', show:false },
            'problem':    { r:'0.00', g:'0.00', b:'0.00', y:'0.00', status:'STANDBY', show:false },
            'platform':   { r:'0.00', g:'0.00', b:'0.00', y:'0.00', status:'PENDING', show:true },
            'statespace': { r:'0.94', g:'0.46', b:'0.81', y:'0.00', status:'PROCESSING', show:true },
            'drift':      { r:'0.94', g:'0.46', b:'0.81', y:'0.33', status:'DRIFT_DETECTED', show:true },
            'highrisk':   { r:'0.99', g:'0.12', b:'0.67', y:'0.88', status:'HIGH_RISK', show:true },
            'engine':     { r:'0.94', g:'0.46', b:'0.81', y:'0.55', status:'ENFORCING', show:true },
            'physics':    { r:'0.71', g:'0.83', b:'0.92', y:'0.61', status:'VALIDATING', show:true },
            'climax':     { r:'1.00', g:'1.00', b:'1.00', y:'1.00', status:'SYSTEM_ACTIVE', show:true },
        };

        var currentReadoutState = null;
        var readoutObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    if (readoutStates[id] && id !== currentReadoutState) {
                        currentReadoutState = id;
                        var state = readoutStates[id];
                        if (state.show) {
                            dataReadout.classList.add('visible');
                            animateValue(svR, state.r); animateValue(svG, state.g);
                            animateValue(svB, state.b); animateValue(svY, state.y);
                            svStatus.textContent = state.status;
                        } else {
                            dataReadout.classList.remove('visible');
                        }
                    }
                }
            });
        }, { threshold: 0.4 });

        document.querySelectorAll('.scene').forEach(function(s) { readoutObserver.observe(s); });

        function animateValue(el, target) {
            var current = parseFloat(el.textContent) || 0;
            var targetVal = parseFloat(target);
            var steps = 20, step = 0, diff = targetVal - current;
            var interval = setInterval(function() {
                step++;
                var progress = 1 - Math.pow(1 - step / steps, 3);
                el.textContent = (current + diff * progress).toFixed(2);
                if (step >= steps) { el.textContent = target; clearInterval(interval); }
            }, 30);
        }

        var statusObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function() {
                svStatus.style.color = '#00D4AA';
                setTimeout(function() { svStatus.style.color = ''; }, 300);
            });
        });
        statusObserver.observe(svStatus, { childList: true, characterData: true, subtree: true });
    }

    // Canvas: Problem section
    function initProblemCanvas() {
        var canvas = document.getElementById('problemCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w, h, particles = [], time = 0;
        function resize() { var r = canvas.parentElement.getBoundingClientRect(); w = canvas.width = r.width; h = canvas.height = r.height; }
        function createParticles() {
            particles = [];
            for (var i = 0; i < 40; i++) {
                particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.5, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, alpha: Math.random()*0.3+0.1 });
            }
        }
        function draw() {
            ctx.clearRect(0, 0, w, h); time += 0.015;
            ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
            for (var x = 0; x < w; x += 2) {
                var y = h * 0.45 + Math.sin((x / w) * 4 * Math.PI + time * 2) * 60;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            particles.forEach(function(p) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')'; ctx.fill();
            });
            requestAnimationFrame(draw);
        }
        resize(); createParticles(); draw();
        window.addEventListener('resize', function() { resize(); createParticles(); });
    }

    // Canvas: Solution section
    function initSolutionCanvas() {
        var canvas = document.getElementById('solutionCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w, h, time = 0;
        var colors = [{ r:232,g:68,b:58 },{ r:52,g:199,b:89 },{ r:59,g:130,b:246 },{ r:250,g:204,b:21 }];
        function resize() { var r = canvas.parentElement.getBoundingClientRect(); w = canvas.width = r.width; h = canvas.height = r.height; }
        function draw() {
            ctx.clearRect(0, 0, w, h); time += 0.012;
            colors.forEach(function(c, i) {
                ctx.beginPath(); ctx.strokeStyle = 'rgba('+c.r+','+c.g+','+c.b+',0.25)'; ctx.lineWidth = 1.5;
                var offset = i * 0.8, amplitude = 40 + i * 15, frequency = 3 + i * 0.5;
                for (var x = 0; x < w; x += 2) {
                    var y = h * 0.45 + Math.sin((x / w) * frequency * Math.PI + time * 2 + offset) * amplitude;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
            requestAnimationFrame(draw);
        }
        resize(); draw(); window.addEventListener('resize', resize);
    }

    initProblemCanvas();
    initSolutionCanvas();

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
})();
