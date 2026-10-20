Memo is a static client-side collection of memorisation games.  
The full description lives in `PROJECT.md`, which must be read before starting any task.

## Development preferences

- Prefer the simplest maintainable solution; avoid unnecessary dependencies and abstractions.
- Keep changes focused on the requested feature and briefly explain important architectural decisions.
- Run relevant checks after making changes; never claim a test passed unless it was run.
- Never expose secrets or commit credentials; ask before introducing paid services or infrastructure.

## Working rules

- Make the smallest diff that does the job and follow existing style and structure.
- Do not refactor, rename or “improve” unrelated code.
- Never run Git commands or modify Git state.
- Do not add files, tests or scripts unless asked, beyond what a new feature naturally needs.
- Ask when a request is ambiguous or conflicts with the constraints in `PROJECT.md`.
- For large or judgment-heavy changes, investigate and report first, then wait for approval.
- Keep final messages short: name changed files and remind me to rebuild `output.css` if Tailwind classes were added.

## Documentation rule

After completing any change, update `PROJECT.md` in the same edit if anything it describes has changed (structure, behaviour, data shape, localStorage keys, constraints, limitations, design decisions). Add a one-line entry to its design-decisions section whenever a non-obvious choice is made, but only record rationale you actually know or that I gave you; never invent reasons. Edit existing text rather than appending change logs, and remove anything no longer true. Leave `PROJECT.md` untouched if nothing it describes changed. Leave `README.md` alone unless it is now inaccurate. State in your final message whether `PROJECT.md` was updated.

`.opencode/` is OpenCode tooling, not product code.
