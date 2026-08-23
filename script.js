// farfalle — простой мини-сайт для заметок.
// Все данные о заметках хранятся в letters.json — чтобы добавить новую заметку,
// не нужно трогать HTML/JS: просто добавь новый объект в массив в letters.json.

async function loadLetters() {
  const res = await fetch("letters.json");
  return res.json();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

async function renderHome() {
  const list = document.getElementById("letter-list");
  if (!list) return;

  const letters = await loadLetters();

  if (!letters.length) {
    list.innerHTML = '<p class="home__empty">заметок пока нет.</p>';
    return;
  }

  // Новые заметки — сверху
  const sorted = [...letters].sort((a, b) => new Date(b.date) - new Date(a.date));

  list.innerHTML = sorted
    .map(
      (letter) => `
    <a class="letter-card" href="letter.html?id=${encodeURIComponent(letter.id)}">
      <div class="letter-card__paper">
        <span class="letter-card__title">${letter.title}</span>
        <p class="letter-card__excerpt">${letter.excerpt || ""}</p>
        <span class="letter-card__date">${formatDate(letter.date)}</span>
      </div>
    </a>
  `
    )
    .join("");
}

async function renderLetter() {
  const content = document.getElementById("letter-content");
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const letters = await loadLetters();
  const letter = letters.find((l) => l.id === id);

  if (!letter) {
    content.innerHTML = '<p class="letter__empty">заметка не найдена.</p>';
    return;
  }

  document.title = letter.title + " — farfalle";
  document.getElementById("letter-title").textContent = letter.title;

  const envelope = letter.cover
    ? `<div class="letter__envelope">
        <img class="letter__envelope-base" src="images/envelope.jpg" alt="" />
        <img class="letter__envelope-photo" src="${letter.cover}" alt="" />
      </div>`
    : "";

  content.innerHTML = envelope + letter.content
    .map((block) => {
      if (block.type === "image") {
        return `<div class="letter__block"><img class="letter__image" src="${block.src}" alt="${block.alt || ""}" /></div>`;
      }
      return `<div class="letter__block"><p class="letter__text">${escapeHtml(block.text)}</p></div>`;
    })
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderHome();
renderLetter();
