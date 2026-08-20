const items = [
  { name: "생수 (500ml)", perPerson: 2 },
  { name: "종이컵", perPerson: 3 },
  { name: "물티슈 (팩)", perPerson: 0.2 },
  { name: "쓰레기봉투 (장)", perPerson: 0.5 },
  { name: "고기 (인분)", perPerson: 1.5 },
  { name: "일회용 접시", perPerson: 2 },
];

document.getElementById("calcBtn").addEventListener("click", () => {
  const headcount = Number(document.getElementById("headcount").value);

  if (!headcount || headcount < 1) {
    alert("참여 인원을 1명 이상 입력해 주세요.");
    return;
  }

  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";

  items.forEach((item) => {
    const qty = Math.ceil(item.perPerson * headcount);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.name}</td><td>${qty}</td>`;
    tbody.appendChild(row);
  });

  document.getElementById("resultTable").hidden = false;
});