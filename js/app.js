const KEYS = {
  users: "quiz_users",
  exams: "quiz_exams",
  results: "quiz_results",
  currentUser: "quiz_current_user"
};

function get(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function set(key, value) { sessionStorage.setItem(key, JSON.stringify(value)); }
function uid(prefix="id") { return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2,7); }

function seed() {
  if (!sessionStorage.getItem(KEYS.users)) {
    set(KEYS.users, [{ id:"admin_1", username:"admin", password:"admin123", role:"admin", name:"Administrator" }]);
  }
  if (!sessionStorage.getItem(KEYS.exams)) {
    set(KEYS.exams, [{
      id:"exam_default", title:"Servlet & Java Fundamentals", description:"20-question practice exam covering core Java and Java Servlets.",
      questions: DEFAULT_QUESTIONS.map(q => ({...q}))
    }]);
  }
  if (!sessionStorage.getItem(KEYS.results)) set(KEYS.results, []);
}

function toast(message, type="success") {
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0 show`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

function currentUser() { return get(KEYS.currentUser, null); }
function logout() { sessionStorage.removeItem(KEYS.currentUser); renderLogin(); }

function renderLogin() {
  document.getElementById("app").innerHTML = `
  <div class="login-wrap">
    <div class="card login-card p-4 p-md-5 fade">
      <div class="text-center mb-4">
        <div class="display-5 fw-bold"><i class="bi bi-mortarboard-fill"></i></div>
        <h2 class="fw-bold mt-2">Servlet & Java Quiz</h2>
        <p class="text-secondary mb-0">Bootstrap + JavaScript + sessionStorage</p>
      </div>
      <div class="alert alert-light border">
        <strong>Default admin:</strong> admin / admin123
      </div>
      <form id="loginForm">
        <div class="mb-3"><label class="form-label">Username</label><input id="username" class="form-control" required></div>
        <div class="mb-3"><label class="form-label">Password</label><input id="password" type="password" class="form-control" required></div>
        <button class="btn btn-dark w-100 py-2"><i class="bi bi-box-arrow-in-right"></i> Login</button>
      </form>
      <div class="small text-secondary mt-3 text-center">Students are created by the admin.</div>
    </div>
  </div>`;
  document.getElementById("loginForm").onsubmit = e => {
    e.preventDefault();
    const u = get(KEYS.users, []).find(x => x.username === username.value.trim() && x.password === password.value);
    if (!u) return toast("Invalid username or password.", "danger");
    set(KEYS.currentUser, u);
    renderApp();
  };
}

function shell(title, content) {
  const u = currentUser();
  document.getElementById("app").innerHTML = `
  <nav class="navbar navbar-dark bg-dark shadow-sm">
    <div class="container">
      <span class="navbar-brand"><i class="bi bi-mortarboard-fill me-2"></i>${title}</span>
      <div class="d-flex align-items-center gap-2 text-white">
        <span class="small d-none d-sm-inline">${u.name || u.username} · ${u.role}</span>
        <button id="logoutBtn" class="btn btn-outline-light btn-sm"><i class="bi bi-box-arrow-right"></i> Logout</button>
      </div>
    </div>
  </nav>
  <main class="container py-4 up">${content}</main>`;
  document.getElementById("logoutBtn").onclick = logout;
}

function renderApp() {
  const u = currentUser();
  if (!u) return renderLogin();
  u.role === "admin" ? renderAdmin() : renderStudent();
}

function renderAdmin() {
  const users = get(KEYS.users, []);
  const exams = get(KEYS.exams, []);
  const results = get(KEYS.results, []);
  shell("Admin Dashboard", `
    <div class="hero p-4 p-md-5 mb-4">
      <div class="row align-items-center">
        <div class="col-md-8"><h1 class="fw-bold">Admin Dashboard</h1><p class="mb-0 opacity-75">Manage students, exams, questions and results.</p></div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0"><span class="badge text-bg-light">Admin authenticated</span></div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-md-4"><div class="card stat-card p-4"><i class="bi bi-people-fill"></i><h3 class="mt-2">${users.filter(u=>u.role==="student").length}</h3><div class="text-secondary">Students</div></div></div>
      <div class="col-md-4"><div class="card stat-card p-4"><i class="bi bi-journal-text"></i><h3 class="mt-2">${exams.length}</h3><div class="text-secondary">Exams</div></div></div>
      <div class="col-md-4"><div class="card stat-card p-4"><i class="bi bi-bar-chart-fill"></i><h3 class="mt-2">${results.length}</h3><div class="text-secondary">Attempts</div></div></div>
    </div>
    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card p-4 h-100">
          <h4><i class="bi bi-person-plus-fill me-2"></i>Create Student</h4>
          <form id="studentForm" class="mt-3">
            <input id="studentName" class="form-control mb-2" placeholder="Student name" required>
            <input id="studentUsername" class="form-control mb-2" placeholder="Username" required>
            <input id="studentPassword" class="form-control mb-3" placeholder="Password" required>
            <button class="btn btn-primary w-100">Create Student</button>
          </form>
          <hr>
          <h5>Students</h5>
          <div class="list-group mt-2">${users.filter(u=>u.role==="student").map(s=>`
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <span><strong>${escapeHtml(s.name)}</strong><br><small>${escapeHtml(s.username)}</small></span>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}')"><i class="bi bi-trash"></i></button>
            </div>`).join("") || '<div class="text-secondary">No students yet.</div>'}</div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0"><i class="bi bi-journal-plus me-2"></i>Manage Exams</h4>
            <button class="btn btn-dark" onclick="showExamEditor()"><i class="bi bi-plus-lg"></i> Create Exam</button>
          </div>
          <div id="examEditor"></div>
          <div class="list-group">${exams.map(e=>`
            <div class="list-group-item p-3 d-flex justify-content-between align-items-center">
              <div><strong>${escapeHtml(e.title)}</strong><br><small>${e.questions.length} questions · ${escapeHtml(e.description||"")}</small></div>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="showExamEditor('${e.id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExam('${e.id}')">Delete</button>
              </div>
            </div>`).join("")}</div>
        </div>
      </div>
    </div>
    <div class="card p-4 mt-4">
      <h4><i class="bi bi-bar-chart-line-fill me-2"></i>Results</h4>
      <div class="table-responsive"><table class="table">
        <thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Date</th></tr></thead>
        <tbody>${results.map(r=>`<tr><td>${escapeHtml(r.studentName)}</td><td>${escapeHtml(r.examTitle)}</td><td>${r.score}/${r.total}</td><td>${new Date(r.date).toLocaleString()}</td></tr>`).join("") || '<tr><td colspan="4" class="text-secondary">No attempts yet.</td></tr>'}</tbody>
      </table></div>
    </div>`);

  document.getElementById("studentForm").onsubmit = e => {
    e.preventDefault();
    const users = get(KEYS.users, []);
    if (users.some(u=>u.username === studentUsername.value.trim())) return toast("Username already exists.", "danger");
    users.push({id:uid("stu"), name:studentName.value.trim(), username:studentUsername.value.trim(), password:studentPassword.value, role:"student"});
    set(KEYS.users, users);
    toast("Student created successfully.");
    renderAdmin();
  };
}

window.deleteStudent = function(id) {
  if (!confirm("Delete this student?")) return;
  set(KEYS.users, get(KEYS.users, []).filter(u=>u.id!==id));
  toast("Student deleted.");
  renderAdmin();
};

window.deleteExam = function(id) {
  if (!confirm("Delete this exam?")) return;
  set(KEYS.exams, get(KEYS.exams, []).filter(e=>e.id!==id));
  toast("Exam deleted.");
  renderAdmin();
};

window.showExamEditor = function(id) {
  const existing = id ? get(KEYS.exams, []).find(e=>e.id===id) : {id:"", title:"", description:"", questions:DEFAULT_QUESTIONS.map(q=>({...q}))};
  const qHtml = existing.questions.map((q,i)=>`
    <div class="border rounded-4 p-3 mb-3 question-edit" data-index="${i}">
      <div class="d-flex justify-content-between"><strong>Question ${i+1}</strong><button type="button" class="btn btn-sm btn-outline-danger remove-q">Remove</button></div>
      <input class="form-control mt-2 q-text" value="${escapeAttr(q.text)}" placeholder="Question">
      ${q.options.map((o,j)=>`<div class="option-row mt-2"><input type="radio" name="correct${i}" class="q-correct" ${q.answer===j?"checked":""}><input class="form-control q-opt" value="${escapeAttr(o)}" placeholder="Option ${j+1}"></div>`).join("")}
    </div>`).join("");
  document.getElementById("examEditor").innerHTML = `
    <div class="card border bg-light p-3 mb-3 pop">
      <form id="examForm">
        <input type="hidden" id="editExamId" value="${existing.id}">
        <input id="examTitle" class="form-control mb-2" value="${escapeAttr(existing.title)}" placeholder="Exam title" required>
        <textarea id="examDescription" class="form-control mb-3" placeholder="Description">${escapeHtml(existing.description||"")}</textarea>
        <div id="questionEditor">${qHtml}</div>
        <div class="d-flex gap-2 flex-wrap">
          <button type="button" id="addQuestion" class="btn btn-outline-secondary">+ Add Question</button>
          <button class="btn btn-primary">Save Exam</button>
          <button type="button" class="btn btn-outline-dark" onclick="document.getElementById('examEditor').innerHTML=''">Cancel</button>
        </div>
      </form>
    </div>`;
  document.querySelectorAll(".remove-q").forEach(btn => btn.onclick = () => btn.closest(".question-edit").remove());
  document.getElementById("addQuestion").onclick = () => {
    const i = document.querySelectorAll(".question-edit").length;
    const box = document.createElement("div");
    box.className = "border rounded-4 p-3 mb-3 question-edit";
    box.innerHTML = `<div class="d-flex justify-content-between"><strong>Question ${i+1}</strong><button type="button" class="btn btn-sm btn-outline-danger remove-q">Remove</button></div>
      <input class="form-control mt-2 q-text" placeholder="Question">
      ${[1,2,3,4].map((_,j)=>`<div class="option-row mt-2"><input type="radio" name="correct${i}" class="q-correct" ${j===0?"checked":""}><input class="form-control q-opt" placeholder="Option ${j+1}"></div>`).join("")}`;
    box.querySelector(".remove-q").onclick = () => box.remove();
    document.getElementById("questionEditor").appendChild(box);
  };
  document.getElementById("examForm").onsubmit = e => {
    e.preventDefault();
    const qs = [...document.querySelectorAll(".question-edit")].map(box => {
      const opts = [...box.querySelectorAll(".q-opt")].map(x=>x.value.trim());
      const correct = [...box.querySelectorAll(".q-correct")].findIndex(x=>x.checked);
      return {text:box.querySelector(".q-text").value.trim(), options:opts, answer:correct < 0 ? 0 : correct};
    }).filter(q=>q.text && q.options.length>=2);
    if (!qs.length) return toast("Add at least one valid question.", "danger");
    const exams = get(KEYS.exams, []);
    const data = {id:document.getElementById("editExamId").value || uid("exam"), title:examTitle.value.trim(), description:examDescription.value.trim(), questions:qs};
    const idx = exams.findIndex(x=>x.id===data.id);
    if (idx >= 0) exams[idx]=data; else exams.push(data);
    set(KEYS.exams, exams);
    toast("Exam saved.");
    renderAdmin();
  };
};

function renderStudent() {
  const u = currentUser();
  const exams = get(KEYS.exams, []);
  const results = get(KEYS.results, []).filter(r=>r.studentId===u.id);
  shell("Student Dashboard", `
    <div class="hero p-4 p-md-5 mb-4">
      <h1 class="fw-bold">Welcome, ${escapeHtml(u.name || u.username)}!</h1>
      <p class="mb-0 opacity-75">Choose an exam and test your Servlet & Java knowledge.</p>
    </div>
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card p-4">
          <h4 class="mb-3">Available Exams</h4>
          <div class="row g-3">${exams.map(e=>`
            <div class="col-md-6"><div class="card border p-3 h-100">
              <h5>${escapeHtml(e.title)}</h5><p class="text-secondary small">${escapeHtml(e.description||"")}</p>
              <div class="mt-auto"><span class="badge text-bg-light mb-2">${e.questions.length} Questions</span><br>
              <button class="btn btn-primary w-100" onclick="startQuiz('${e.id}')">Start Quiz</button></div>
            </div></div>`).join("") || '<div class="text-secondary">No exams available.</div>'}</div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card p-4"><h5>My Attempts</h5>${results.map(r=>`
          <div class="border-bottom py-2"><strong>${escapeHtml(r.examTitle)}</strong><br><small>${r.score}/${r.total} · ${new Date(r.date).toLocaleString()}</small></div>
        `).join("") || '<div class="text-secondary">No attempts yet.</div>'}</div>
      </div>
    </div>`);
}

