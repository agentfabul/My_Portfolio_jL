/* ════════════════════════════════════════════════════════
   github.js — GitHub Repositories Loader
   Fetches live repos from the GitHub API
   ════════════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────────
// Change this to your actual GitHub username
const GITHUB_USERNAME_DEFAULT = 'agentfabul';
const GITHUB_API_BASE = 'https://api.github.com';

// ── Language Colors ───────────────────────────────────────
const LANG_COLORS = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python':     '#3572A5',
  'HTML':       '#e34c26',
  'CSS':        '#563d7c',
  'Java':       '#b07219',
  'Go':         '#00ADD8',
  'Rust':       '#dea584',
  'Shell':      '#89e051',
  'Ruby':       '#701516',
  'PHP':        '#4F5D95',
  'C++':        '#f34b7d',
  'C#':         '#239120',
  'default':    '#8b949e'
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS['default'];
}

// ── Repo Card Builder ─────────────────────────────────────
function buildRepoCard(repo) {
  const lang = repo.language || 'Unknown';
  const color = getLangColor(lang);
  const desc = repo.description || 'No description provided.';
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const url = repo.html_url;
  const name = repo.name;
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return `
    <div class="repo-card">
      <div class="repo-header">
        <span class="repo-icon">📁</span>
        <h3 class="repo-name font-display">${name}</h3>
      </div>
      <p class="repo-desc">${desc.length > 100 ? desc.slice(0, 100) + '…' : desc}</p>
      <div class="repo-footer">
        <span class="repo-lang" style="display:flex;align-items:center;gap:5px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;"></span>
          ${lang}
        </span>
        ${stars > 0 ? `<span class="repo-stars">⭐ ${stars}</span>` : ''}
        ${forks > 0 ? `<span style="font-size:11px;color:var(--text-muted)">🍴 ${forks}</span>` : ''}
        <a href="${url}" target="_blank" rel="noopener" class="repo-link">View ↗</a>
      </div>
      <div style="margin-top:8px;font-size:10px;color:var(--text-muted);opacity:0.5;">Updated ${updated}</div>
    </div>
  `;
}

// ── Main Loader ───────────────────────────────────────────
async function loadGitHubRepos(username) {
  const grid = document.getElementById('reposGrid');
  const demo = document.getElementById('demoRepos');
  const loading = document.getElementById('githubLoading');
  const error = document.getElementById('githubError');
  const errorMsg = document.getElementById('githubErrorMsg');

  if (!grid || !loading) return;

  // Reset
  grid.innerHTML = '';
  if (demo) demo.classList.add('hidden');
  loading.classList.remove('hidden');
  error.classList.add('hidden');

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12&type=public`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.status === 404) {
      throw new Error(`User "${username}" not found on GitHub.`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again later.');
    }
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    loading.classList.add('hidden');

    if (!repos || repos.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">No public repositories found for <strong>${username}</strong>.</div>`;
      return;
    }

    // Filter out forks optionally (show all for now)
    grid.innerHTML = repos.map(buildRepoCard).join('');

    // Animate cards in
    grid.querySelectorAll('.repo-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 60);
    });

  } catch (err) {
    loading.classList.add('hidden');
    errorMsg.textContent = err.message;
    error.classList.remove('hidden');
    // Fall back to demo repos
    if (demo) demo.classList.remove('hidden');
  }
}

// ── Event Binding (runs after DOM is ready) ───────────────
document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadReposBtn');
  const input = document.getElementById('githubUsername');

  if (loadBtn && input) {
    loadBtn.addEventListener('click', () => {
      const username = input.value.trim();
      if (username) loadGitHubRepos(username);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const username = input.value.trim();
        if (username) loadGitHubRepos(username);
      }
    });
  }
});
