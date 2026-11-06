#!/usr/bin/env node
// Sets up one HACK4ARAD lane in your own local Paperclip: company, Claude agent, project, your tasks.
// Usage: node tools/paperclip/setup-lane.mjs --lane P2   (P1 Zoltan, P2 Lukas, P3 Octav, P4 Damian; --person <name> to override)
// Safe to run again: it finds what already exists by name and only creates what is missing.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]);
  return acc;
}, []));

const LANES = {
  P1: { person: "Zoltan", name: "P1 · Platformă & Livrare", title: "Persoana 1 · Platformă, auth & livrare", icon: "shield", effort: "high", label: "P1 · Platformă", color: "#2563EB" },
  P2: { person: "Lukas", name: "P2 · Experiența Vizitatorului", title: "Persoana 2 · Evenimente, locuri, bilete", icon: "globe", effort: "medium", label: "P2 · Vizitator", color: "#16A34A" },
  P3: { person: "Octav", name: "P3 · Hărți & AI", title: "Persoana 3 · Hartă, chat AI, itinerar", icon: "sparkles", effort: "high", label: "P3 · Hărți & AI", color: "#9333EA" },
  P4: { person: "Damian", name: "P4 · Firme & Comunitate", title: "Persoana 4 · Firme, oferte, puncte", icon: "target", effort: "high", label: "P4 · Firme & Comunitate", color: "#EA580C" },
};
const laneKey = String(args.lane || "").toUpperCase();
const lane = LANES[laneKey];
if (!lane) {
  console.error("Usage: node tools/paperclip/setup-lane.mjs --lane P1|P2|P3|P4 [--api http://127.0.0.1:3100] [--repo <path>]");
  process.exit(1);
}
const API = String(args.api || "http://127.0.0.1:3100").replace(/\/$/, "") + "/api";
const REPO = path.resolve(String(args.repo || path.join(here, "..", "..")));
const COMPANY = String(args.company || "HACK4ARAD");
const MODEL = String(args.model || "claude-sonnet-5-5");
if (args.person) lane.person = String(args.person);
const REPO_SKILLS = ["task-workflow", "be-module", "fe-feature", "seed-data"];

async function call(method, p, body) {
  const res = await fetch(API + p, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${p} -> ${res.status} ${text.slice(0, 600)}`);
  return text ? JSON.parse(text) : null;
}
const list = (x, key) => (Array.isArray(x) ? x : x?.[key] ?? x?.items ?? []);

try { await call("GET", "/health"); } catch {
  console.error(`Paperclip is not reachable at ${API}. Start it with: npx paperclipai run`);
  process.exit(1);
}

let company = list(await call("GET", "/companies")).find((c) => c.name === COMPANY);
if (!company) {
  company = await call("POST", "/companies", { name: COMPANY, description: `Hack4Arad 2026 — AradExperience. Culoarul meu: ${lane.name}. Restul echipei lucrează în propriul Paperclip; GitHub și docs/STATUS.md sunt sursa comună de adevăr.` });
  console.log(`Created company ${COMPANY}`);
}
const C = company.id;

const conns = await call("GET", `/companies/${C}/ai-connections`);
const boardUser = conns.currentUserId || "local-board";
if (!list(conns, "connections").some((c) => c.provider === "anthropic" && c.status === "connected") && !args["skip-connection-check"]) {
  console.log(`\nOne manual step first: connect your own Claude subscription to the ${COMPANY} company.\n` +
    `  Open http://127.0.0.1:3100/${company.issuePrefix}/company/settings/connections (company ${COMPANY} -> Settings -> AI connections),\n` +
    `  connect Claude with your own subscription and make it your default.\n` +
    `Then run this script again.`);
  process.exit(2);
}

try { execFileSync("git", ["-C", REPO, "config", "core.hooksPath", ".githooks"]); console.log("Git hook enabled: no Co-Authored-By lines in commits"); } catch { console.warn("Could not enable .githooks (run: git config core.hooksPath .githooks)"); }

