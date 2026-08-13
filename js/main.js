$(document).ready(function () {

    /* ==========================================================================
       1. NAVIGATION & THEME SWITCHER
       ========================================================================== */
    $('.nav-toggle').on('click', function () {
        $('.navigation').toggleClass('show');
    });

    /* ==========================================================================
       2. LOGIN FORM VALIDATION (index.html)
       ========================================================================== */
    $('#login-form').on('submit', function (e) {
        e.preventDefault();
        
        // Convert input to lowercase to avoid case-sensitivity mismatches
        const enteredUser = $(this).find('input[type="text"]').val().trim().toLowerCase();
        const enteredPass = $(this).find('input[type="password"]').val().trim();

        const savedUserData = localStorage.getItem('registeredUser');

        if (!savedUserData) {
            alert('No registered user found. Please sign up first.');
            return;
        }

        const registeredUser = JSON.parse(savedUserData);

        // Compare case-insensitive username/email and exact password
        const matchesUser = (enteredUser === registeredUser.fullName.toLowerCase() || enteredUser === registeredUser.email.toLowerCase());
        const matchesPass = (enteredPass === registeredUser.password);

        if (matchesUser && matchesPass) {
            alert('Login successful! Redirecting...');
            window.location.href = 'main.html';
        } else {
            alert('Incorrect username or password.');
        }
    });

    /* ==========================================================================
       3. SIGN UP FORM VALIDATION (signup.html)
       ========================================================================== */
    $('#signup-form').on('submit', function (e) {
        e.preventDefault();
        
        // Grab input values cleanly
        const fullName = ($('#signup-fullname').length ? $('#signup-fullname') : $(this).find('input[type="text"]')).val().trim();
        const email = ($('#signup-email').length ? $('#signup-email') : $(this).find('input[type="email"]')).val().trim();
        const pass = $(this).find('input[type="password"]').first().val();
        const confirmPass = $(this).find('input[type="password"]').last().val();

        // 1. Validate matching passwords
        if (pass !== confirmPass) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        // 2. Prevent using the exact same value for email/username and password
        if (pass.toLowerCase() === email.toLowerCase() || pass.toLowerCase() === fullName.toLowerCase()) {
            alert('Security Error: Your password cannot be identical to your name or email.');
            return;
        }

        // 3. Check if user already exists in storage
        const existingData = localStorage.getItem('registeredUser');
        if (existingData) {
            const existingUser = JSON.parse(existingData);
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                alert('An account with this email address already exists. Please log in.');
                window.location.href = 'index.html';
                return;
            }
        }

        // 4. Save clean credentials if all checks pass
        if (fullName !== "" && email !== "" && pass !== "") {
            const userCredentials = {
                fullName: fullName,
                email: email,
                password: pass
            };
            
            localStorage.setItem('registeredUser', JSON.stringify(userCredentials));

            alert('Account created successfully! Redirecting to login...');
            window.location.href = 'index.html';
        } else {
            alert('Please fill in all required fields.');
        }
    });

    /* ==========================================================================
       4. FAQ ACCORDION (faq.html)
       ========================================================================== */
    $('.faq-question').on('click', function () {
        const $this = $(this);
        const $answer = $this.next('.faq-answer');

        $this.toggleClass('active');
        $answer.slideToggle(250);

        const isExpanded = $this.attr('aria-expanded') === 'true';
        $this.attr('aria-expanded', !isExpanded);
    });

    /* ==========================================================================
       5. CONTACT FORM & LOCAL STORAGE (contact.html)
       ========================================================================== */
    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        let isValid = true;

        $('.error-msg').hide().text('');

        const name = $('#name').val().trim();
        if (name === '') {
            $('#nameError').text('Name is required.').show();
            isValid = false;
        }

        const email = $('#email').val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            $('#emailError').text('Email is required.').show();
            isValid = false;
        } else if (!emailRegex.test(email)) {
            $('#emailError').text('Please enter a valid email address.').show();
            isValid = false;
        }

        const message = $('#message').val().trim();
        if (message === '') {
            $('#messageError').text('Message is required.').show();
            isValid = false;
        }

        if (isValid) {
            const formData = {
                name: name,
                email: email,
                message: message,
                optIn: $('input[name="comm"]').is(':checked'),
                timestamp: new Date().toLocaleString()
            };

            localStorage.setItem('lastContactSubmission', JSON.stringify(formData));

            $('#submissionOutput').html(`
                <div style="margin-top: 15px; padding: 12px; background: #d1fae5; color: #065f46; border-radius: 6px;">
                    <strong>Thank you, ${formData.name}!</strong> Your message has been saved locally.
                </div>
            `).hide().fadeIn(400);

            this.reset();
        }
    });

    /* ==========================================================================
       6. RESOURCE SEARCH & UPLOAD (resources.html)
       ========================================================================== */
    $('#searchBox').on('keyup', function () {
        const value = $(this).val().toLowerCase();
        let matches = 0;

        $('.resource-card').each(function () {
            const cardText = $(this).text().toLowerCase();
            const isMatch = cardText.indexOf(value) > -1;
            $(this).toggle(isMatch);
            if (isMatch) matches++;
        });

        $('#noResults').toggle(matches === 0);
    });

    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();
        const title = $('#fileTitle').val().trim();
        const category = $('#fileCategory').val();

        if (title !== '') {
            const newCard = `
                <div class="card resource-card">
                    <div>
                        <span style="background: #e0e7ff; color: #3730a3; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; font-weight: bold;">${category}</span>
                        <h3 style="margin-top: 8px;">${title}</h3>
                        <p style="color: #64748b; font-size: 0.9rem;">User uploaded document.</p>
                    </div>
                    <a href="#" class="btn-primary" style="margin-top:15px; text-align:center;">Download File</a>
                </div>
            `;
            $('#resourceContainer').prepend(newCard);
            this.reset();
        }
    });

    /* ==========================================================================
       7. REMINDER TRACKER (main.html)
       ========================================================================== */
    $('#reminderForm').on('submit', function (e) {
        e.preventDefault();
        const title = $('#taskTitle').val().trim();
        const type = $('#taskType').val();
        const date = $('#taskDate').val();

        if (title && date) {
            const itemHtml = `
                <li style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${title}</strong> <span style="font-size:0.8rem; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${type}</span>
                        <br><small style="color:#64748b;">Due: ${date}</small>
                    </div>
                    <button class="remove-btn" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
                </li>
            `;
            $('#reminderList').append(itemHtml);
            this.reset();
        }
    });

    $('#reminderList').on('click', '.remove-btn', function () {
        $(this).parent('li').fadeOut(300, function () { $(this).remove(); });
    });

    /* ==========================================================================
       8. GLOBAL GRADE CALCULATOR (calculator.html)
       ========================================================================== */
    $('#addModuleBtn').on('click', function () {
        const rowHtml = `
            <div class="calc-row">
                <input type="text" placeholder="Module Name" class="mod-name">
                <input type="number" placeholder="Credits" class="mod-credit" value="15" min="1">
                <input type="number" placeholder="Mark %" class="mod-mark" min="0" max="100">
                <button type="button" class="remove-row">×</button>
            </div>
        `;
        $('#calcRowsContainer').append(rowHtml);
    });

    $('#calcRowsContainer').on('click', '.remove-row', function () {
        $(this).closest('.calc-row').remove();
    });

    $('#calcForm').on('submit', function (e) {
        e.preventDefault();
        let totalWeightedMarks = 0;
        let totalCredits = 0;

        $('.calc-row').each(function () {
            const credits = parseFloat($(this).find('.mod-credit').val()) || 0;
            const mark = parseFloat($(this).find('.mod-mark').val()) || 0;

            if (credits > 0 && mark >= 0) {
                totalWeightedMarks += mark * credits;
                totalCredits += credits;
            }
        });

        if (totalCredits > 0) {
            const finalAverage = (totalWeightedMarks / totalCredits).toFixed(2);
            let classification = "";

            if (finalAverage >= 70) classification = "First Class Honours (1st)";
            else if (finalAverage >= 60) classification = "Upper Second Class (2:1)";
            else if (finalAverage >= 50) classification = "Lower Second Class (2:2)";
            else if (finalAverage >= 40) classification = "Third Class (3rd)";
            else classification = "Fail / Resit Required";

            $('#calcResult').html(`
                <div style="background: #e0f2fe; border: 1px solid #38bdf8; padding: 15px; border-radius: 8px;">
                    <h3>Overall Average: ${finalAverage}%</h3>
                    <p style="margin-top:4px;"><strong>Grade Degree Classification:</strong> ${classification}</p>
                </div>
            `).hide().fadeIn(300);
        } else {
            $('#calcResult').html('<p style="color:#dc2626;">Please enter valid marks and credits.</p>');
        }
    });

    /* ==========================================================================
       9. TIMEZONE & STUDY PLANNER (planner.html)
       ========================================================================== */
    $('#tzSelect').on('change', function () {
        const tz = $(this).val();
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            $('#clockDisplay').text(timeString);
        } catch (e) {
            $('#clockDisplay').text("Time conversion unavailable");
        }
    });

    $('#sessionForm').on('submit', function (e) {
        e.preventDefault();
        const subject = $('#sessionSubject').val();
        const partner = $('#sessionPartner').val();
        const time = $('#sessionTime').val();

        if (subject && time) {
            const card = `
                <div class="card" style="margin-bottom: 10px;">
                    <h4>${subject} Sync Session</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Partner/Group: ${partner || 'Global Study Group'}</p>
                    <p><strong>Scheduled Time:</strong> ${time}</p>
                </div>
            `;
            $('#plannedSessions').prepend(card);
            this.reset();
        }
    });

    /* ==========================================================================
       10. DIGITAL POMODORO TIMER LOGIC (wellbeing.html)
       ========================================================================== */
    let timerInterval = null;
    let defaultMinutes = 25;
    let timeLeft = defaultMinutes * 60;

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const minString = minutes >= 100 ? minutes.toString() : minutes.toString().padStart(2, '0');
        const secString = seconds.toString().padStart(2, '0');

        $('#timerDisplay').text(`${minString}:${secString}`);
    }

    $('#setCustomTimeBtn').off('click').on('click', function (e) {
        e.preventDefault();
        const customVal = parseInt($('#customMinutes').val(), 10);

        if (!isNaN(customVal) && customVal > 0 && customVal <= 180) {
            clearInterval(timerInterval);
            timerInterval = null;

            defaultMinutes = customVal;
            timeLeft = defaultMinutes * 60;

            updateTimerDisplay();
            $('#timerStatus').text(`Timer set to ${defaultMinutes} minute(s). Click Start Session.`);
        } else {
            alert("Please enter a valid time between 1 and 180 minutes.");
        }
    });

    $('#startTimerBtn').off('click').on('click', function (e) {
        e.preventDefault();
        if (timerInterval === null) {
            $('#timerStatus').text("Focus Session Active... Keep studying!");
            timerInterval = setInterval(function () {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    $('#timerStatus').text("Time's up! Take a break.");
                    alert("Session finished! Time for a break.");
                }
            }, 1000);
        }
    });

    $('#pauseTimerBtn').off('click').on('click', function (e) {
        e.preventDefault();
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
            $('#timerStatus').text("Session Paused.");
        }
    });

    $('#resetTimerBtn').off('click').on('click', function (e) {
        e.preventDefault();
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = defaultMinutes * 60;
        updateTimerDisplay();
        $('#timerStatus').text("Timer reset. Ready to start!");
    });

    /* ==========================================================================
       11. MODALS & WELLBEING INTERACTION LOGIC (wellbeing.html)
       ========================================================================== */
    function openModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    var card1 = document.getElementById('openBreathingModal');
    var card2 = document.getElementById('openHydrationModal');
    var card3 = document.getElementById('openHelplineModal');

    if (card1) card1.addEventListener('click', function () { openModal('breathingModal'); });
    if (card2) card2.addEventListener('click', function () { openModal('hydrationModal'); });
    if (card3) card3.addEventListener('click', function () { openModal('helplineModal'); });

    var closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    var modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(function (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    var waterCount = 0;
    var addWaterBtn = document.getElementById('addWaterBtn');
    var resetWaterBtn = document.getElementById('resetWaterBtn');
    var waterDisplay = document.getElementById('waterCount');

    if (addWaterBtn && waterDisplay) {
        addWaterBtn.addEventListener('click', function () {
            if (waterCount < 8) {
                waterCount++;
                waterDisplay.textContent = waterCount;
            }
        });
    }

    if (resetWaterBtn && waterDisplay) {
        resetWaterBtn.addEventListener('click', function () {
            waterCount = 0;
            waterDisplay.textContent = waterCount;
        });
    }

    var eyeTimerInterval = null;
    var eyeTimeLeft = 20 * 60;
    var startEyeBtn = document.getElementById('startEyeTimerBtn');
    var eyeDisplay = document.getElementById('eyeTimerDisplay');

    if (startEyeBtn && eyeDisplay) {
        startEyeBtn.addEventListener('click', function () {
            if (eyeTimerInterval === null) {
                startEyeBtn.textContent = "Timer Active (20 Mins)";
                eyeTimerInterval = setInterval(function () {
                    if (eyeTimeLeft > 0) {
                        eyeTimeLeft--;
                        var mins = Math.floor(eyeTimeLeft / 60).toString().padStart(2, '0');
                        var secs = (eyeTimeLeft % 60).toString().padStart(2, '0');
                        eyeDisplay.textContent = mins + ':' + secs;
                    } else {
                        clearInterval(eyeTimerInterval);
                        eyeTimerInterval = null;
                        alert("Time for an eye break! Look at something 20 feet away for 20 seconds.");
                        eyeTimeLeft = 20 * 60;
                        eyeDisplay.textContent = "20:00";
                        startEyeBtn.textContent = "Start 20-Min Screen Timer";
                    }
                }, 1000);
            }
        });
    }

    /* ==========================================================================
       12. CAREER BOOKING & NEWSLETTER FORM LOGIC
       ========================================================================== */
    $('#careerBookingForm').on('submit', function (e) {
        e.preventDefault();
        const name = $('#studentName').val().trim();
        const topic = $('#supportTopic').val();
        const date = $('#bookingDate').val();

        if (name && date) {
            $('#bookingResult').html(`
                <div style="padding: 12px; background: #d1fae5; color: #065f46; border-radius: 6px;">
                    <strong>Session Requested!</strong> Thank you, ${name}. Your consultation regarding <em>${topic}</em> is provisionally booked for ${date}.
                </div>
            `).hide().fadeIn(300);
            this.reset();
        }
    });

    $('#newsletterForm').on('submit', function (e) {
        e.preventDefault();
        const email = $('#newsletterEmail').val().trim();

        if (email !== '') {
            $('#newsletterResult').html(`
                <div style="padding: 10px; background: #d1fae5; color: #065f46; border-radius: 6px;">
                    Thank you! <strong>${email}</strong> has been added to our campus newsletter.
                </div>
            `).hide().fadeIn(300);
            this.reset();
        }
    });

});

