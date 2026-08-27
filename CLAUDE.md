# divyanshuklai.github.io

Personal portfolio site (static HTML/CSS/JS) plus the LaTeX source for my resume.

## Contact

- **Professional email: `divyanshmohanshukla@hotmail.com`** — use this one on the
  resume and anywhere else outward-facing. It is a personal account, not a
  company address. The older `divyanshaiengineer@gmail.com` is superseded; do not
  put it back.

## Resume

Source lives in `resume/`. The live PDF is `resume/resume_2_26_aug.pdf`, but its
`.tex` was never checked in, so there is no source to rebuild it from here. The
last version with source is `resume/archive/resume_26_aug.tex`. Superseded
versions go in `resume/archive/` rather than being deleted. Only `resume.html`
links the PDF now (a download link and an open-in-tab link), so a rename touches
that one file. Every other page's footer points at `resume.html`.

`js/main.js` renames the file at download time, so what a visitor saves is
`divyansh_shukla_resume_<today>.pdf` regardless of what the PDF is called in the
repo. It targets any `a[download][href$=".pdf"]`, so renaming the PDF does not
break it.

**`resume.html` contains a hand-written HTML copy of the resume** so it reads
properly on a phone, where an embedded PDF does not. It is a transcription, not
a render: change the PDF and you must edit that markup to match, or the page and
the download drift apart.

Build with `pdflatex <name>.tex` (run from `resume/`). Build artifacts
(`.aux`, `.log`, `.out`) are gitignored.

Two rules that keep biting:

- **It must stay one page.** Adding a bullet or a skills line almost always
  spills to page 2 — check `pdftotext <name>.pdf - | awk '/\f/{p=1} p'`
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
