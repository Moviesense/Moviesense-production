import ShortsPage from "@/components/Shorts/ShortsPage";

export default async function ShortById({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShortsPage initialShortId={id} />;
}
