$(document).ready(function () {
    // ---------------------------------------------------------
    // 1. FAQ Accordion Animation
    // ---------------------------------------------------------
    $(".faq-question").on("click", function () {
        const $answer = $(this).next(".faq-answer");
        $(".faq-answer").not($answer).slideUp(200);
        $answer.slideToggle(200);

        const isExpanded = $(this).attr("aria-expanded") === "true";
        $(this).attr("aria-expanded", !isExpanded);
    });

    // ---------------------------------------------------------
    // 2. Real-Time Resource Search Filter
    // ---------------------------------------------------------
    $("#searchBox").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        let visibleCount = 0;

        $(".resource-card").filter(function () {
            const matches = $(this).text().toLowerCase().indexOf(value) > -1;
            $(this).toggle(matches);
            if (matches) visibleCount++;
        });

        $("#noResults").toggle(visibleCount === 0);
    });

    // ---------------------------------------------------------
    // 3. Contact Form Validation & LocalStorage
    // ---------------------------------------------------------
    $("#contactForm").on("submit", function (e) {
        e.preventDefault();
        let isValid = true;

        const name = $("#name").val().trim();
        const email = $("#email").val().trim();
        const message = $("#message").val().trim();

        if (name === "") {
            $("#nameError").text("Name is required.").show();
            isValid = false;
        } else {
            $("#nameError").hide();
        }

        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailPattern.test(email)) {
            $("#emailError").text("Please enter a valid email address.").show();
            isValid = false;
        } else {
            $("#emailError").hide();
        }

        if (message === "") {
            $("#messageError").text("Message cannot be empty.").show();
            isValid = false;
        } else {
            $("#messageError").hide();
        }

        if (isValid) {
            const submission = { name, email, message, date: new Date().toLocaleString() };
            let history = JSON.parse(localStorage.getItem("studely_submissions")) || [];
            history.push(submission);
            localStorage.setItem("studely_submissions", JSON.stringify(history));

            $("#submissionOutput").html(`
                <div style="background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h4>Thank you, ${name}!</h4>
                    <p>Your details have been saved locally.</p>
                </div>
            `).fadeIn();

            $("#contactForm")[0].reset();
        }
    });

    // ---------------------------------------------------------
    // 4. Student Reminders & Deadline Tracker (LocalStorage)
    // ---------------------------------------------------------
    function loadReminders() {
        const reminders = JSON.parse(localStorage.getItem("studely_reminders")) || [];
        $("#reminderList").empty();

        if (reminders.length === 0) {
            $("#reminderList").append('<li style="color: #64748b; font-style: italic;">No upcoming deadlines set.</li>');
            return;
        }

        reminders.forEach((item, index) => {
            $("#reminderList").append(`
                <li style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid #2563eb;">
                    <div>
                        <strong>[${item.type.toUpperCase()}] ${item.title}</strong>
                        <div style="font-size: 0.85rem; color: #64748b;">Due: ${item.date}</div>
                    </div>
                    <button class="delete-reminder" data-index="${index}" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Delete</button>
                </li>
            `);
        });
    }

    if ($("#reminderForm").length > 0) {
        loadReminders();

        $("#reminderForm").on("submit", function (e) {
            e.preventDefault();
            const title = $("#taskTitle").val().trim();
            const type = $("#taskType").val();
            const date = $("#taskDate").val();

            if (title && date) {
                const newReminder = { title, type, date };
                let reminders = JSON.parse(localStorage.getItem("studely_reminders")) || [];
                reminders.push(newReminder);
                localStorage.setItem("studely_reminders", JSON.stringify(reminders));
                
                $("#reminderForm")[0].reset();
                loadReminders();
            }
        });

        $(document).on("click", ".delete-reminder", function () {
            const index = $(this).data("index");
            let reminders = JSON.parse(localStorage.getItem("studely_reminders")) || [];
            reminders.splice(index, 1);
            localStorage.setItem("studely_reminders", JSON.stringify(reminders));
            loadReminders();
        });
    }

    // ---------------------------------------------------------
    // 5. Real-Life File Upload, Download & Delete Hub
    // ---------------------------------------------------------
    $("#uploadForm").on("submit", function (e) {
        e.preventDefault();
        const fileInput = document.getElementById("fileInput");
        const category = $("#fileCategory").val();
        const title = $("#fileTitle").val().trim();

        if (fileInput.files.length === 0) {
            alert("Please select a file to upload!");
            return;
        }

        const file = fileInput.files[0];
        const fileObjectURL = URL.createObjectURL(file);

        const newCard = `
            <div class="card resource-card" style="position: relative;">
                <button class="delete-card-btn" style="position: absolute; top: 12px; right: 12px; background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Delete</button>
                <div>
                    <span class="subject-tag">${category}</span>
                    <h3 style="margin-top: 8px;">${title || file.name}</h3>
                    <p>File Size: ${(file.size / 1024).toFixed(1)} KB | Format: ${file.name.split('.').pop().toUpperCase()}</p>
                </div>
                <a href="${fileObjectURL}" download="${file.name}" class="btn-primary" style="margin-top:15px; text-align:center;">Download File</a>
            </div>
        `;

        $("#resourceContainer").prepend(newCard);
        $("#uploadForm")[0].reset();
    });

    $(document).on("click", ".delete-card-btn", function () {
        if (confirm("Are you sure you want to delete this resource card?")) {
            $(this).closest(".resource-card").fadeOut(200, function () {
                $(this).remove();
            });
        }
    });

    // ---------------------------------------------------------
    // 6. Interactive Floating Chatbot Implementation
    // ---------------------------------------------------------
    if ($("#chatbot-widget").length === 0) {
        const chatbotHTML = `
            <div id="chatbot-widget" style="position: fixed; bottom: 25px; right: 25px; z-index: 9999; font-family: sans-serif;">
                <button id="chatbot-toggle" style="background: #2563eb; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25); font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">💬</button>
                <div id="chatbot-box" style="display: none; position: absolute; bottom: 75px; right: 0; width: 320px; height: 430px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; border: 1px solid #cbd5e1;">
                    <div style="background: #1e3a8a; color: white; padding: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                        <span>Studely Bot 🤖</span>
                        <button id="chatbot-close" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">✕</button>
                    </div>
                    <div id="chatbot-messages" style="flex: 1; padding: 12px; overflow-y: auto; background: #f8fafc; font-size: 0.88rem; display: flex; flex-direction: column; gap: 10px;">
                        <div style="background: #e2e8f0; color: #1e293b; padding: 8px 12px; border-radius: 10px; max-width: 80%; align-self: flex-start;">
                            Hi! Ask me about modules, downloading notes, or adding deadlines!
                        </div>
                    </div>
                    <form id="chatbot-form" style="display: flex; border-top: 1px solid #e2e8f0; padding: 8px; background: white;">
                        <input type="text" id="chatbot-input" placeholder="Type a message..." style="flex: 1; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 20px; outline: none; font-size: 0.85rem;" required>
                        <button type="submit" style="background: #2563eb; color: white; border: none; padding: 8px 14px; margin-left: 6px; border-radius: 20px; cursor: pointer; font-size: 0.85rem;">Send</button>
                    </form>
                </div>
            </div>
        `;
        $("body").append(chatbotHTML);
    }

    $(document).on("click", "#chatbot-toggle", function () {
        const $box = $("#chatbot-box");
        if ($box.css("display") === "none") {
            $box.css("display", "flex").fadeIn(150);
        } else {
            $box.fadeOut(150);
        }
    });

    $(document).on("click", "#chatbot-close", function () {
        $("#chatbot-box").fadeOut(150);
    });

    $(document).on("submit", "#chatbot-form", function (e) {
        e.preventDefault();
        const query = $("#chatbot-input").val().trim();
        if (!query) return;

        $("#chatbot-messages").append(`
            <div style="background: #2563eb; color: white; padding: 8px 12px; border-radius: 10px; max-width: 80%; align-self: flex-end;">
                ${query}
            </div>
        `);

        $("#chatbot-input").val("");
        $("#chatbot-messages").scrollTop($("#chatbot-messages")[0].scrollHeight);

        setTimeout(() => {
            let response = "I'm here to help! You can use the top navigation to search resources or track your deadlines.";
            const q = query.toLowerCase();

            if (q.includes("python") || q.includes("code") || q.includes("programming") || q.includes("database") || q.includes("sql")) {
                response = "You can find and upload study materials like Python or SQL cheat sheets directly on the Resources page!";
            } else if (q.includes("exam") || q.includes("deadline") || q.includes("assignment") || q.includes("todo")) {
                response = "You can set and track all your exam dates and module deadlines on the Home page tracker!";
            } else if (q.includes("upload") || q.includes("download") || q.includes("file")) {
                response = "Head over to the Resources tab to upload files from your device or download notes directly.";
            } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
                response = "Hello! How can I assist you with your studies today?";
            }

            $("#chatbot-messages").append(`
                <div style="background: #e2e8f0; color: #1e293b; padding: 8px 12px; border-radius: 10px; max-width: 80%; align-self: flex-start;">
                    ${response}
                </div>
            `);
            $("#chatbot-messages").scrollTop($("#chatbot-messages")[0].scrollHeight);
        }, 400);
    });

    // ---------------------------------------------------------
    // 7. Interactive Mental Wellbeing Features
    // ---------------------------------------------------------
    
    // A. Working 25-Min Study Timer
    let timerInterval = null;
    let timeLeft = 25 * 60; // 25 minutes in seconds

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        $("#timerDisplay").text(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }

    $("#startTimer").on("click", function () {
        if (timerInterval) return; // Prevent double intervals
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Time for a 5-minute study break! Step away from your computer.");
            }
        }, 1000);
    });

    $("#pauseTimer").on("click", function () {
        clearInterval(timerInterval);
        timerInterval = null;
    });

    $("#resetTimer").on("click", function () {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = 25 * 60;
        updateTimerDisplay();
    });

    // B. Interactive Breathing Exercise Guide
    let breathingInterval = null;
    $("#startBreathing").on("click", function () {
        if (breathingInterval) {
            clearInterval(breathingInterval);
            breathingInterval = null;
            $("#breathingText").text("Click to start exercise");
            $(this).text("Start Breathing");
            return;
        }

        $(this).text("Stop Breathing Guide");
        const steps = ["Inhale deeply (4s)... 🫁", "Hold breath (4s)... ⏸️", "Exhale slowly (6s)... 🌬️"];
        let stepIdx = 0;

        $("#breathingText").text(steps[0]);
        breathingInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            $("#breathingText").text(steps[stepIdx]);
        }, 4000);
    });

    // C. Daily Mood Tracker (LocalStorage)
    $(".mood-btn").on("click", function () {
        const selectedMood = $(this).data("mood");
        const today = new Date().toLocaleDateString();

        localStorage.setItem("studely_daily_mood", JSON.stringify({ mood: selectedMood, date: today }));
        $("#moodOutput").html(`Recorded for today: <strong>${selectedMood}</strong>`).fadeIn();
    });

    // Load saved mood if recorded today
    const savedMood = JSON.parse(localStorage.getItem("studely_daily_mood"));
    if (savedMood && savedMood.date === new Date().toLocaleDateString()) {
        $("#moodOutput").html(`Recorded for today: <strong>${savedMood.mood}</strong>`).show();
    }
});