(function() {
  // ===== MATRIX RAIN EFFECT =====
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let columns;
  let drops;
  const fontSize = 16;
  const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZɃ₿ĐɆⱧł₦Ɇ₮ⱧɆⱤ".split("");

  function initMatrix() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize) + 1;
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px "Share Tech Mono", "VT323", monospace';
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 8;

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(char, x, y);
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    ctx.shadowBlur = 0;
  }

  initMatrix();
  window.addEventListener('resize', initMatrix);
  setInterval(drawMatrix, 45);

  // ===== DOM ELEMENTS =====
  const formPanel = document.getElementById('formPanel');
  const goToRegister = document.getElementById('goToRegister');
  const goToLogin = document.getElementById('goToLogin');
  const messageBox = document.getElementById('messageBox');
  const loginAttemptDisplay = document.getElementById('loginAttemptDisplay');

  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const regUsername = document.getElementById('regUsername');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirm = document.getElementById('regConfirm');

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Login attempt counter (giới hạn 5 lần)
  let loginAttempts = 0;
  const MAX_ATTEMPTS = 5;
  let lockoutTimer = null;

  // ===== UTILS =====
  function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.className = 'message-box' + (isError ? ' error-message' : '');
  }

  function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message-box';
  }

  function updateAttemptDisplay() {
    if (loginAttempts > 0) {
      loginAttemptDisplay.textContent = `[!] Lần thử: ${loginAttempts}/${MAX_ATTEMPTS}`;
      loginAttemptDisplay.style.color = loginAttempts >= MAX_ATTEMPTS ? '#ff4444' : '#0a0';
    } else {
      loginAttemptDisplay.textContent = '';
    }
  }

  function resetLoginAttempts() {
    loginAttempts = 0;
    updateAttemptDisplay();
    if (lockoutTimer) clearTimeout(lockoutTimer);
    lockoutTimer = null;
    // Kích hoạt lại nút đăng nhập nếu bị khóa
    const loginBtn = loginForm.querySelector('.hacker-btn');
    if (loginBtn) loginBtn.disabled = false;
  }

  function incrementLoginAttempts() {
    loginAttempts++;
    updateAttemptDisplay();
    if (loginAttempts >= MAX_ATTEMPTS) {
      showMessage(`[!] Quá ${MAX_ATTEMPTS} lần thử sai. Tạm khóa 30 giây.`, true);
      const loginBtn = loginForm.querySelector('.hacker-btn');
      if (loginBtn) loginBtn.disabled = true;
      // Tự động mở khóa sau 30s
      lockoutTimer = setTimeout(() => {
        resetLoginAttempts();
        showMessage('[✔] Đã mở khóa. Có thể thử lại.', false);
      }, 30000);
    }
  }

  // Hiệu ứng loading nút
  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('button-loading');
      // Thêm spinner nếu chưa có
      if (!button.querySelector('.spinner')) {
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        button.prepend(spinner);
      }
      // Lưu text gốc
      button.dataset.originalText = button.innerHTML;
    } else {
      button.disabled = false;
      button.classList.remove('button-loading');
      const spinner = button.querySelector('.spinner');
      if (spinner) spinner.remove();
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  // ===== CHUYỂN ĐỔI FORM =====
  goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    formPanel.classList.add('register-active');
    clearMessage();
    resetLoginAttempts();
    setTimeout(() => regUsername.focus(), 200);
  });

  goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    formPanel.classList.remove('register-active');
    clearMessage();
    setTimeout(() => loginUsername.focus(), 200);
  });

  // ===== XỬ LÝ ĐĂNG NHẬP =====
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Kiểm tra khóa
    if (loginAttempts >= MAX_ATTEMPTS) {
      showMessage('[!] Tài khoản đang bị khóa tạm thời. Vui lòng chờ.', true);
      return;
    }

    const user = loginUsername.value.trim();
    const pass = loginPassword.value.trim();

    if (!user || !pass) {
      showMessage('[!] Vui lòng nhập đầy đủ thông tin.', true);
      return;
    }

    // Giả lập loading
    const loginBtn = loginForm.querySelector('.hacker-btn');
    setButtonLoading(loginBtn, true);

    // Giả lập delay mạng
    setTimeout(() => {
      setButtonLoading(loginBtn, false);

      const storedUsers = JSON.parse(localStorage.getItem('hacker_users')) || [];
      const foundUser = storedUsers.find(u => u.username === user && u.password === pass);

      if (foundUser) {
        showMessage('✅ Đăng nhập thành công! Chào mừng ' + user + ' quay trở lại.', false);
        resetLoginAttempts();
        // Xóa input
        loginUsername.value = '';
        loginPassword.value = '';
        // Có thể chuyển hướng (demo)
      } else {
        incrementLoginAttempts();
        const userExists = storedUsers.some(u => u.username === user);
        if (userExists) {
          showMessage('[!] Sai mật khẩu. Vui lòng thử lại.', true);
        } else {
          showMessage('[!] Tài khoản không tồn tại. Hãy đăng ký.', true);
        }
        // Rung nhẹ form đăng nhập
        const loginPanel = document.querySelector('.login-form');
        loginPanel.style.animation = 'none';
        loginPanel.offsetHeight; // trigger reflow
        loginPanel.style.animation = 'shake 0.4s ease';
        setTimeout(() => { loginPanel.style.animation = ''; }, 400);
      }
    }, 800);
  });

  // ===== XỬ LÝ ĐĂNG KÝ =====
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const confirm = regConfirm.value.trim();

    if (!username || !email || !password || !confirm) {
      showMessage('[!] Tất cả các trường đều bắt buộc.', true);
      return;
    }
    if (password.length < 6) {
      showMessage('[!] Mật khẩu phải có ít nhất 6 ký tự.', true);
      return;
    }
    if (password !== confirm) {
      showMessage('[!] Xác nhận mật khẩu không khớp.', true);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showMessage('[!] Email không hợp lệ.', true);
      return;
    }

    const regBtn = registerForm.querySelector('.hacker-btn');
    setButtonLoading(regBtn, true);

    setTimeout(() => {
      setButtonLoading(regBtn, false);
      const storedUsers = JSON.parse(localStorage.getItem('hacker_users')) || [];
      const userExists = storedUsers.some(u => u.username === username);
      const emailExists = storedUsers.some(u => u.email === email);

      if (userExists) {
        showMessage('[!] Tên đặc vụ đã tồn tại.', true);
        return;
      }
      if (emailExists) {
        showMessage('[!] Email này đã được đăng ký.', true);
        return;
      }

      storedUsers.push({ username, email, password });
      localStorage.setItem('hacker_users', JSON.stringify(storedUsers));

      showMessage('🎉 Đăng ký thành công! Đang chuyển về đăng nhập...', false);
      regUsername.value = '';
      regEmail.value = '';
      regPassword.value = '';
      regConfirm.value = '';

      setTimeout(() => {
        formPanel.classList.remove('register-active');
        clearMessage();
        loginUsername.focus();
      }, 1500);
    }, 700);
  });

  // ===== KHỞI TẠO =====
  console.log("%c👾 HACKER TERMINAL ACTIVATED %c| %cĐăng nhập & Đăng ký sẵn sàng",
    "color: #0f0; font-size: 16px;", "", "color: #aaa;");
  console.log("%c▸ Dữ liệu lưu cục bộ (localStorage). Giới hạn " + MAX_ATTEMPTS + " lần đăng nhập sai.",
    "color: #0f0;");
})();
