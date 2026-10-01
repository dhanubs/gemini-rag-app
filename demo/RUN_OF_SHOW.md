# Run of show — AI-driven development with GitHub Copilot (~60 min)

**Thesis:** the developer's job is moving from *typing code* to *specifying intent, curating
context and reviewing output*. We take one feature from idea to merged PR, with AI at every stage.

## T-1 day
- [ ] `pip install -e ".[dev]" && pytest -q` is green locally
- [ ] Copilot enabled for the repo; **coding agent** and **code review** turned on in repo settings
- [ ] Code scanning (CodeQL workflow) has run once on `main`
- [ ] `demo/create-issues.sh` — seed issues created
- [ ] `demo/plant-vuln.sh`, push `demo/vulnerable-upload`, open the PR (don't merge)
- [ ] VS Code: sign in, start both MCP servers in `.vscode/mcp.json`, test the `planner` agent and
      the `/new-endpoint` prompt
- [ ] Full rehearsal ×3. Save checkpoints after each act: `demo/checkpoint.sh save act-N`

## T-30 min
- [ ] Assign issue **"Add request logging with timing"** to Copilot (the PR will be ready by Act 5)
- [ ] Notifications off, font size up (already set in `.vscode/settings.json`), hotspot ready
- [ ] `demo/PROMPTS.md` open in a side tab

## The acts
| # | Time | Act | Feature shown | Key line to land |
|---|---|---|---|---|
| 0 | 3 | Framing | The ladder: completion → chat → IDE agent → cloud agent | "We'll climb this ladder." |
| 1 | 5 | Flow | Completions, **Next Edit Suggestions** | "It predicts the *next edit*, not just the next token." |
| 2 | 7 | Context | `copilot-instructions.md`, path-scoped `*.instructions.md`, `#file`/`#codebase`/`#fetch`, model picker | "Output quality is a function of context." |
| 3 | 15 | Build | `planner` custom agent → **Agent mode**, tests-first, terminal approvals, checkpoints, `/new-endpoint` | "I review a plan, not every keystroke." |
| 4 | 5 | Reach | **MCP**: GitHub + Playwright | "The agent has tools, not just text." |
| 5 | 8 | Delegate | **Coding agent**: assign issue → draft PR → iterate via `@copilot` | "I'm orchestrating, not typing." |
| 6 | 7 | Guard | **Copilot code review**, **CodeQL + Autofix**, `/security-review` | "AI writes, AI and humans review." |
| 7 | 5 | Close | Limits, and Copilot ↔ Claude Code compared (`AGENTS.md` / `CLAUDE.md`) | "The skills transfer; the tool is secondary." |

## If something breaks
- Live generation goes off the rails → narrate it ("this is why we review"), then
  `demo/checkpoint.sh restore act-N`.
- Coding agent slow → walk through the pre-started PR instead.
- Network down → present from the checkpoint branches and pre-recorded screenshots.

## Closing slide: the honest limits
Vague specs in → vague code out · large-scale architecture is still a human call ·
hallucinated APIs (context files help) · "looks right" code needs real review and tests.

## Copilot ↔ Claude Code (for the comparison slide)
This repo is deliberately set up for both:
`AGENTS.md` (shared contract) · `.github/copilot-instructions.md` ↔ `CLAUDE.md` (which imports both) ·
prompt files ↔ slash commands/skills · `planner.agent.md` ↔ subagents · `.vscode/mcp.json` ↔ `.mcp.json` ·
coding agent ↔ Claude Code on the web / GitHub Action.
