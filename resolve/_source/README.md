# ReSolve: one shared international authoring source

The 14 language HTML pages are generated outputs. Edit this single English template and the locale dictionaries, rather than maintaining 14 page copies. All calculation engines and scientific datasets are preserved; original images/PDFs remain in the shared parent assets folder.

Approved visible English wording is in `i18n/locales/en.json` values; lookup keys retain the original source wording as stable identifiers. Update copy there and align every language. Edit the English template for layout changes. The inventory tool (`python resolve/_source/tools/i18n_inventory.py`) reports static and dynamically generated source strings for review when new content is introduced.

Requirements: Python 3.10+, Beautiful Soup 4, and Node.js with Intl support. From the repository root, build a review copy:

```text
python resolve/_source/tools/build_i18n.py --output review
```

After reviewing and testing, regenerate indexable production files in place:

```text
python resolve/_source/tools/build_i18n.py --production --output .
```

This command writes files only; it does not publish. Keep the `_source` directory and shared assets. The default build is noindex. Per-language review JSON contains complete-heading/inline-message overrides and claim alignments. Every original inline link/button must be retained by its numbered placeholder. A missing locale key stops a strict build.

Original source documents remain English. Preserve the isocratic-only scope, method-specific evidence, model assumptions, EUR and all scientific measurements. Do not introduce unsupported savings/compliance claims. Qualified native technical review is recommended for future substantive changes.
