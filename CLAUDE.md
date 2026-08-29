# divyanshuklai.github.io

Personal portfolio site (static HTML/CSS/JS) plus the LaTeX source for my resume.

## Contact

- **Professional email: `divyanshmohanshukla@hotmail.com`** — use this one on the
  resume and anywhere else outward-facing. It is a personal account, not a
  company address. The older `divyanshaiengineer@gmail.com` is superseded; do not
  put it back.

## Resume

I track exactly one current resume. `resume/` holds it and nothing else; every
other version lives in `resume/archive/`.

The live PDF is `resume/resume_2_26_aug.pdf`, built from
`resume/resume_2_26_aug.tex`. That `.tex` went missing for a while and was
recovered on 2026-08-29; it is checked in now.

### Naming

When I make major changes I start a new file named
`resume_<iter>_<YY>_<mmm>.pdf`, alongside its `.tex`:

- `iter` is the nth resume I have made that month, counting from 1
- `YY` is the numeric year, so 26 for 2026
- `mmm` is the month code: `jan feb mar apr may june july aug sept oct nov dec`

So `resume_2_26_aug` is the second resume I made in August 2026. Small edits do
not earn a new file. I rebuild the current one in place.

### When I cut a new resume

1. Build the new `.pdf` and `.tex` in `resume/`.
2. Move the previous `.pdf` and `.tex` into `resume/archive/`.
3. Update the four references in `resume.html`: the viewer's `data-pdf-src`, the
   Download link, the Open PDF link, and the noscript fallback link. Every other
   page's footer points at `resume.html`, so nothing else needs touching.

Specialized one-off resumes, built for a single company or role, get a
descriptive name instead of the iteration format (`resume_tcs_prime.tex`). They
go straight to `resume/archive/` once they have been used. They never become the
current resume.

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
