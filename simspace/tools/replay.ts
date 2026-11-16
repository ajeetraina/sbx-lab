// Headless replay of the whole lab, for maintainers.
//
// Extracts every runnable block (bash, sh, console, prompt) from the markdown,
// in order, exactly as the Run buttons would send it, and plays them through the
// real Simspace engine, tracking agent sessions per terminal. It reports:
//   - any block no scenario matches (a lab that dead-ends),
//   - any block that lands on an error path (a lab whose own steps contradict
//     each other),
//   - the milestones (steps) that the replay never completes.
// `validate` checks that each command matches *some* scenario; this checks that
// the scenarios still work together, in the order a learner meets them.
//
//   docker compose run --rm replay
//   docker compose run --rm replay node scripts/run-ts.mjs scripts/replay.ts /labs/docker-sandboxes-copilot -v
//
// Headless replay of the whole lab: every runnable block of the markdown, in order,
// through the real simulator engine. Run inside the simspace-authoring image.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { Simulator } from "@dockersamples/simspace-simulator";

const labDir = process.argv[2];
const verbose = process.argv[3] === "-v";
const lab = parseYaml(readFileSync(join(labDir, "labspace.yaml"), "utf8"));
const spec = readFileSync(join(labDir, lab.simulator), "utf8");
const sim = new Simulator({ spec, files: lab.files ?? {} });

type Item = { section: string; term: string; kind: "cmd" | "prompt"; text: string };
const items: Item[] = [];
const allSteps = new Set<string>();
const first = lab.terminals?.[0]?.id ?? "terminal";

for (const sec of lab.sections) {
  for (const st of sec.steps ?? []) allSteps.add(st.id);
  if (!sec.contentPath) continue;
  const md = readFileSync(join(labDir, sec.contentPath), "utf8");
  const re = /^([ \t]*)```(\w+)([^\n]*)\n([\s\S]*?)^\1```/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const [, indent, langRaw, meta, bodyRaw] = m;
    const lang = langRaw.toLowerCase();
    if (!["bash", "sh", "console", "prompt"].includes(lang)) continue;
    if (/no-run-button|save-as=/.test(meta)) continue;
    const term = /terminal-id=(\S+)/.exec(meta)?.[1] ?? first;
    const body = bodyRaw
      .split("\n")
      .map((l) => (indent && l.startsWith(indent) ? l.slice(indent.length) : l))
      .join("\n")
      .replace(/\s+$/, "");
    if (lang === "prompt") {
      items.push({ section: sec.title, term, kind: "prompt", text: body });
    } else {
      for (const line of body.split("\n")) if (line.trim()) items.push({ section: sec.title, term, kind: "cmd", text: line });
    }
  }
}

const inSession = new Map<string, boolean>();
const done = new Set<string>();
const problems: string[] = [];
let lastSection = "";

for (const it of items) {
  if (it.section !== lastSection) {
    console.log(`\n══ ${it.section}`);
    lastSection = it.section;
  }
  const sess = inSession.get(it.term);
  let lines: { text?: string; stream?: string }[] = [];
  let matched = "";
  let completes: string | undefined;
  let tag = "";
  const text = it.text.trim();
  if (sess && text === "/exit") {
    inSession.set(it.term, false);
    console.log(`[${it.term}] (session) /exit`);
    continue;
  }
  if (sess && !text.startsWith("!")) {
    const o = sim.prompt(text, it.term);
    lines = o.lines as any;
    matched = o.matched;
    completes = o.completes;
    tag = "agent";
  } else {
    const cmd = sess ? text.slice(1) : text;
    const o = sim.execute(cmd, it.term);
    lines = o.lines as any;
    matched = o.matched;
    completes = o.completes;
    if (o.session) inSession.set(it.term, true);
    tag = o.session ? "→session" : "cmd";
  }
  if (completes) done.add(completes);
  const unmatched = !matched;
  if (unmatched) problems.push(`UNMATCHED [${it.section}] [${it.term}] ${text.split("\n")[0]}`);
  const body = lines.map((l) => (l.stream === "stderr" ? "! " : "  ") + (l.text ?? ""));
  console.log(
    `[${it.term}] ${tag === "agent" ? "agent>" : "$"} ${text.split("\n")[0].slice(0, 110)}  ⇒ ${matched || "NO MATCH"}${completes ? "  ✔" + completes : ""}`,
  );
  const show = verbose ? body : body.slice(0, 3);
  for (const l of show) console.log("      " + l.slice(0, 130));
  if (!verbose && body.length > 3) console.log(`      … (${body.length - 3} more lines)`);
  // Error-ish matched scenarios deserve attention.
  if (/^(create-wrong-dir|run-clone-wrong-dir|git-merge-blocked|run-not-found|exec-no-|git-fetch-missing|curl-refused|git-commit-nothing|git-merge-uptodate|policy-log-empty|mcp-ls-empty|create-.*-exists|agent-fix-pagination-again|agent-fix-updated-at-again)$/.test(matched))
    problems.push(`UNEXPECTED PATH ${matched} [${it.section}] ${text.split("\n")[0]}`);
}

const missing = [...allSteps].filter((s) => !done.has(s));
console.log("\n════ RESULT");
console.log(`blocks replayed: ${items.length}`);
console.log(`steps completed: ${done.size}/${allSteps.size}`);
console.log("steps NOT completed:", missing.length ? missing.join(", ") : "none");
console.log("problems:", problems.length ? "\n  " + problems.join("\n  ") : "none");
const st = sim.state() as any;
console.log("final state:", JSON.stringify({ cwd: st.cwd, repo: st.repo, code: st.code, sandboxes: st.sandboxes, secrets: st.secrets, policy: st.policy }));
const f = sim.files();
console.log("issues.py skip line:", /skip = \(page - 1\) \* page_size/.test(f["project/backend/app/routers/issues.py"]) ? "fixed" : "NOT fixed");
console.log("issues.py search:", /ilike/.test(f["project/backend/app/routers/issues.py"]) && !/raise HTTPException\(status_code=501/.test(f["project/backend/app/routers/issues.py"]) ? "implemented" : "NOT implemented");
console.log("models.py onupdate count:", (f["project/backend/app/models.py"].match(/onupdate=utcnow/g) ?? []).length);
console.log("notifications.py smtplib:", /smtplib/.test(f["project/backend/app/services/notifications.py"]));
console.log("test_notifications.py exists:", "project/backend/tests/test_notifications.py" in f);
