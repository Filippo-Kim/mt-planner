document.getElementById("generateBtn").addEventListener("click", async () => {
  const eventType = document.getElementById("eventType").value;
  const headcount = document.getElementById("headcount").value;
  const duration = document.getElementById("duration").value;
  const budget = document.getElementById("budget").value;
  const notes = document.getElementById("notes").value;

  const statusMsg = document.getElementById("statusMsg");
  const resultBox = document.getElementById("resultBox");
  const btn = document.getElementById("generateBtn");

  resultBox.hidden = true;
  statusMsg.hidden = false;

  // 1) 빈 입력 검증
  if (!headcount || !budget) {
    statusMsg.textContent = "인원과 1인 예산을 입력해 주세요.";
    statusMsg.className = "status-msg error";
    return;
  }

  statusMsg.textContent = "기획안을 만들고 있어요...";
  statusMsg.className = "status-msg";
  btn.disabled = true;

  // 2) 타임아웃 처리 (55초)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, headcount, duration, budget, notes }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      statusMsg.textContent = err.error || "요청 중 문제가 발생했어요.";
      statusMsg.className = "status-msg error";
      return;
    }

    const plan = await res.json();
    renderPlan(plan);
    statusMsg.hidden = true;

  } catch (e) {
    if (e.name === "AbortError") {
      statusMsg.textContent = "응답이 지연되고 있어요. 다시 시도해 주세요.";
    } else {
      statusMsg.textContent = "네트워크 오류가 발생했어요. 다시 시도해 주세요.";
    }
    statusMsg.className = "status-msg error";
  } finally {
    btn.disabled = false;
  }
});

function renderPlan(plan) {
  const box = document.getElementById("resultBox");

  let html = "<h2>🗓️ 타임테이블</h2><ul>";
  (plan.timetable || []).forEach((t) => {
    html += `<li><strong>${t.time}</strong> — ${t.activity}</li>`;
  });
  html += "</ul>";

  html += "<h2>🎒 준비물</h2><ul>";
  (plan.supplies || []).forEach((s) => {
    html += `<li>${s.item} × ${s.quantity} (약 ${s.estimatedPrice})</li>`;
  });
  html += "</ul>";

  html += "<h2>💰 예산 배분</h2><ul>";
  (plan.budget || []).forEach((b) => {
    html += `<li>${b.category}: ${b.amount}</li>`;
  });
  html += `</ul><p><strong>총 예산: ${plan.totalBudget || "-"}</strong></p>`;

  box.innerHTML = html;
  box.hidden = false;
}