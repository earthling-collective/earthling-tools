import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { IconSetTool } from "@/tools/icon-set/tool";

const tool = findTool("/icon-set")!;

export const metadata = pageMetadata({
  title: "App Icon Set Generator (PWA, Expo, Android)",
  description:
    "Generate complete app icon sets from one image: PWA favicons with site.webmanifest, Expo / React Native assets with app.json and Android launcher mipmaps. Free and entirely in the browser.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool} wide>
      <IconSetTool />
      <Prose>
        <h2>What each preset produces</h2>
        <p>
          <strong>Web / PWA</strong> writes 16px and 32px favicons, a 180px apple touch icon, 192px and 512px
          manifest icons and a maskable 512px variant, alongside a <code>site.webmanifest</code> and the
          matching <code>&lt;head&gt;</code> tags. <strong>Expo / React Native</strong> writes the app icon,
          the padded Android adaptive icon, a splash icon and a web favicon, plus the <code>app.json</code>{" "}
          snippet that points at them. <strong>Android Launcher</strong> writes <code>ic_launcher.png</code>{" "}
          for every density bucket from mdpi to xxxhdpi, plus the 512px Play Store icon.
        </p>
        <h2>Safe zones and source images</h2>
        <p>
          Maskable and adaptive icons are cropped by the platform to whatever shape it prefers, so those
          variants are rendered with padding: 10% per side for the PWA maskable icon, 16% for the Android
          adaptive icon and 25% for the Expo splash icon. Everything else is drawn edge to edge.
        </p>
        <p>
          A square source of at least 1024px gives the best result, because every size is scaled down from it.
          A non-square source is letterboxed inside the square canvas rather than cropped. Icons are rendered
          as transparent PNGs on a <code>canvas</code> and zipped in the page, so the image is never uploaded.
        </p>
      </Prose>
    </ToolPage>
  );
}
