const DIRECT_ALIASES = {
  jr: "junior",
  junior: "junior",
  mid: "pleno",
  middle: "pleno",
  pleno: "pleno",
  senior: "senior",
  especialista: "especialista",
  specialist: "especialista",
  intern: "estagio",
  internship: "estagio",
  trainee: "estagio",
  estagio: "estagio",
  remote: "remote",
  remoto: "remote",
  hybrid: "hybrid",
  hibrido: "hybrid",
  onsite: "on-site",
  presencial: "on-site",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  node: "nodejs",
  nodejs: "nodejs",
  reactjs: "react",
  react: "react",
  vuejs: "vue",
  vue: "vue",
  golang: "go",
  postgresql: "postgres",
  postgres: "postgres",
  frontend: "frontend",
  backend: "backend",
  fullstack: "fullstack",
  devops: "devops",
  qa: "qa",
};

const CONTEXT_TOKENS = new Set([
  "lang",
  "language",
  "stack",
  "tech",
  "technology",
  "tecnologia",
  "framework",
  "skill",
  "skills",
  "role",
  "cargo",
  "seniority",
  "nivel",
  "level",
  "work",
  "model",
  "modelo",
  "modalidade",
  "type",
  "tipo",
]);

function normalizeBase(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9+#./\s-]+/g, " ")
    .replace(/[./_]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripContextTokens(value) {
  const tokens = value.split(" ").filter(Boolean);
  let start = 0;
  let end = tokens.length;

  while (start < end && CONTEXT_TOKENS.has(tokens[start])) start += 1;
  while (end > start && CONTEXT_TOKENS.has(tokens[end - 1])) end -= 1;

  return tokens.slice(start, end).join(" ").trim();
}

export function canonicalTagValue(value) {
  const base = normalizeBase(value);
  if (!base) return "";

  const candidate = stripContextTokens(base) || base;
  const direct = DIRECT_ALIASES[candidate] ?? DIRECT_ALIASES[base];

  if (direct) return direct;
  if (/(^| )(remote|remoto|home office|wfh)( |$)/.test(candidate)) return "remote";
  if (/(^| )(react native)( |$)/.test(candidate)) return "react-native";
  if (/(^| )(node js)( |$)/.test(candidate)) return "nodejs";

  return candidate.replace(/\s+/g, "-");
}
