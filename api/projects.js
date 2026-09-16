const KNOWN_BLURHASHES = {
  "anvil.pr": "L025[T$*9FtR?vR*9G%Mx^RkD%%2",
  "dynamic-astroid-page-for-special-ones-": "L396,o00}[%0}+5l}?OGn45m^POY",
  "womens-world": "L13*h]10}qE4}r5m=wIqjGS2W;so",
  "logicallords-landingpage": "L24Bwm:g9DTL~XvxM,t8EKR%%4wc",
  "vighnesh-portfolio": "L59RbCRq03v0jQxDVXPC00vc]xG1"
};
const DEFAULT_BLURHASH = "L13[L0~q4m%M%Mt7Rjof00WB?bIU";

const FALLBACK_PROJECTS = [
  {
    name: "Anvil.pr",
    displayName: "Anvil.pr",
    description: "Anvil.pr is a prompt version evaluator project designed for evaluating, comparing, and optimizing LLM prompts.",
    homepage: "https://anvil-pr-five.vercel.app/",
    hostedUrl: "https://anvil-pr-five.vercel.app/",
    html_url: "https://github.com/WILD-BUGS/Anvil.pr",
    language: "TypeScript",
    topics: ["prompt-engineering", "evaluation", "react", "typescript"],
    branch: "main",
    coverUrl: "https://raw.githubusercontent.com/WILD-BUGS/Anvil.pr/main/cover.png",
    fallbackUrl: "/default-cover.svg",
    blurhash: KNOWN_BLURHASHES["anvil.pr"]
  },
  {
    name: "Dynamic-Astroid-page-for-special-ones-",
    displayName: "Dynamic Astroid Page",
    description: "Interactive front-end asteroid experience designed with dynamic canvas graphics and fluid animations.",
    homepage: "https://astroid-page-b7so.vercel.app/",
    hostedUrl: "https://astroid-page-b7so.vercel.app/",
    html_url: "https://github.com/WILD-BUGS/Dynamic-Astroid-page-for-special-ones-",
    language: "JavaScript",
    topics: ["animation", "canvas", "interactive", "space"],
    branch: "main",
    coverUrl: "https://raw.githubusercontent.com/WILD-BUGS/Dynamic-Astroid-page-for-special-ones-/main/cover.png",
    fallbackUrl: "/default-cover.svg",
    blurhash: KNOWN_BLURHASHES["dynamic-astroid-page-for-special-ones-"]
  },
  {
    name: "WOMENS-WORLD",
    displayName: "Women's World",
    description: "Community platform and web portal built to connect and empower women creators and entrepreneurs.",
    homepage: null,
    hostedUrl: null,
    html_url: "https://github.com/WILD-BUGS/WOMENS-WORLD",
    language: "TypeScript",
    topics: ["community", "web-platform", "typescript"],
    branch: "main",
    coverUrl: "https://raw.githubusercontent.com/WILD-BUGS/WOMENS-WORLD/main/cover.png",
    fallbackUrl: "/default-cover.svg",
    blurhash: KNOWN_BLURHASHES["womens-world"]
  },
  {
    name: "LogicalLords-LandingPage",
    displayName: "LogicalLords Landing Page",
    description: "Modern showcase and responsive landing page crafted for LogicalLords software collective.",
    homepage: "https://logical-lords-landing-page.vercel.app/",
    hostedUrl: "https://logical-lords-landing-page.vercel.app/",
    html_url: "https://github.com/WILD-BUGS/LogicalLords-LandingPage",
    language: "TypeScript",
    topics: ["landing-page", "design", "portfolio"],
    branch: "main",
    coverUrl: "https://raw.githubusercontent.com/WILD-BUGS/LogicalLords-LandingPage/main/cover.png",
    fallbackUrl: "https://raw.githubusercontent.com/WILD-BUGS/LogicalLords-LandingPage/main/banner.png",
    blurhash: KNOWN_BLURHASHES["logicallords-landingpage"]
  },
  {
    name: "Vighnesh-portfolio",
    displayName: "Vighnesh Portfolio",
    description: "Personal developer portfolio and creative showcase highlighting full-stack projects and modern frontend craft.",
    homepage: null,
    hostedUrl: null,
    html_url: "https://github.com/WILD-BUGS/Vighnesh-portfolio",
    language: "TypeScript",
    topics: ["portfolio", "creative", "frontend"],
    branch: "main",
    coverUrl: "https://raw.githubusercontent.com/WILD-BUGS/Vighnesh-portfolio/main/cover.png",
    fallbackUrl: "https://raw.githubusercontent.com/WILD-BUGS/Vighnesh-portfolio/main/src/assets/images/project_api_vault_1788237967850.jpg",
    blurhash: KNOWN_BLURHASHES["vighnesh-portfolio"]
  }
];

let cachedProjects = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

async function fetchFromGitHub() {
  const ORG_NAME = 'WILD-BUGS';
  const headers = { 'User-Agent': 'WildBugs-Portfolio/1.0' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com/orgs/${ORG_NAME}/repos?sort=updated&per_page=100`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API returned status ${res.status}`);
  }
  const repos = await res.json();
  const validRepos = Array.isArray(repos) ? repos.filter(r => !r.fork) : [];

  const results = await Promise.allSettled(
    validRepos.map(async (repo) => {
      let hostedUrl = repo.homepage || null;
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${ORG_NAME}/${repo.name}/readme`, { headers });
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          if (readmeData.content) {
            const text = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            const match = text.match(/Hosted\s+URL\s*[:\-]\s*(https?:\/\/[^\s\)\]]+)/i);
            if (match) hostedUrl = match[1].trim();
          }
        }
      } catch {}

      const branch = repo.default_branch || 'main';
      const coverUrl = `https://raw.githubusercontent.com/${ORG_NAME}/${repo.name}/${branch}/cover.png`;
      let fallbackUrl = '/default-cover.svg';

      if (repo.name.toLowerCase().includes('logicallords')) {
        fallbackUrl = `https://raw.githubusercontent.com/${ORG_NAME}/${repo.name}/${branch}/banner.png`;
      } else if (repo.name.toLowerCase().includes('vighnesh')) {
        fallbackUrl = `https://raw.githubusercontent.com/${ORG_NAME}/${repo.name}/${branch}/src/assets/images/project_api_vault_1788237967850.jpg`;
      }

      const lowerName = repo.name.toLowerCase();
      const blurhash = KNOWN_BLURHASHES[lowerName] || DEFAULT_BLURHASH;

      return {
        name: repo.name,
        displayName: repo.name.replace(/-/g, ' '),
        description: repo.description || 'A brilliant project by WILD-BUGS team.',
        homepage: repo.homepage,
        hostedUrl,
        html_url: repo.html_url,
        language: repo.language,
        topics: repo.topics || [],
        branch,
        coverUrl,
        fallbackUrl,
        blurhash
      };
    })
  );

  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

export default async function handler(req, res) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();
  if (cachedProjects && (now - lastFetchTime < CACHE_DURATION)) {
    return res.status(200).json({ success: true, source: 'cache', projects: cachedProjects });
  }

  try {
    const liveProjects = await fetchFromGitHub();
    if (liveProjects && liveProjects.length > 0) {
      cachedProjects = liveProjects;
      lastFetchTime = now;
      return res.status(200).json({ success: true, source: 'github', projects: liveProjects });
    }
  } catch (err) {
    console.warn('GitHub API fetch failed or rate-limited, serving fallback projects:', err.message);
  }

  return res.status(200).json({ success: true, source: 'fallback', projects: FALLBACK_PROJECTS });
}