let quizState = null;

window.startQuiz = function(examId) {
  const exam = get(KEYS.exams, []).find(e=>e.id===examId);
  if (!exam) return;
  quizState = {exam, index:0, answers:Array(exam.questions.length).fill(null)};
  renderQuestion();
};

function renderQuestion() {
  const q = quizState.exam.questions[quizState.index];
  const selected = quizState.answers[quizState.index];
  const total = quizState.exam.questions.length;
  const pct = Math.round((quizState.index/total)*100);
  shell("Quiz", `
    <div class="d-flex justify-content-between align-items-center mb-2"><span>Question ${quizState.index+1} of ${total}</span><span>${pct}%</span></div>
    <div class="progress mb-4"><div class="progress-bar" style="width:${pct}%"></div></div>
    <div class="card p-4 p-md-5 fade">
      <h3 class="fw-bold mb-4">${escapeHtml(q.text)}</h3>
      <div class="d-grid gap-3">${q.options.map((o,i)=>`
        <div class="question-option ${selected===i?"selected":""}" onclick="chooseAnswer(${i})">
          <div class="form-check m-0"><input class="form-check-input" type="radio" name="answer" ${selected===i?"checked":""}><label class="form-check-label w-100">${escapeHtml(o)}</label></div>
        </div>`).join("")}</div>
      <div class="d-flex justify-content-between mt-4 sticky-actions">
        <button class="btn btn-outline-secondary" ${quizState.index===0?"disabled":""} onclick="prevQuestion()">Previous</button>
        ${quizState.index===total-1
          ? '<button class="btn btn-success" onclick="submitQuiz()">Submit Quiz</button>'
          : '<button class="btn btn-primary" onclick="nextQuestion()">Next</button>'}
      </div>
    </div>`);
}

