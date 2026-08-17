export const STRONG_TITLE_SIGNALS = [
  /^\s*\[[^\]]*\b(?:hiring|vacanc(?:y|ies)|vaga|vagas|vacante|vacantes|emploi|lavoro|stelle)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:hiring|vacanc(?:y|ies)|internship|new grad|job opening|open roles?)\b/iu,
  /\b(?:is hiring|looking for|we(?:'re| are) hiring|seeking candidates?)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:vaga|vagas|contratando|oportunidade)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:vacante|vacantes|empleo|trabajo)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:emploi|recrutement|poste)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:lavoro|assunzione|posizione)\b/iu,
  /^\s*(?:\[[^\]]+\]\s*)?(?:stelle|stellenangebot|einstellung)\b/iu,
  /(招聘|职位|求人|採用|채용)/u,
];

export const JOB_LABEL_SIGNALS = [
  /^(job|jobs|hiring|vacancy|vacancies|vaga|vagas|empleo|emploi|career)$/iu,
];

export const APPLICATION_SIGNALS = [
  /\b(apply(?: now| here| at| via)?|submit (?:an )?application)\b/iu,
  /\b(?:send|submit).{0,24}\b(?:cv|r[eé]sum[eé]|application)\b/iu,
  /\b(candidatar|candidatura|curr[ií]culo|postuler|bewerben)\b/iu,
  /(応募|应聘|简历|지원)/u,
  /https?:\/\/\S*(?:jobs|careers|apply|lever|greenhouse)\S*/iu,
];

export const EMPLOYMENT_DETAIL_SIGNALS = [
  /\b(salary|compensation|pay range|location|remote|on-site|hybrid)\b/iu,
  /\b(responsibilit|qualifications?|requirements?|years? of experience)\b/iu,
  /\b(sal[aá]rio|remunera|localiza|remoto|responsabilit|requisit)\b/iu,
  /(給与|勤務地|薪资|工作地点|급여|근무지)/u,
];

export const NEGATIVE_TITLE_SIGNALS = [
  /\b(bug|feature request|documentation|docs|support|question|roadmap)\b/iu,
  /\b(contribution|good first issue|help wanted)\b/iu,
  /^\s*(?:\[\s*)?(?:feat|feature|fix|chore|refactor|test|build|ci)(?:\([^)]*\))?(?:\]|:)/iu,
  /\b(integrat(?:e|ion)|extract|scraper|crawler|available jobs tab|restrict assignment)\b/iu,
  /(整理|开发一个|爬虫|抓取工具|링크에서|추출)/u,
  /(採用しない|非採用)/u,
];

export const REPOSITORY_JOB_SIGNALS = /\b(jobs?|vagas?|careers?|empleo|emploi)\b/iu;
