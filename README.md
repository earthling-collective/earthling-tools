# Earthling Tools

Free, open-source developer tools that run entirely in the browser. Nothing is uploaded and no account is needed. Live at [tools.earthling.dev](https://tools.earthling.dev).

Built by [Earthling Digital](https://earthling.dev) with [Earthling UI](https://ui.earthling.dev), Next.js and Tailwind CSS 4.

## Development

Requires Node 20+ and [Bun](https://bun.sh).

```sh
bun install
bun run dev
```

`bun run typecheck` and `bun run build` before opening a pull request. Set `NEXT_PUBLIC_GA_ID` to enable Google Analytics; everything else works without configuration.

## Structure

- `src/lib/tools.ts`: the catalog. It feeds the index, search, sitemap, `llms.txt` and structured data.
- `src/tools/<name>/`: one folder per tool. Pure logic and presets in plain `.ts` modules, the interactive UI in `tool.tsx`.
- `src/app/<route>/`: thin route files. `pageMetadata()` builds canonical, Open Graph and Twitter tags; `<ToolPage>` wraps every tool with breadcrumbs, related links and JSON-LD.
- `src/components/tool/`: the shared control vocabulary (workbench, toolbar, panels, fields, select, copy, file drop, prose).

## Adding a tool

1. Create `src/tools/<name>/` with the logic and a client `tool.tsx` composed from `@/components/tool` and Earthling UI.
2. Add a route under `src/app/<name>/page.tsx` that exports `pageMetadata(...)` and renders `<ToolPage>`.
3. Register it in `src/lib/tools.ts`. Preset-driven tools export their presets from the tool folder and list them as `variants` so each preset gets its own indexable page.

Tools must work offline once loaded: no network calls, no server code. Keep comments short and only where they add clarity.

## License

MIT