window.chooseAnswer = function(i) { quizState.answers[quizState.index]=i; renderQuestion(); };
window.prevQuestion = function() { if(quizState.index>0){quizState.index--;renderQuestion();} };
window.nextQuestion = function() { if(quizState.answers[quizState.index]===null) return toast("Please select an answer.", "warning"); if(quizState.index<quizState.exam.questions.length-1){quizState.index++;renderQuestion();} };

window.submitQuiz = function() {
  if (quizState.answers.includes(null)) return toast("Please answer all questions before submitting.", "warning");
  const score = quizState.exam.questions.reduce((sum,q,i)=>sum+(q.answer===quizState.answers[i]?1:0),0);
  const u = currentUser();
  const results = get(KEYS.results, []);
  results.push({id:uid("result"), studentId:u.id, studentName:u.name||u.username, examId:quizState.exam.id, examTitle:quizState.exam.title, score, total:quizState.exam.questions.length, date:new Date().toISOString()});
  set(KEYS.results, results);
  document.getElementById("app").innerHTML = `
    <div class="login-wrap"><div class="card p-5 text-center pop" style="max-width:560px;width:100%">
      <div class="display-3 mb-3">${score >= quizState.exam.questions.length*.7 ? "🏆" : "📚"}</div>
      <h1 class="fw-bold">Quiz Complete!</h1>
      <p class="text-secondary">${escapeHtml(quizState.exam.title)}</p>
      <div class="display-5 fw-bold">${score} / ${quizState.exam.questions.length}</div>
      <p class="mt-2">Score: ${Math.round(score/quizState.exam.questions.length*100)}%</p>
      <button class="btn btn-primary mt-3" onclick="renderStudent()">Back to Dashboard</button>
    </div></div>`;
};

function escapeHtml(s="") { return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
function escapeAttr(s="") { return escapeHtml(s); }

seed();
renderApp();
