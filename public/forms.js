(function() {
    'use strict';

    var waitlistForm = document.getElementById('waitlistForm');
    var contactForm = document.getElementById('contactForm');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('waitlistEmail').value;
            var msg = document.getElementById('waitlistMsg');
            fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                msg.textContent = data.message || "You're on the list.";
                msg.style.color = '#00D4AA';
                waitlistForm.reset();
            })
            .catch(function() {
                msg.textContent = 'Something went wrong. Try again.';
                msg.style.color = 'var(--r)';
            });
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('contactName').value;
            var email = document.getElementById('contactEmail').value;
            var subject = document.getElementById('contactSubject').value;
            var message = document.getElementById('contactMessage').value;
            var msg = document.getElementById('contactMsg');
            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                msg.textContent = "Message received. We'll get back to you.";
                msg.style.color = '#00D4AA';
                contactForm.reset();
            })
            .catch(function() {
                msg.textContent = 'Something went wrong. Try again.';
                msg.style.color = 'var(--r)';
            });
        });
    }
})();
