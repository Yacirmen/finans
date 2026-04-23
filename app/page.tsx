import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

function getCurrentSiteBody() {
  const htmlPath = path.join(process.cwd(), "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? "";

  return body.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

export default function HomePage() {
  const bodyHtml = getCurrentSiteBody();

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/app.js?v=20260423-next1" strategy="afterInteractive" />
    </>
  );
}
