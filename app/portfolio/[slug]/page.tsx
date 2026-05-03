import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import {
  getApplicationBySlug,
  getRelatedApplications,
  listSlugs,
} from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Build-time: prerender pages for non-internal slugs. Falls back to
  // dynamic rendering for any slug not in the list at build.
  try {
    const slugs = await listSlugs({ audience: "public" });
    return slugs.map((slug) => ({ slug }));
  } catch {
    // DB unavailable at build time (e.g. CI without .env). Fall back to
    // dynamic rendering.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getApplicationBySlug(slug, { audience: "public" });
  if (!app) return { title: "Not found" };
  return {
    title: `${app.name} · UI AI Portfolio`,
    description: app.tagline ?? app.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getApplicationBySlug(slug, { audience: "public" });
  if (!app) notFound();

  const related = await getRelatedApplications(app, { audience: "public" });

  return (
    <ProjectDetail
      app={app}
      related={related}
      audience="public"
      basePath="/portfolio"
    />
  );
}