/* ==========================================================================
   13. CAMPUS & CAREER GLOBAL MODAL FUNCTIONS
   ========================================================================== */
window.openEventModal = function (title, date, description) {
    $('#modalTitle').text(title);
    $('#modalDate').text('🗓️ ' + date);
    $('#modalDesc').text(description);
    $('#eventModal').css('display', 'flex');
};

window.closeModalDirect = function () {
    $('#eventModal').css('display', 'none');
};

window.closeEventModal = function (event) {
    if (event.target.id === 'eventModal') {
        $('#eventModal').css('display', 'none');
    }
};

window.registerEvent = function () {
    alert('Thank you! You have successfully registered for this event.');
    window.closeModalDirect();
};

window.openCareerModal = function (title, tag, description) {
    $('#careerModalTitle').text(title);
    $('#careerModalTag').text('📌 ' + tag);
    $('#careerModalDesc').text(description);
    $('#careerModal').css('display', 'flex');
};

window.closeCareerModalDirect = function () {
    $('#careerModal').css('display', 'none');
};

window.closeCareerModal = function (event) {
    if (event.target.id === 'careerModal') {
        $('#careerModal').css('display', 'none');
    }
};

window.requestCareerSupport = function () {
    alert('Request submitted! Our team will follow up via email.');
    window.closeCareerModalDirect();
};