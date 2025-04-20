let currentPage = 'coverPage';

const alwaysAllowedPages = ['coverPage', 'aboutPage'];

function unlockAndGo(pageId) {
  localStorage.setItem(pageId + '_unlocked', 'true');
  switchToPage(pageId);
}

function saveProgress() {
  const now = Date.now();
  localStorage.setItem("manualSave", JSON.stringify({
    username: localStorage.getItem("username"),
    score: localStorage.getItem("score"),
    page: currentPage,
    timestamp: now
  }));
  alert("✅ 進度已儲存！");
}
function switchToPage(pageId) {
  if (!alwaysAllowedPages.includes(pageId) && localStorage.getItem(pageId + '_unlocked') !== 'true') {
    alert("請先完成上一段內容！");
    return;
  }

  const currentSection = document.getElementById(currentPage);
  const nextSection = document.getElementById(pageId);

  // 加入淡出動畫
  currentSection.classList.add("fade-out");

  setTimeout(() => {
    currentSection.style.display = "none";
    currentSection.classList.remove("fade-out");

    // 顯示新頁面，加入淡入動畫
    nextSection.style.display = "block";
    nextSection.classList.add("fade-in");

    // 移除淡入動畫 class，避免影響之後切換
    setTimeout(() => {
      nextSection.classList.remove("fade-in");
    }, 500);

    currentPage = pageId;

    // ✅ 保留你原本的 summaryPage 更新邏輯
    if (pageId === 'summaryPage') {
      document.getElementById("summaryName").innerText = localStorage.getItem("username");
      document.getElementById("summaryScore").innerText = localStorage.getItem("score");
    }

  }, 300); // 配合 CSS 動畫時間
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("show");
}

function startGame() {
  const name = document.getElementById("nameInput").value;
  if (!name) {
    alert("請輸入你的名字！");
    return;
  }
  localStorage.setItem("username", name);
  localStorage.setItem("score", "0");
  localStorage.setItem("passage1_unlocked", "true");
  document.getElementById("usernameDisplay").innerText = name;
  document.getElementById("scoreDisplay").innerText = "0";
  alert("歡迎 " + name + "，開始進入遊戲！");
  switchToPage("passage1");
}
if (performance.getEntriesByType("navigation")[0].type === "reload") {
  restartGame();
}
window.onload = function () {

  const name = localStorage.getItem("username");
  const score = localStorage.getItem("score") || "0";
  if (name && document.getElementById("usernameDisplay")) {
    document.getElementById("usernameDisplay").innerText = name;
  }
  if (document.getElementById("scoreDisplay")) {
    document.getElementById("scoreDisplay").innerText = score;
  }

  // ✅ 自動鎖定已答過的題目按鈕（只鎖 .answer-btn）
  const visibleSection = Array.from(document.querySelectorAll("section"))
    .find(sec => sec.style.display !== 'none');

  if (visibleSection && visibleSection.id.includes("question")) {
    if (localStorage.getItem(visibleSection.id + '_answered') === 'true') {
      const btns = visibleSection.querySelectorAll(".answer-btn");
      btns.forEach(b => b.disabled = true);
    }
  }
};

function goPrevPage() {
  const pages = getOrderedPages();
  const index = pages.indexOf(currentPage);
  if (index > 0) {
    switchToPage(pages[index - 1]);
  }
}

function goNextPage() {
  const pages = getOrderedPages();
  const index = pages.indexOf(currentPage);
  if (index < pages.length - 1) {
    switchToPage(pages[index + 1]);
  } else {
    alert("🎉 恭喜你已完成所有內容！");
    switchToPage('summaryPage'); // ✅ 加這行！
  }
}

function checkAnswer(button, correctAnswer, unlockNextPageId) {
  const section = button.closest('section');
  const sectionId = section.id;
  const feedback = section.querySelector(".feedback");



  // ✅ 答對的話加分 & 解鎖
  if (button.innerText === correctAnswer) {
    feedback.innerText = "✅ 恭喜答對了！加 25 分！";
    feedback.style.color = "green";

    let currentScore = parseInt(localStorage.getItem("score") || "0");
    currentScore += 25;
    localStorage.setItem("score", currentScore);
    document.getElementById("scoreDisplay").innerText = currentScore;

  } else {
    feedback.innerText = "❌ 答錯了";
    feedback.style.color = "orange";
  }

  // 無論答對或答錯，都解鎖下一頁 & 記錄已答題
  localStorage.setItem(sectionId + '_answered', 'true');
  if (unlockNextPageId) {
    localStorage.setItem(unlockNextPageId + '_unlocked', 'true');
  }

  // 禁用按鈕
  const allButtons = button.parentElement.querySelectorAll(".answer-btn");
  allButtons.forEach(btn => btn.disabled = true);
}


function restartGame() {
  if (confirm("確定要重新開始嗎？")) {
    localStorage.clear();
    location.href = "index.html";
  }
}



function getOrderedPages() {
  return [
    'coverPage',
    'passage1',
    'question1',
    'passage2',
    'question2',
    'passage3',
    'question3',
    'passage4',
    'question4',
  ];
}
