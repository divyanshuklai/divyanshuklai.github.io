# divyanshuklai.github.io

Personal portfolio site (static HTML/CSS/JS) plus the LaTeX source for my resume.

## Contact

- **Professional email: `divyanshmohanshukla@hotmail.com`** — use this one on the
  resume and anywhere else outward-facing. It is a personal account, not a
  company address. The older `divyanshaiengineer@gmail.com` is superseded; do not
  put it back.

## Resume

Source lives in `resume/`. The live PDF is `resume/resume_2_26_aug.pdf`, built
from `resume/resume_2_26_aug.tex`. That `.tex` went missing for a while and was
recovered on 2026-08-29; it is checked in now. Superseded
versions go in `resume/archive/` rather than being deleted. Only `resume.html`
names the PDF now, in three places: the viewer's `data-pdf-src` and the Download
and Open PDF links. Every other page's footer points at `resume.html`.

`js/main.js` renames the file at download time, so what a visitor saves is
`divyansh_shukla_resume_<today>.pdf` regardless of what the PDF is called in the
repo. It targets any `a[download][href$=".pdf"]`, so renaming the PDF does not
break it.

`resume.html` renders the PDF itself with pdf.js, vendored at
`js/vendor/pdfjs/` (version in `VERSION`) so the site pulls nothing from a CDN
at runtime. `js/resume-viewer.js` draws page 1 to a canvas, fit to width, with
pdf.js's text layer over the top so the text stays selectable and findable.
Nothing has to be kept in sync with the PDF: change the PDF and the page follows.

Two things there are load-bearing and easy to break:

- The canvas bitmap is sized in **device** pixels and the element in CSS pixels.
  Size it only with CSS and every rendered PDF goes blurry on a retina screen.
- `main` needs `min-width: 0`. A flex item is sized by its content by default,
  so without it a zoomed-in canvas widens the whole column instead of scrolling
  inside the viewer.

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
