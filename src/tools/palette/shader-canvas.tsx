"use client";

import { useEffect, useRef } from "react";
import { cn } from "earthling-ui/utils/cn";

const VERT = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;

// Cap the drawing buffer so retina screens do not render four times the pixels
const MAX_DPR = 1.5;

// Raw WebGL2 full-screen-quad shader preview: no three.js, no render loop when
// the canvas is off-screen, one frame only when motion is reduced.
export function ShaderCanvas({
  frag,
  palette,
  className,
  paused = false,
  seed = 0,
}: {
  frag: string;
  palette: number[][];
  className?: string;
  paused?: boolean;
  seed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(new Float32Array(12));
  const pausedRef = useRef(paused);
  const redrawRef = useRef<(() => void) | null>(null);

  const flat = palette.flat();
  const key = flat.join(",");

  useEffect(() => {
    paletteRef.current.set(flat.slice(0, 12));
    redrawRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) redrawRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the viewport with no index buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "time");
    const uSeed = gl.getUniformLocation(program, "seed");
    const uResolution = gl.getUniformLocation(program, "resolution");
    const uPalette =
      gl.getUniformLocation(program, "palette") ?? gl.getUniformLocation(program, "palette[0]");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    let elapsed = 0;
    const draw = () => {
      resize();
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uSeed, seed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform3fv(uPalette, paletteRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    redrawRef.current = draw;
    draw();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || pausedRef.current || still.matches) {
        last = now;
        return;
      }
      elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      draw();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const resizer = new ResizeObserver(() => draw());
    resizer.observe(canvas);

    last = performance.now();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizer.disconnect();
      redrawRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frag, seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("block size-full", className)} />;
}
