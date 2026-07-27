import { redirect } from "next/navigation";

// Retired with the internal portfolio index — see ../page.tsx for why.
// Keeps the slug so a bookmarked project detail lands on that project's
// public page rather than the inventory index.

export default async function InternalProjectRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/portfolio/${slug}`);
}