const common = readFileSync(path.join(here, "agents", "common.md"), "utf8");
const role = readFileSync(path.join(here, "agents", `${laneKey}.md`), "utf8");
const instructions = role.trimEnd() + "\n" + common;

let agent = list(await call("GET", `/companies/${C}/agents`)).find((a) => a.name === lane.name && a.status !== "terminated");
if (!agent) {
  agent = await call("POST", `/companies/${C}/agents`, {
    name: lane.name, title: `${lane.person} · ${lane.title.split(" · ").slice(1).join(" · ")}`, role: "engineer", icon: lane.icon,
    adapterType: "claude_local",
    adapterConfig: { model: MODEL, effort: lane.effort, graceSec: 15, timeoutSec: 5400, maxTurnsPerRun: 400, dangerouslySkipPermissions: true },
    instructionsBundle: { entryFile: "AGENTS.md", files: { "AGENTS.md": instructions } },
    runtimeConfig: {
      heartbeat: { enabled: false, cooldownSec: 10, intervalSec: 300, wakeOnDemand: true, maxConcurrentRuns: 1, skipTimerWhenNoActionableWork: true },
      aiConnection: { mode: "responsible_user", method: "subscription", provider: "anthropic" },
    },
    budgetMonthlyCents: 0,
    permissions: { canAssignTasks: true, canCreateAgents: false, canCreateSkills: false },
  });
  console.log(`Created agent ${lane.name} (${agent.status})`);
} else {
  const file = await call("GET", `/agents/${agent.id}/instructions-bundle/file?path=AGENTS.md`);
  if (file.content !== instructions) {
    await call("PUT", `/agents/${agent.id}/instructions-bundle/file`, { path: "AGENTS.md", content: instructions, baseRevisionId: file.revision?.id ?? null });
    console.log(`Updated instructions of ${lane.name}`);
  }
}

agent = await call("GET", `/agents/${agent.id}`);
if (agent.status === "paused" && agent.lifecycleState && agent.lifecycleState !== "ready" && !args["skip-connection-check"]) {
  agent = await call("POST", `/agents/${agent.id}/lifecycle/retry`, {});
  console.log(`Agent check restarted (${agent.lifecycleState}). It turns "idle" in the UI within a minute once your Claude connection works.`);
}

const labels = list(await call("GET", `/companies/${C}/labels`));
async function label(name, color) {
  let l = labels.find((x) => x.name === name);
  if (!l) { l = await call("POST", `/companies/${C}/labels`, { name, color }); labels.push(l); }
  return l.id;
}
const L = { lane: await label(lane.label, lane.color), demo: await label("linia de demo", "#DC2626"), stretch: await label("stretch", "#6B7280"), setup: await label("laptop", "#111111") };

const GOAL = "Demo AradExperience de 6 minute, fără bug-uri majore — duminică 8 nov, 12:00";
let goal = list(await call("GET", `/companies/${C}/goals`)).find((g) => g.title === GOAL);
if (!goal) goal = await call("POST", `/companies/${C}/goals`, { title: GOAL, description: "Linia de demo (T00–T13 + T16) verde pe două telefoane și proiector, după docs/DEMO.md. Fiecare din cei 4 livrează culoarul lui (docs/TEAM.md).", level: "company", status: "active", ownerAgentId: agent.id });

let project = list(await call("GET", `/companies/${C}/projects`)).find((p) => p.name === "AradExperience");
if (!project) {
  project = await call("POST", `/companies/${C}/projects`, {
    name: "AradExperience", status: "planned", visibility: "open", leadAgentId: agent.id, goalIds: [goal.id], targetDate: "2026-11-08", icon: "rocket",
    description: `Clona mea a repo-ului echipei. Culoarul meu: ${lane.name}. Citește CLAUDE.md, docs/TEAM.md și tools/paperclip/agents/common.md. Un task = un branch feat/Txx = un PR pe GitHub.`,
    workspace: { name: "AradExperience", sourceType: "local_path", cwd: REPO, isPrimary: true },
  });
  console.log(`Created project AradExperience -> ${REPO}`);
}

