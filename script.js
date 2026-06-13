const API = 'https://arena-server-c8xo.onrender.com';

const StorageManager = {
  getUsers() {
    return JSON.parse(localStorage.getItem('arena_users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('arena_users', JSON.stringify(users));
  },
  addUser(username, password) {
    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'اسم المستخدم موجود بالفعل' };
    }
    users.push({ username, password, role: 'user', canViewResults: 0 });
    this.saveUsers(users);
    return { success: true };
  },
  async authenticate(username, password) {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) return { success: true, user: data.user };
    } catch (e) { console.warn("Server login failed, trying local..."); }

    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return { success: true, user };
    return { success: false };
  }
};

if (!localStorage.getItem('arena_users')) {
  StorageManager.saveUsers([{ username: 'omar', password: '123456', role: 'admin', canViewResults: 1 }]);
}

window.APP = new Vue({
  el: '#app',
  data: {
    username: '',
    mousePos: { x: 0, y: 0 }
  },
  computed: {
    eye() { 
      let l = this.username.length; 
      let x = Math.min(l, 33); 
      let y = l < 18 ? x * 0.2 : (36 - x) * 0.2; 
      return { x: -26 + (x * 0.3), y: y }; 
    },
    facial() { 
      let l = this.username.length; 
      let x = Math.min(l, 33); 
      let y = l < 18 ? -6 + (x * 0.2) : -6 + ((36 - x) * 0.2); 
      return { x: -12 + (x * 0.3), y: y }; 
    }
  },
  methods: {
    async handleLogin() {
        const password = document.getElementById("password").value;
        const btn = document.querySelector(".login-btn");
        if (btn) { btn.disabled = true; btn.innerText = "جاري التحقق..."; }

        try {
            const result = await StorageManager.authenticate(this.username, password);
            if (result.success) {
                showSuccess(this.username);
                sessionStorage.setItem("arena_user", JSON.stringify(result.user));
                setTimeout(() => { window.location.href = "dashboard/index.html"; }, 2200);
            } else {
                showError("اسم المستخدم أو كلمة المرور غير صحيحة");
                if (btn) { btn.disabled = false; btn.innerText = "تسجيل الدخول"; }
            }
        } catch (err) {
            alert("حدث خطأ في النظام.");
            if (btn) { btn.disabled = false; btn.innerText = "تسجيل الدخول"; }
        }
    }
  }
});

function openRegisterModal() { document.getElementById('registerModal').classList.add('show'); }
function closeRegisterModal() { document.getElementById('registerModal').classList.remove('show'); }

async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const code = document.getElementById('reg-code').value.trim();
    const msg = document.getElementById('reg-msg');

    if (!username || !password || !code) { msg.innerText = "⚠️ يرجى ملء جميع الحقول"; return; }
    if (code !== "Arena2026") { msg.innerText = "❌ كود التوثيق غير صحيح"; return; }

    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
          StorageManager.addUser(username, password);
          msg.innerText = "✅ تم إنشاء الحساب بنجاح!";
          setTimeout(() => { closeRegisterModal(); }, 1500);
      } else { msg.innerText = "❌ " + data.message; }
    } catch (e) {
      const result = StorageManager.addUser(username, password);
      if (result.success) { msg.innerText = "✅ تم إنشاء الحساب محلياً"; setTimeout(() => { closeRegisterModal(); }, 1500); }
      else { msg.innerText = "❌ " + result.message; }
    }
}

function showSuccess(name) {
    const overlay = document.getElementById("successOverlay");
    const progress = document.getElementById("progressBar");
    if (overlay) overlay.classList.add("show");
    if (progress) setTimeout(() => { progress.style.width = "100%"; }, 50);
}

function showError(msg) {
    const errorMsg = document.getElementById("emailError");
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
        errorMsg.style.color = "#ef4444";
        setTimeout(() => { errorMsg.innerText = ""; }, 3000);
    } else { alert(msg); }
}
