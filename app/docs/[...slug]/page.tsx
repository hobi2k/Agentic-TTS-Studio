import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

async function loadDoc(slug: string[]) {
  const docsRoot = path.join(process.cwd(), "docs");
  const target = path.join(docsRoot, ...slug);

  if (!target.startsWith(docsRoot)) {
    return null;
  }

  try {
    return await fs.readFile(target, "utf-8");
  } catch {
    return null;
  }
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const content = await loadDoc(slug);

  if (!content) {
    notFound();
  }

  return (
    <main className="page-shell">
      <article className="chat-card">
        <h2>{slug.join(" / ")}</h2>
        <pre className="doc-pre">{content}</pre>
      </article>
    </main>
  );
}
