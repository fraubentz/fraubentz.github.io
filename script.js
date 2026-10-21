(() => {
  "use strict";

  const GITHUB_USER = "fraubentz";
  const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

  // ---- Footer year (index + colophon) ----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Email reveal (address is split so it is not plain text in the HTML) ----
  // TODO: replace these three parts with your real address.
  const emailParts = ["pybentz", "duck.com"];
  const emailButton = document.getElementById("emailButton");
  if (emailButton) {
    emailButton.addEventListener("click", () => {
      const address = emailParts.join("@");
      const link = document.createElement("a");
      link.className = emailButton.className;
      link.href = `mailto:${address}`;
      link.textContent = address;
      emailButton.replaceWith(link);
    });
  }

  // ---- Repository list (index only) ----
  const list = document.getElementById("repo-list");
  const template = document.getElementById("repo-template");
  const search = document.getElementById("repo-search");
  if (!list || !template) return;

  let repos = [];

  function showMessage(text) {
    list.replaceChildren();
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = text;
    list.appendChild(p);
  }

  function render(items) {
    if (!items.length) {
      showMessage("No repositories match your filter.");
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((repo) => {
      const node = template.content.cloneNode(true);
      node.querySelector(".repo-name").textContent = repo.name;
      node.querySelector(".repo-language").textContent = repo.language || "n/a";
      node.querySelector(".repo-description").textContent =
        repo.description || "No description provided.";
      node.querySelector(".repo-stars").textContent = `★ ${repo.stargazers_count}`;
      node.querySelector(".repo-forks").textContent = `⎇ ${repo.forks_count}`;
      node.querySelector(".repo-link").href = repo.html_url;
      frag.appendChild(node);
    });
    list.replaceChildren(frag);
  }

  function applyFilter() {
    const q = (search ? search.value : "").trim().toLowerCase();
    render(
      repos.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.language || "").toLowerCase().includes(q)
      )
    );
  }

  if (search) search.addEventListener("input", applyFilter);

  showMessage("Loading repositories…");

  fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } })
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
      return res.json();
    })
    .then((data) => {
      repos = data.filter((r) => !r.fork && !r.archived);
      if (!repos.length) {
        showMessage("No public repositories to show yet.");
        return;
      }
      applyFilter();
    })
    .catch(() => {
      showMessage(
        "Repositories could not be loaded right now (the GitHub API may be rate-limiting). Please try again later."
      );
    });
})();
