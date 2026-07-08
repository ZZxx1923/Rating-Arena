const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const btn = form.querySelector(".login-btn");

    if (btn) {
        btn.disabled = true;
        btn.innerText = "Authenticating...";
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.text();

        if (result === "تم تسجيل الدخول") {
            showSuccess(username);
            setTimeout(() => {
                sessionStorage.setItem("arena_user", username);
                window.location.href = "dashboard/index.html";
            }, 2200);

        } else {
            alert("Invalid credentials. Please try again.");
            resetBtn(btn);
        }

    } catch (err) {
        alert("Server connection failed.");
        resetBtn(btn);
    }
});

function resetBtn(btn) {
    if (btn) {
        btn.disabled = false;
        btn.innerText = "Sign In";
    }
}

function showSuccess(name) {
    const overlay = document.getElementById("successOverlay");
    const userSpan = document.getElementById("successUser");
    const progress = document.getElementById("progressBar");

    if (userSpan) userSpan.innerText = `Welcome back, ${name}!`;
    if (overlay) overlay.classList.add("show");
    if (progress) {
        setTimeout(() => {
            progress.style.width = "100%";
        }, 50);
    }
}
