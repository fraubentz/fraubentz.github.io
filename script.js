(() => {
  "use strict";

  const GITHUB_USER = "fraubentz";
  const GITHUB_ORG = "BentzStudio";
  const API_URLS = [
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
    `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&sort=updated`,
  ];

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const emailParts = ["pybentz", "duck.com"];
  const emailButton = document.getElementById("emailButton");
  if (emailButton) {
    emailButton.addEventListener("click", () => {
      const address = emailParts.join("@");
      const link = document.createElement("a");
      link.className = emailButton.className;
      link.href = `mailto:${address}`;
      link.textContent = address;
      link.setAttribute("aria-label", `Email ${address}`);
      emailButton.replaceWith(link);
    });
  }

  const list = document.getElementById("repo-list");
  const template = document.getElementById("repo-template");
  const search = document.getElementById("repo-search");

  if (!list || !template) {
    return;
  }

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
      const repoName = node.querySelector(".repo-name");
      const repoLanguage = node.querySelector(".repo-language");
      const repoDescription = node.querySelector(".repo-description");
      const repoStars = node.querySelector(".repo-stars");
      const repoForks = node.querySelector(".repo-forks");
      const repoLink = node.querySelector(".repo-link");

      if (repoName) repoName.textContent = repo.name;
      if (repoLanguage) repoLanguage.textContent = repo.language || "n/a";
      if (repoDescription) repoDescription.textContent = repo.description || "No description provided.";
      if (repoStars) repoStars.textContent = `★ ${repo.stargazers_count}`;
      if (repoForks) repoForks.textContent = `⎇ ${repo.forks_count}`;
      if (repoLink) repoLink.href = repo.html_url;

      frag.appendChild(node);
    });

    list.replaceChildren(frag);
  }

  function applyFilter() {
    const q = (search ? search.value : "").trim().toLowerCase();
    render(
      repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(q) ||
          (repo.language || "").toLowerCase().includes(q)
      )
    );
  }

  if (search) {
    search.addEventListener("input", applyFilter);
  }

  showMessage("Loading repositories…");

  Promise.all(
    API_URLS.map((url) =>
      fetch(url, { headers: { Accept: "application/vnd.github+json" } }).then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status} for ${url}`);
        }
        return response.json();
      })
    )
  )
    .then((results) => {
      const merged = new Map();

      results.flat().forEach((repo) => {
        if (!repo || repo.fork || repo.archived) {
          return;
        }

        if (repo.owner && repo.owner.login && ![GITHUB_USER, GITHUB_ORG].includes(repo.owner.login)) {
          return;
        }

        merged.set(repo.id, repo);
      });

      repos = [...merged.values()].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));

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