const scan = await call("POST", `/companies/${C}/skills/scan-projects`, { projectIds: [project.id], mode: "import" });
const companySkills = list(await call("GET", `/companies/${C}/skills`), "skills");
const skillKeys = REPO_SKILLS.map((slug) => companySkills.find((k) => k.slug === slug)?.key).filter(Boolean);
if (skillKeys.length !== REPO_SKILLS.length) {
  console.error(`Expected the repo skills ${REPO_SKILLS.join(", ")} in .claude/skills, found ${skillKeys.length}. Is --repo the AradExperience folder?`);
  process.exit(1);
}
const synced = await call("POST", `/agents/${agent.id}/skills/sync`, { mode: "add", desiredSkills: skillKeys });
console.log(`Skills: ${scan.imported?.length ?? 0} imported, ${scan.updated?.length ?? 0} updated; agent has ${REPO_SKILLS.filter((x) => synced.desiredSkills.some((k) => k.endsWith("/" + x))).length}/4 repo skills`);

const all = JSON.parse(readFileSync(path.join(here, "tasks.json"), "utf8"));
const ownerOf = Object.fromEntries(all.map((t) => [t.key, t.lane]));
const mine = all.filter((t) => t.lane === laneKey);
const existing = list(await call("GET", `/companies/${C}/issues`));
const ids = {};
for (const i of existing) { const m = /^(T\d+[ab]?):/.exec(i.title); if (m) ids[m[1]] = i.id; }

const setupTitle = `SETUP: Laptopul meu pentru ${lane.name}`;
if (!existing.some((i) => i.title === setupTitle)) {
  await call("POST", `/companies/${C}/issues`, {
    title: setupTitle, status: "todo", priority: "critical", assigneeUserId: boardUser, projectId: project.id, goalId: goal.id, labelIds: [L.setup], allowDuplicate: true,
    description: "De făcut de tine (omul), nu de agent:\n- [ ] Claude Code instalat și logat (`claude`), Node 20+, `gh auth login`\n- [ ] Java 21 + Maven, Postgres 16 (`docker compose up -d` din repo sau instalare locală)\n- [ ] Repo-ul echipei clonat (invitația de pe GitHub de la Persoana 1), `.env` din `.env.example` (cheile le primești de la Persoana 1, nu le pune în chat-uri publice)\n- [ ] `cd app && npm ci && npm run build` și `cd api && mvn -q test` merg\n\nCând e gata, marchează `done` și mută primul tău task în `todo` doar după ce dependențele lui sunt pe `main`.",
  });
}

for (const t of mine) {
  if (ids[t.key]) continue;
  const sameLane = t.blockedBy.filter((b) => ownerOf[b] === laneKey);
  const otherLane = t.blockedBy.filter((b) => ownerOf[b] && ownerOf[b] !== laneKey);
  let head = `**Cine:** ${lane.person} · agent „${lane.name}” · **Estimare:** ${t.hours} h · **Când:** ${t.slot}`;
  if (sameLane.length) head += ` · **Depinde de:** ${sameLane.join(", ")}`;
  if (otherLane.length) head += `\n\n**Depinde de alte culoare (verifică pe GitHub că sunt pe \`main\` înainte să începi):** ` + otherLane.map((b) => `${b} (${LANES[ownerOf[b]].person})`).join(", ");
  const created = await call("POST", `/companies/${C}/issues`, {
    title: t.title, description: head + "\n\n" + t.body, status: "backlog", priority: t.priority,
    assigneeAgentId: agent.id, projectId: project.id, goalId: goal.id,
    labelIds: [L.lane, ...t.labels.map((x) => (x === "stretch" ? L.stretch : L.demo))],
    blockedByIssueIds: sameLane.map((b) => ids[b]).filter(Boolean), allowDuplicate: true,
  });
  ids[t.key] = created.id;
  console.log(`Created ${created.identifier} ${t.title}`);
}

console.log(`\nDone. ${lane.name} is set up in ${COMPANY} with ${mine.length} tasks in backlog (nothing runs yet).\n` +
  `Start a task by moving it to "todo" in Paperclip once its dependencies are merged on GitHub.`);
