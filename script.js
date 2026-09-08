const statusEl = document.getElementById("certificateStatus");
const gridEl = document.getElementById("certificateGrid");

// PDF.js dipakai supaya PDF dirender sebagai gambar/canvas.
// Dengan cara ini browser tidak diarahkan ke file PDF sehingga tidak memicu download otomatis.
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function githubApiUrl() {
  const c = GITHUB_CONFIG;
  return `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${c.certificateFolder}?ref=${encodeURIComponent(c.branch)}`;
}

function rawUrl(path) {
  const c = GITHUB_CONFIG;
  return `https://raw.githubusercontent.com/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/${encodeURIComponent(c.branch)}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function prettyName(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function isSupported(filename) {
  return /\.(png|jpe?g|webp|gif|pdf)$/i.test(filename);
}

function fileType(filename) {
  return /\.pdf$/i.test(filename) ? "pdf" : "image";
}

async function fetchPdf(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error(`PDF gagal diambil (${response.status})`);
  return response.arrayBuffer();
}

async function renderPdfPage(pdfData, canvas, scale = 1.35) {
  if (!window.pdfjsLib) throw new Error("PDF.js belum termuat.");

  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const ctx = canvas.getContext("2d", { alpha: false });
  await page.render({
    canvasContext: ctx,
    viewport,
    transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null
  }).promise;

  return pdf;
}

async function renderPdfPreview(url, preview) {
  const canvas = document.createElement("canvas");
  canvas.className = "pdf-canvas";
  preview.appendChild(canvas);

  try {
    const data = await fetchPdf(url);
    await renderPdfPage(data, canvas, 1.2);
  } catch (error) {
    canvas.remove();
    const errorText = document.createElement("div");
    errorText.className = "pdf-error";
    errorText.textContent = "Preview PDF gagal dimuat.";
    preview.appendChild(errorText);
    console.error(error);
  }
}

function createCard(file) {
  const type = fileType(file.name);
  const url = rawUrl(file.path);
  const article = document.createElement("article");
  article.className = "certificate-card";

  const preview = document.createElement("div");
  preview.className = "certificate-image";

  if (type === "pdf") {
    const label = document.createElement("span");
    label.className = "pdf-label";
    label.textContent = "PDF";
    preview.appendChild(label);
    renderPdfPreview(url, preview);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = prettyName(file.name);
    img.loading = "lazy";
    preview.appendChild(img);
  }

  const button = document.createElement("button");
  button.className = "view-btn";
  button.textContent = type === "pdf" ? "Lihat Sertifikat" : "Lihat Sertifikat";
  button.addEventListener("click", () => openCertificate(file.name, url, type));
  preview.appendChild(button);

  const info = document.createElement("div");
  info.className = "certificate-info";

  const org = document.createElement("p");
  org.className = "certificate-org";
  org.textContent = type === "pdf" ? "Dokumen PDF" : "Sertifikat";

  const title = document.createElement("h3");
  title.textContent = prettyName(file.name);

  const date = document.createElement("p");
  date.textContent = "File dari GitHub";

  const badge = document.createElement("span");
  badge.className = "certificate-badge";
  badge.textContent = type.toUpperCase();

  info.append(org, title, date, badge);
  article.append(preview, info);
  return article;
}

async function loadCertificates() {
  const c = GITHUB_CONFIG;

  if (!c.owner || c.owner.includes("USERNAME_") || !c.repo || c.repo.includes("NAMA_")) {
    statusEl.className = "certificate-status error";
    statusEl.textContent = "Belum dikonfigurasi. Buka config.js lalu isi username GitHub dan nama repository.";
    return;
  }

  try {
    const response = await fetch(githubApiUrl(), {
      headers: { "Accept": "application/vnd.github+json" }
    });

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const files = await response.json();
    const certificates = files
      .filter(item => item.type === "file" && isSupported(item.name))
      .sort((a, b) => a.name.localeCompare(b.name, "id"));

    gridEl.innerHTML = "";

    if (!certificates.length) {
      statusEl.textContent = "Belum ada sertifikat di folder GitHub.";
      return;
    }

    statusEl.textContent = `${certificates.length} sertifikat ditemukan.`;
    certificates.forEach(file => gridEl.appendChild(createCard(file)));
  } catch (error) {
    console.error(error);
    statusEl.className = "certificate-status error";
    statusEl.textContent = "Sertifikat gagal dimuat. Pastikan repository GitHub public, nama repository dan branch di config.js benar, serta folder assets/certificates sudah ada.";
  }
}

async function openCertificate(name, url, type) {
  const modal = document.getElementById("certificateModal");
  const body = document.getElementById("modalBody");
  body.innerHTML = "";

  if (type === "pdf") {
    const loading = document.createElement("div");
    loading.className = "pdf-modal-loading";
    loading.textContent = "Memuat sertifikat…";
    body.appendChild(loading);
    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    try {
      const data = await fetchPdf(url);
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      loading.remove();

      const pages = document.createElement("div");
      pages.className = "pdf-pages";
      body.appendChild(pages);

      // Render semua halaman agar PDF terlihat utuh di dalam website.
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.35 });
        const ratio = window.devicePixelRatio || 1;
        const canvas = document.createElement("canvas");
        canvas.className = "pdf-modal-page";
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext("2d", { alpha: false });
        await page.render({
          canvasContext: ctx,
          viewport,
          transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null
        }).promise;
        pages.appendChild(canvas);
      }
    } catch (error) {
      console.error(error);
      loading.textContent = "Sertifikat PDF gagal ditampilkan.";
    }
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = name;
    body.appendChild(img);
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeCertificate(event) {
  if (!event || event.target.id === "certificateModal" || event.target.classList.contains("close")) {
    document.getElementById("certificateModal").classList.remove("show");
    document.getElementById("modalBody").innerHTML = "";
    document.body.style.overflow = "";
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCertificate();
});

loadCertificates();
