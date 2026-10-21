const repoList = document.getElementById("repo-list");
const searchInput = document.getElementById("repo-search");
const repoTemplate = document.getElementById("repo-template");
const yearNode = document.getElementById("year");

const featuredRepoOrder = [
  "gap-online",
  "cavaquinho",
  "der-kuesten-kurier",
  "hubbys_geschenk",
  "cat-conference",
  "dicionario_cavaquinho",
  "simple-landing-page",
  "javascript-exercises",
  "sketchpad",
  "css-exercises",
  "odin-recipes"
];

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const emailAddress = atob("cHliZW56QGR1Y2suY29t");
const emailButton = document.getElementById("emailButton");

if (emailButton) {
  emailButton.addEventListener("click", () => {
    window.location.href = `mailto:${emailAddress}`;
  });
}

async function loadRepos() {
  try {
    const [userResponse, orgResponse] = await Promise.all([
      fetch("https://api.github.com/users/fraubentz/repos?sort=updated&per_page=100"),
      fetch("https://api.github.com/orgs/BentzStudio/repos?sort=updated&per_page=100")
    ]);

    if (!userResponse.ok && !orgResponse.ok) {
      throw new Error("Unable to fetch repositories");
    }

    const userRepos = userResponse.ok ? await userResponse.json() : [];
    const orgRepos = orgResponse.ok ? await orgResponse.json() : [];

    const combined = [...userRepos, ...orgRepos].reduce((acc, repo) => {
      const key = repo.full_name || repo.name;
      if (!acc.has(key)) {
        acc.set(key, repo);
      }
      return acc;
    }, new Map());

    const filtered = [...combined.values()]
      .filter((repo) => !repo.fork && !repo.private)
      .filter((repo) => !["fraubentz", "fraubentz.github.io"].includes(repo.name))
      .map((repo) => {
        const index = featuredRepoOrder.indexOf(repo.name);
        return {
          ...repo,
          featuredRank: index === -1 ? Number.MAX_SAFE_INTEGER : index
        };
      })
      .sort((a, b) => {
        const rankDiff = a.featuredRank - b.featuredRank;
        if (rankDiff !== 0) return rankDiff;
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      });

    renderRepos(filtered);

    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        const query = event.target.value.trim().toLowerCase();

        const matches = filtered.filter((repo) => {
          const haystack = `${repo.name} ${repo.full_name || ""} ${repo.description || ""} ${repo.language || ""}`.toLowerCase();
          return haystack.includes(query);
        });

        renderRepos(matches);
      });
    }
  } catch (error) {
    console.error(error);
    if (repoList) {
      repoList.innerHTML = '<p class="empty-state">Repository data is unavailable right now.</p>';
    }
  }
}

function renderRepos(repos) {
  if (!repoList) return;

  repoList.innerHTML = "";

  if (!repos.length) {
    repoList.innerHTML = '<p class="empty-state">No repositories match your search.</p>';
    return;
  }

  repos.forEach((repo) => {
    const fragment = repoTemplate.content.cloneNode(true);
    const name = fragment.querySelector(".repo-name");
    const description = fragment.querySelector(".repo-description");
    const language = fragment.querySelector(".repo-language");
    const stars = fragment.querySelector(".repo-stars");
    const forks = fragment.querySelector(".repo-forks");
    const link = fragment.querySelector(".repo-link");

    name.textContent = repo.name;
    description.textContent = repo.description || "No description provided.";
    language.textContent = repo.language || "Misc";
    stars.textContent = `★ ${formatNumber(repo.stargazers_count || 0)}`;
    forks.textContent = `⎇ ${formatNumber(repo.forks_count || 0)}`;

    link.href = repo.html_url;
    link.setAttribute("aria-label", `Open repository ${repo.name}`);

    repoList.appendChild(fragment);
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

loadRepos();
