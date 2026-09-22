# Earthling Tools

- Next.js App Router, React 19, Tailwind CSS 4, Earthling UI (`earthling-ui/<component>`). Package manager is Bun.
- Every tool is client-side only. Never add server code or network calls to a tool.
- `src/lib/tools.ts` is the only catalog. Preset-driven tools export their preset lists from `src/tools/<name>/` and the catalog derives variants and routes from them.
- Routes are thin: `pageMetadata()` for metadata, `<ToolPage>` for the frame, the tool component from `src/tools/<name>/tool.tsx`.
- Compose UI from `@/components/tool` and Earthling UI before writing new primitives. Icons are Iconify Lucide classes: `icon-[lucide--name]`.
- Theme tokens only (`bg-surface`, `text-muted-foreground`, `border-line`, `text-accent`). No hard-coded colors.
- Comments are short, one line, and only where they add clarity. No implementation diaries.
- Verify with `bun run typecheck` and `bun run build`.
