"use client";
import { Header } from "@/components/HomePage/Header";
import { MediaList } from "@/components/MediaList/MediaList";
import { useGenres } from "@/hooks/useMovie";
import { useParams } from "next/navigation";

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: genresData } = useGenres();

  const heading =
    genresData?.genre.find((g) => g._id === id)?.name || "Category";

  return (
    <>
      <Header />
      <MediaList heading={heading} genre={id} />
    </>
  );
}
