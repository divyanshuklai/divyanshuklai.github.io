# divyanshuklai.github.io

Personal portfolio site (static HTML/CSS/JS) plus the LaTeX source for my resume.

## Contact

- **Professional email: `divyanshmohanshukla@hotmail.com`** — use this one on the
  resume and anywhere else outward-facing. It is a personal account, not a
  company address. The older `divyanshaiengineer@gmail.com` is superseded; do not
  put it back.

## Resume

Source lives in `resume/`, current version is `resume_03_aug.tex`. Superseded
versions go in `resume/archive/` rather than being deleted, and the seven HTML
pages that link the PDF all need updating when the filename changes.

Build with `pdflatex resume_03_aug.tex` (run from `resume/`). Build artifacts
(`.aux`, `.log`, `.out`) are gitignored.

Two rules that keep biting:

- **It must stay one page.** Adding a bullet or a skills line almost always
  spills to page 2 — check `pdftotext resume_03_aug.pdf - | awk '/\f/{p=1} p'`
  and cut something to compensate.
- **Every bullet must be backed by code that actually exists in the repo it
  links to.** An earlier version claimed a video diffusion pipeline, an RLHF/DPO/
  GRPO training stack, and a replicated teacher-student RL method, none of which
  were implemented. Open the files before writing a claim.

Editable fields are macros at the top of the `.tex`: `\graddate`, `\introle`,
`\intdates`.

## Writing style

Plain and direct. No em dashes in rendered text, no "end-to-end", no
"orchestrated"/"engineered" where "ran"/"wrote" works, no stacked "X rather than
Y" constructions, no trailing participle clauses ("..., training YOLOv8n on...").
