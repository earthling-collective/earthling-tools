import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { JwtTool } from "@/tools/jwt/tool";

const tool = findTool("/jwt")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Free online JWT decoder. Inspect a JSON Web Token's header and claims entirely in the browser. The token is never sent to a server.",
  path: tool.href,
  keywords: "jwt decoder, decode jwt online, json web token decoder, jwt claims, inspect jwt, jwt debugger",
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <JwtTool />
      <Prose>
        <h2>About JSON Web Tokens</h2>
        <p>
          A JWT is three base64url-encoded sections joined by dots: a header naming the signing algorithm, a
          payload of claims (who the token is for, when it expires), and a signature over the first two. The
          content is not encrypted, so anyone holding a token can read it, which is exactly what this tool
          does.
        </p>
        <p>
          What the signature adds is tamper-proofing: without the signing key, nobody can alter claims and
          produce a valid signature. That is also why this tool does not verify. Verification needs the key,
          and a secret key should never be pasted into a website.
        </p>
        <p>
          Decoding happens entirely in the browser and the token never leaves the page, which is worth knowing
          because a real token pasted into the wrong online decoder is a leaked credential.
        </p>
      </Prose>
    </ToolPage>
  );
}
