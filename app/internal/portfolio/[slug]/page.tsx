import { notFound } from "next/navigation";
import InterventionDetail from "@/components/InterventionDetail";
import {
  getApplicationBySlug,
  getRelatedApplications,
} from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getApplicationBySlug(slug, { audience: "internal" });
  if (!app) return { title: "Not found" };
  return {
    title: `${app.name} · IIDS Internal`,
    description: app.tagline ?? app.description.slice(0, 160),
  };
}

export default async function InternalInterventionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getApplicationBySlug(slug, { audience: "internal" });
  if (!app) notFound();

  const related = await getRelatedApplications(app, { audience: "internal" });

  return (
    <InterventionDetail
      app={app}
      related={related}
      audience="internal"
      basePath="/internal/portfolio"
    />
  );
}
