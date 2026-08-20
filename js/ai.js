document.getElementById("generateBtn").addEventListener("click", () => {
  const headcount = document.getElementById("headcount").value;
  const budget = document.getElementById("budget").value;
  const statusMsg = document.getElementById("statusMsg");

  // 1) 빈 입력 검증 (필수값)
  if (!headcount || !budget) {
    statusMsg.hidden = false;
    statusMsg.textContent = "인원과 1인 예산을 입력해 주세요.";
    statusMsg.className = "status-msg error";
    return;
  }

  // TODO: 3단계에서 실제 /api/generate 호출로 교체 예정
  statusMsg.hidden = false;
  statusMsg.textContent = "(임시) 아직 AI 연동 전이에요. 다음 단계에서 연결할 거예요.";
  statusMsg.className = "status-msg";
});