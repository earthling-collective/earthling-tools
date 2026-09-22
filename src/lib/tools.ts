import { audioPairs } from "@/tools/audio/formats";
import { basePairs } from "@/tools/base/bases";
import { colorPairs } from "@/tools/color/spaces";
import { conversionPairs } from "@/tools/convert/formats";
import { cronPresets } from "@/tools/cron/cron";
import { generators } from "@/tools/generate/generators";
import { hashAlgos } from "@/tools/hash/hashes";
import { textTransformGroups, textTransforms } from "@/tools/text/transforms";

// Single source of truth for the index, search, sitemap and llms.txt

export type ToolVariant = { href: string; label: string };

export type Tool = {
  href: string;
  title: string;
  description: string;
  icon: string;
  keywords: string;
  category: CategoryId;
  variants?: ToolVariant[];
};

export type CategoryId = "text" | "images" | "audio" | "generators" | "color";

export type Category = { id: CategoryId; label: string; icon: string; blurb: string };

export const categories: Category[] = [
  { id: "text", label: "Text & Data", icon: "icon-[lucide--type]", blurb: "Transform, decode and inspect" },
  {
    id: "images",
    label: "Images & Icons",
    icon: "icon-[lucide--image]",
    blurb: "Convert, resize and package",
  },
  {
    id: "audio",
    label: "Audio & Video",
    icon: "icon-[lucide--audio-lines]",
    blurb: "Transcode without leaving the tab",
  },
  {
    id: "generators",
    label: "Generators",
    icon: "icon-[lucide--dices]",
    blurb: "Realistic placeholder data",
  },
  {
    id: "color",
    label: "Color & Shaders",
    icon: "icon-[lucide--palette]",
    blurb: "For designers and shader folks",
  },
];

const textGroups: Record<string, Pick<Tool, "title" | "icon" | "description" | "keywords">> = {
  "Change Case": {
    title: "Case Converter",
    icon: "icon-[lucide--case-sensitive]",
    description: "Convert text between UPPERCASE, camelCase, snake_case, kebab-case, slugs and more.",
    keywords: "case converter, uppercase, camelcase, snake case, kebab case, slugify",
  },
  "Whitespace & Lines": {
    title: "Whitespace & Line Tools",
    icon: "icon-[lucide--align-left]",
    description: "Trim whitespace, collapse spaces, dedupe and sort lines, remove line breaks.",
    keywords: "trim whitespace, remove line breaks, sort lines, dedupe lines",
  },
  "Data Formats": {
    title: "Encode, Decode & Format",
    icon: "icon-[lucide--braces]",
    description: "Format and minify JSON, encode and decode Base64, URLs and HTML entities.",
    keywords: "json formatter, base64, url encode, html entities",
  },
};

const generatorIcons: Record<string, string> = {
  password: "icon-[lucide--lock-keyhole]",
  uuid: "icon-[lucide--fingerprint-pattern]",
  "hex-color": "icon-[lucide--palette]",
  "hex-string": "icon-[lucide--hash]",
  "lorem-ipsum": "icon-[lucide--text]",
  name: "icon-[lucide--user-round]",
  email: "icon-[lucide--mail]",
  "phone-number": "icon-[lucide--phone]",
  "ip-address": "icon-[lucide--globe]",
  "mac-address": "icon-[lucide--router]",
  "credit-card": "icon-[lucide--credit-card]",
  date: "icon-[lucide--calendar]",
};

type Pair = { slug: string; from: { label: string }; to: { label: string } };
const pairVariants = (base: string, pairs: Pair[]) =>
  pairs.map((p) => ({ href: `${base}/${p.slug}`, label: `${p.from.label} → ${p.to.label}` }));

