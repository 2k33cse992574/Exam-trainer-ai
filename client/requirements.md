## Packages
react-markdown | Rendering markdown in chat messages
remark-math | Math syntax support for markdown
rehype-katex | LaTeX rendering for math formulas
date-fns | Date formatting for session history
clsx | Class name utility
tailwind-merge | Class name merging utility

## Notes
Chat uses streaming responses via POST request (fetch + ReadableStream), not standard EventSource (GET).
Typography focuses on JetBrains Mono and Inter for the rigorous academic aesthetic.
Math rendering requires katex CSS.
