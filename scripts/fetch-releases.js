import fs from 'node:fs';
import path from 'node:path';

const REPOS_PATH = path.resolve('src/data/repositories.json');
const CACHE_PATH = path.resolve('src/data/releases-cache.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'SaviorBill-Website-Builder',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Получает анонимный pull-токен GHCR для публичного образа.
 */
async function getGhcrToken(imagePath) {
  const url = `https://ghcr.io/token?service=ghcr.io&scope=repository:${imagePath}:pull`;
  const data = await fetchJson(url, { 'User-Agent': 'SaviorBill-Website-Builder' });
  return data.token || null;
}

/**
 * Проверяет наличие манифеста в GHCR для указанного тега.
 * Сначала пробует точный tag_name (например v1.0.0), затем без префикса v (1.0.0).
 */
async function checkGhcrManifest(container, tagName, token) {
  if (!token) return null;
  const imagePath = container.image.replace(/^ghcr\.io\//i, '');
  const cleanTag = tagName.replace(/^v/i, '');
  const candidateTags = tagName === cleanTag ? [tagName] : [tagName, cleanTag];

  const acceptHeader = [
    'application/vnd.oci.image.index.v1+json',
    'application/vnd.docker.distribution.manifest.list.v2+json',
    'application/vnd.oci.image.manifest.v1+json',
    'application/vnd.docker.distribution.manifest.v2+json',
  ].join(', ');

  for (const tag of candidateTags) {
    const url = `https://ghcr.io/v2/${imagePath}/manifests/${encodeURIComponent(tag)}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: acceptHeader,
          'User-Agent': 'SaviorBill-Website-Builder',
        },
      });
      if (!res.ok) continue;

      const digest = res.headers.get('docker-content-digest') || null;
      const body = await res.json().catch(() => null);
      const platforms = [];

      if (body && Array.isArray(body.manifests)) {
        for (const m of body.manifests) {
          const os = m?.platform?.os;
          const arch = m?.platform?.architecture;
          if (os && arch && os !== 'unknown' && arch !== 'unknown') {
            const p = `${os}/${arch}`;
            if (!platforms.includes(p)) platforms.push(p);
          }
        }
      }

      return {
        name: container.name,
        label: container.label || container.name,
        image: container.image,
        tag,
        pullCommand: `docker pull ${container.image}:${tag}`,
        digest,
        platforms,
        packageUrl: `https://ghcr.io/${imagePath}`,
      };
    } catch {
      // Игнорируем сетевую ошибку конкретного тега и пробуем следующий
    }
  }

  return null;
}

async function processRepo(repoCfg, previousRepoData) {
  const { id, owner, repo, containers = [] } = repoCfg;
  const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const releasesApiUrl = `${repoApiUrl}/releases?per_page=30`;

  try {
    const [repoMeta, rawReleases] = await Promise.all([
      fetchJson(repoApiUrl, githubHeaders()).catch(() => null),
      fetchJson(releasesApiUrl, githubHeaders()),
    ]);

    // Получаем pull-токены и digest'ы :latest / :nightly для каждого контейнера
    const containerMetaMap = {};
    await Promise.all(
      containers.map(async (c) => {
        const imagePath = c.image.replace(/^ghcr\.io\//i, '');
        let token = null;
        try {
          token = await getGhcrToken(imagePath);
        } catch {
          token = null;
        }
        const [latestInfo, nightlyInfo] = await Promise.all([
          checkGhcrManifest(c, 'latest', token),
          checkGhcrManifest(c, 'nightly', token),
        ]);
        containerMetaMap[c.image] = {
          token,
          latestDigest: latestInfo?.digest || null,
          nightlyDigest: nightlyInfo?.digest || null,
        };
      })
    );

    const releases = await Promise.all(
      rawReleases
        .filter((r) => !r.draft)
        .map(async (r) => {
          const foundContainers = (
            await Promise.all(
              containers.map(async (c) => {
                const meta = containerMetaMap[c.image];
                const info = await checkGhcrManifest(c, r.tag_name, meta?.token);
                if (!info) return null;
                const aliases = [];
                if (info.digest && meta?.latestDigest && info.digest === meta.latestDigest) {
                  aliases.push('latest');
                }
                if (info.digest && meta?.nightlyDigest && info.digest === meta.nightlyDigest) {
                  aliases.push('nightly');
                }
                return { ...info, aliases };
              })
            )
          ).filter(Boolean);

          return {
            id: r.id,
            tagName: r.tag_name,
            name: r.name || r.tag_name,
            body: r.body || '',
            htmlUrl: r.html_url,
            publishedAt: r.published_at || r.created_at,
            prerelease: Boolean(r.prerelease),
            author: r.author
              ? {
                  login: r.author.login,
                  avatarUrl: r.author.avatar_url,
                  htmlUrl: r.author.html_url,
                }
              : null,
            assets: Array.isArray(r.assets)
              ? r.assets.map((a) => ({
                  name: a.name,
                  size: a.size,
                  downloadCount: a.download_count,
                  browserDownloadUrl: a.browser_download_url,
                }))
              : [],
            containers: foundContainers,
          };
        })
    );

    return {
      id,
      owner,
      repo,
      htmlUrl: `https://github.com/${owner}/${repo}`,
      stars: repoMeta?.stargazers_count ?? previousRepoData?.stars ?? 0,
      defaultBranch: repoMeta?.default_branch ?? previousRepoData?.defaultBranch ?? 'main',
      releases,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`[fetch-releases] Failed to fetch ${owner}/${repo}: ${err.message}`);
    if (previousRepoData) {
      return previousRepoData;
    }
    return {
      id,
      owner,
      repo,
      htmlUrl: `https://github.com/${owner}/${repo}`,
      stars: 0,
      defaultBranch: 'main',
      releases: [],
      fetchedAt: null,
    };
  }
}

async function main() {
  const repos = JSON.parse(fs.readFileSync(REPOS_PATH, 'utf-8'));

  let existingCache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      existingCache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    } catch {
      existingCache = {};
    }
  }

  const results = await Promise.all(
    repos.map((r) => processRepo(r, existingCache.repositories?.[r.id]))
  );

  const output = {
    generatedAt: new Date().toISOString(),
    repositories: Object.fromEntries(results.map((r) => [r.id, r])),
  };

  fs.writeFileSync(CACHE_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(
    `[fetch-releases] Saved ${results.length} repositories to ${path.relative(process.cwd(), CACHE_PATH)}`
  );
  for (const r of results) {
    const containerCount = r.releases.reduce((sum, rel) => sum + rel.containers.length, 0);
    console.log(`  - ${r.owner}/${r.repo}: ${r.releases.length} releases, ${containerCount} container builds`);
  }
}

main().catch((err) => {
  console.error('[fetch-releases] Fatal error:', err);
  process.exit(1);
});