export const tools: Tool[] = [
  ...textTransformGroups.map((group): Tool => {
    const members = textTransforms.filter((t) => t.group === group);
    return {
      ...textGroups[group],
      href: `/text/${members[0].slug}`,
      category: "text",
      keywords: `${textGroups[group].keywords}, ${members.map((t) => t.label).join(", ")}`,
      variants: members.map((t) => ({ href: `/text/${t.slug}`, label: t.label })),
    };
  }),
  {
    href: "/cron",
    title: "Cron Expression Explainer",
    description: "Type a cron schedule and get plain English, a field breakdown and the next run times.",
    icon: "icon-[lucide--clock]",
    keywords: "cron expression, crontab, cron schedule, cron every 5 minutes",
    category: "text",
    variants: cronPresets.map((p) => ({ href: `/cron/${p.slug}`, label: p.label })),
  },
  {
    href: "/base",
    title: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal and hex at any size, via BigInt.",
    icon: "icon-[lucide--binary]",
    keywords: "number base converter, binary to decimal, decimal to hex, hex to binary, radix",
    category: "text",
    variants: pairVariants("/base", basePairs),
  },
  {
    href: "/hash/sha256",
    title: "Hash Generator",
    description: "MD5, SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text, computed locally.",
    icon: "icon-[lucide--shield-check]",
    keywords: "hash generator, md5, sha1, sha256, sha512, checksum, hash text online",
    category: "text",
    variants: hashAlgos.map((a) => ({ href: `/hash/${a.slug}`, label: a.label })),
  },
  {
    href: "/timestamp",
    title: "Unix Timestamp Converter",
    description: "Epoch seconds, millis or micros to human dates and back, with a live current timestamp.",
    icon: "icon-[lucide--calendar-clock]",
    keywords: "unix timestamp converter, epoch converter, timestamp to date, current unix time",
    category: "text",
  },
  {
    href: "/jwt",
    title: "JWT Decoder",
    description: "Inspect the header and claims of a JSON Web Token without it ever leaving your browser.",
    icon: "icon-[lucide--key-round]",
    keywords: "jwt decoder, decode jwt, json web token, jwt claims, jwt debugger",
    category: "text",
  },
  {
    href: "/word-counter",
    title: "Word Counter",
    description: "Live word, character, sentence and paragraph counts with reading time.",
    icon: "icon-[lucide--whole-word]",
    keywords: "word counter, character counter, count words, sentence counter, reading time",
    category: "text",
  },
  {
    href: "/diff",
    title: "Text Diff Checker",
    description: "Compare two versions of a text line by line, entirely in your browser.",
    icon: "icon-[lucide--git-compare]",
    keywords: "diff checker, text compare, compare texts, text difference",
    category: "text",
  },
  {
    href: "/convert",
    title: "Image Converter",
    description: "Convert images between PNG, JPG, WebP and AVIF with quality control.",
    icon: "icon-[lucide--replace]",
    keywords: "image converter, png to webp, jpg to png, avif converter",
    category: "images",
    variants: pairVariants("/convert", conversionPairs),
  },
  {
    href: "/resize",
    title: "Image Resizer",
    description: "Resize images to exact dimensions: crop, letterbox or stretch.",
    icon: "icon-[lucide--scaling]",
    keywords: "image resizer, resize image, scale image, crop",
    category: "images",
  },
  {
    href: "/icon-set",
    title: "App Icon Set Generator",
    description:
      "One image in, complete icon sets out: PWA, Expo / React Native and Android, with JSON configs.",
    icon: "icon-[lucide--layout-grid]",
    keywords: "app icon generator, pwa icons, expo icons, react native, android launcher, webmanifest",
    category: "images",
  },
  {
    href: "/audio",
    title: "Audio Converter",
    description:
      "Convert audio between MP3, WAV, AIFF, FLAC, OGG, M4A and Opus, or extract audio from video.",
    icon: "icon-[lucide--file-audio]",
    keywords:
      "audio converter, mp3 to wav, wav to mp3, flac to mp3, mp4 to mp3, extract audio from video, ffmpeg",
    category: "audio",
    variants: pairVariants("/audio", audioPairs),
  },
  ...generators.map(
    (g): Tool => ({
      href: `/generate/${g.slug}`,
      title: g.title,
      description: g.description.replace(/^Free online /, "").replace(/^./, (c) => c.toUpperCase()),
      icon: generatorIcons[g.slug] ?? "icon-[lucide--dices]",
      keywords: g.keywords,
      category: "generators",
    }),
  ),
  {
    href: "/color",
    title: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL and OKLCH. Paste one format, copy any other.",
    icon: "icon-[lucide--pipette]",
    keywords: "color converter, hex to rgb, rgba to hex, rgb to hsl, hex to oklch, css colors",
    category: "color",
    variants: pairVariants("/color", colorPairs),
  },
  {
    href: "/palette",
    title: "Shader Palette Generator",
    description: "Design cosine-based color palettes for GLSL shaders and copy the function out.",
    icon: "icon-[lucide--swatch-book]",
    keywords: "glsl palette, cosine palette, shader colors, inigo quilez palette",
    category: "color",
  },
];

export const findCategory = (id: CategoryId) => categories.find((c) => c.id === id)!;

export const toolsIn = (id: CategoryId) => tools.filter((t) => t.category === id);

// A tool owns a route when the route is its href or one of its variants
export const findTool = (href: string) =>
  tools.find((t) => t.href === href || t.variants?.some((v) => v.href === href));

export const toolRoutes = [
  "/",
  ...new Set(tools.flatMap((t) => [t.href, ...(t.variants?.map((v) => v.href) ?? [])])),
];
