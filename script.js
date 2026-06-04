// متغيرات عامة لتتبع الماوس
let mouseX = 0, mouseY = 0;

// نظام LocalStorage للمستخدمين
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
  authenticate(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return { success: true, user };
    }
    return { success: false };
  }
};

// تهيئة المستخدمين الافتراضيين
if (!localStorage.getItem('arena_users')) {
  StorageManager.saveUsers([
    { username: 'omar', password: '123456', role: 'admin', canViewResults: 1 }
  ]);
}

window.APP = new Vue({
  el: '#app',
  data: {
    username: '',
    mousePos: { x: 0, y: 0 }
  },
  
  computed: {
    eye () {
      let length = this.username.length;
      let x = 20;
      let y = 0;
      
      if (length > 0 && length < 33) {
        x = length;
      } else if (length >= 33) {
        x = 33;
      }
      
      if (length > 0 && length < 18) {
        y = x * 0.2;
      } else if (length >= 18) {
        y = (36 - x) * 0.2;
      }
      
      let mouseInfluence = Math.min(this.mousePos.x / 50, 10);
      x += mouseInfluence * 0.5;
      
      return { x: -26 + (x * 0.3), y: y };
    },
    
    facial () {
      let length = this.username.length;
      let x = 20;
      let y = -6;
      
      if (length > 0 && length < 33) {
        x = length;
      } else if (length >= 33) {
        x = 33;
      }
      
      if (length > 0 && length < 18) {
        y = -6 + (x * 0.2);
      } else if (length >= 18) {
        y = -6 + ((36 - x) * 0.2);
      }
      
      let mouseInfluence = Math.min(this.mousePos.x / 50, 10);
      x += mouseInfluence * 0.5;
      
      return { x: -12 + (x * 0.3), y: y };
    }
  },
  
  methods: {
    async handleLogin() {
        const password = document.getElementById("password").value;
        const btn = document.querySelector(".login-btn");

        if (btn) {
            btn.disabled = true;
            btn.innerText = "جاري التحقق...";
        }

        try {
            const result = StorageManager.authenticate(this.username, password);

            if (result.success) {
                showSuccess(this.username);
                setTimeout(() => {
                    sessionStorage.setItem("arena_user", JSON.stringify(result.user));
                    window.location.href = "dashboard/index.html";
                }, 2200);

            } else {
                showError("اسم المستخدم أو كلمة المرور غير صحيحة");
                this.resetBtn(btn);
            }

        } catch (err) {
            alert("حدث خطأ في النظام.");
            this.resetBtn(btn);
        }
    },
    resetBtn(btn) {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "تسجيل الدخول";
        }
    },
    updateMousePos(x, y) {
      this.mousePos = { x: x, y: y };
    }
  }
});

// Mouse Glow Effect Logic
let lastMouseMove = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseMove > 16) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const glow = document.getElementById('mouse-glow');
        if (glow) {
            glow.style.left = mouseX + 'px';
            glow.style.top = mouseY + 'px';
        }
        
        if (window.APP) {
            window.APP.updateMousePos(mouseX - window.innerWidth / 2, mouseY - window.innerHeight / 2);
        }
        
        lastMouseMove = now;
    }
});

// Register Modal Logic
function openRegisterModal() {
    document.getElementById('registerModal').classList.add('show');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('show');
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const code = document.getElementById('reg-code').value.trim();
    const msg = document.getElementById('reg-msg');

    if (!username || !password || !code) {
        msg.innerText = "⚠️ يرجى ملء جميع الحقول";
        msg.style.color = "#f59e0b";
        return;
    }

    const AUTH_CODE = "Arena2026"; 

    if (code !== AUTH_CODE) {
        msg.innerText = "❌ كود التوثيق غير صحيح";
        msg.style.color = "#ef4444";
        return;
    }

    const result = StorageManager.addUser(username, password);
    if (result.success) {
        msg.innerText = "✅ تم إنشاء الحساب وتوثيقه بنجاح!";
        msg.style.color = "#10b981";
        setTimeout(() => {
            closeRegisterModal();
            window.APP.username = username;
            document.getElementById('password').value = password;
        }, 1500);
    } else {
        msg.innerText = "❌ " + result.message;
        msg.style.color = "#ef4444";
    }
}

function showSuccess(name) {
    const overlay = document.getElementById("successOverlay");
    const userSpan = document.getElementById("successUser");
    const progress = document.getElementById("progressBar");

    if (userSpan) userSpan.innerText = `مرحباً بك مجدداً، ${name}!`;
    if (overlay) overlay.classList.add("show");
    if (progress) {
        setTimeout(() => {
            progress.style.width = "100%";
        }, 50);
    }
}

function showError(msg) {
    const errorMsg = document.getElementById("emailError");
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
        errorMsg.style.color = "#ef4444";
        errorMsg.style.fontSize = "12px";
        errorMsg.style.marginTop = "5px";
        
        setTimeout(() => {
            errorMsg.innerText = "";
        }, 3000);
    } else {
        alert(msg);
    }
}
