// Lazy singleton around ffmpeg.wasm. The core is ~31 MB, so nothing loads until the
// first conversion. Core files are self-hosted from public/ffmpeg.

import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { AudioFormat } from "./formats";

let ffmpegPromise: Promise<FFmpeg> | null = null;

export const loadFFmpeg = () => {
  ffmpegPromise ??= (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({ coreURL: "/ffmpeg/ffmpeg-core.js", wasmURL: "/ffmpeg/ffmpeg-core.wasm" });
    return ffmpeg;
  })();
  // A failed load shouldn't poison every later attempt
  ffmpegPromise.catch(() => (ffmpegPromise = null));
  return ffmpegPromise;
};

export const isFFmpegLoaded = () => ffmpegPromise !== null;

// -vn strips video streams and album art, which otherwise break audio-only muxers
const encoderArgs = (to: AudioFormat, kbps: number): string[] => {
  switch (to.slug) {
    case "mp3":
      return ["-vn", "-c:a", "libmp3lame", "-b:a", `${kbps}k`];
    case "wav":
    case "aiff":
      return ["-vn"];
    case "flac":
      return ["-vn", "-c:a", "flac"];
    case "ogg":
      return ["-vn", "-c:a", "libvorbis", "-b:a", `${kbps}k`];
    case "m4a":
      return ["-vn", "-c:a", "aac", "-b:a", `${kbps}k`];
    case "opus":
      return ["-vn", "-c:a", "libopus", "-b:a", `${kbps}k`];
    default:
      return ["-vn"];
  }
};

export async function convertAudio(
  file: File,
  to: AudioFormat,
  kbps: number,
  onProgress?: (ratio: number) => void,
) {
  const ffmpeg = await loadFFmpeg();

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const input = `input.${ext}`;
  const output = `output.${to.slug}`;

  // ffmpeg reports odd ratios on some containers, keep it sane
  const progress = ({ progress }: { progress: number }) => onProgress?.(Math.min(1, Math.max(0, progress)));
  ffmpeg.on("progress", progress);

  try {
    await ffmpeg.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    const code = await ffmpeg.exec(["-i", input, ...encoderArgs(to, kbps), output]);
    if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
    const data = (await ffmpeg.readFile(output)) as Uint8Array;
    return new Blob([data as BlobPart], { type: to.mime });
  } finally {
    ffmpeg.off("progress", progress);
    // memfs survives between runs, don't hoard files
    await ffmpeg.deleteFile(input).catch(() => {});
    await ffmpeg.deleteFile(output).catch(() => {});
  }
}
