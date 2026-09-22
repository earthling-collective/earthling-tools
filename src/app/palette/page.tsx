import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { PaletteTool } from "@/tools/palette/tool";

const tool = findTool("/palette")!;

export const metadata = pageMetadata({
  title: "Shader Palette Generator",
  description:
    "Create customizable color palettes for GLSL shaders with the cosine formula. Live previews, twelve parameters and copy-ready code.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <PaletteTool />
      <Prose>
        <h2>Procedural palette generation</h2>
        <p>
          This tool builds color palettes for GLSL shaders from a short mathematical formula. The technique
          was explained and popularised by{" "}
          <a href="https://iquilezles.org" rel="noreferrer">
            Inigo Quilez
          </a>
          , whose articles on computer graphics and procedural generation are the standard reference for it.
        </p>
        <p>
          The formula produces smooth, cyclical color transitions — useful for adding variation to procedural
          elements, colorizing grayscale signals or driving visual effects:
        </p>
        <p>
          <code>color(t) = a + b * cos(2π(c*t + d))</code>
        </p>
        <p>
          <code>t</code> is the input, normally 0 to 1, and <code>a</code>, <code>b</code>, <code>c</code> and{" "}
          <code>d</code> are three-component vectors — one value per color channel — that shape the palette.{" "}
          <code>a</code> sets the midpoint, <code>b</code> the contrast, <code>c</code> how many cycles the
          palette runs through and <code>d</code> the phase offset per channel.
        </p>
        <p>
          Drag the sliders to change those twelve numbers. The strip and the four example shaders update in
          real time, the address bar keeps a shareable link to the current palette, and the generated GLSL
          below can be pasted straight into a shader. For the full explanation of the technique, read Inigo
          Quilez&rsquo;s{" "}
          <a href="https://iquilezles.org/articles/palettes/" rel="noreferrer">
            Palettes
          </a>{" "}
          article.
        </p>
      </Prose>
    </ToolPage>
  );
}
