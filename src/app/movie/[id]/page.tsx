"use client";
import React, { use, useState } from "react";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";
import { HeroCarousel } from "@/components/HomePage/HeroCarousel";
import { DescriptionSection } from "@/components/MovieDetails/DescriptionSection";
import { CastSection } from "@/components/MovieDetails/CastSection";
import { ReviewsSection } from "@/components/MovieDetails/ReviewsSection";
import { MovieInfoSidebar } from "@/components/MovieDetails/MovieInfoSidebar";
import { SeasonsAndEpisodes } from "@/components/MovieDetails/Shows";
import { TrailersSection } from "@/components/MovieDetails/TrailersSection";
import { useMovieDetails } from "@/hooks/useMovie";
import { Loader } from "@/components/Common/Loader";
import { useRenewSubscription } from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/hooks/useProfile";
import { toast } from "@/context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

export default function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const { track } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPlayEpisodeId = searchParams.get("episodeId");
  const autoPlaySeason = searchParams.get("season");
  const {
    data: movieResponse,
    isLoading,
    error,
    refetch,
  } = useMovieDetails(id);
  const { isSubscribed } = useAuth();
  const { data: profilesData } = useProfiles();
  const renewSubscription = useRenewSubscription();

  const [activeTab, setActiveTab] = useState<
    "episodes" | "more-info" | "trailors"
  >("more-info");

  const movieData = movieResponse?.movie?.[0];
  const hasEpisodesData = !!(
    movieData &&
    (movieData.media_type === "series" || movieData.media_type === "tv") &&
    movieData.season &&
    movieData.season.length > 0
  );

  // Set initial tab
  React.useEffect(() => {
    if (hasEpisodesData) {
      setActiveTab("episodes");
    }
  }, [hasEpisodesData]);

  const handleSubscribe = async () => {
    track(AnalyticsEventType.updateSubscriptionByMovie, id);
    if (!profilesData?.email) {
      toast("User email not found", "error");
      return;
    }

    try {
      const response = await renewSubscription.mutateAsync({
        email: profilesData.email,
        country: "UAE", // Default country as per request
      });

      if (response.status && response.token) {
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link", "error");
      }
    } catch (err) {
      console.error("Error renewing subscription:", err);
      toast("An error occurred while processing your request", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !movieResponse?.movie?.[0]) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-4">{t("errorLoadingMovie")}</h1>
        <p className="text-neutral-400">{t("tryAgainLater")}</p>
      </div>
    );
  }

  const movie = movieResponse.movie[0];
  // Map movie data to HeroCarousel slides
  const slides = [
    {
      _id: movie._id,
      image: movie.image || "/images/movie.png",
      title: movie.title,
      description: movie.description,
      videoUrl: movie.link,
      hlsFileName: movie.hlsFileName,
      drmEnabled: movie.drmEnabled,
      mediaType: movie.media_type,
      genres: movie.genre,
      firstEpisode: movie.firstEpisode || movie.episode?.[0],
      videoType: movie.videoType,
      link: movie.link,
      type: movie.type,
      bannerLogo: movie.bannerLogo,
      episodes: movie.episode,
      totalLikes: movie.totalLikes,
      likeStatus: movie.likeStatus,
      isFavorite: movie.isFavorite,
      isRented: movie.isRented,
      ppvCountryPrices: movie.ppvCountryPrices,
      expiryDate: movie.expiryDate,
      clicksLeft: movie.clicksLeft,
      customAd: movie.customAd,
      adDetails: movie.adDetails,
      GoogleAd: movie.GoogleAd,
    },
  ];

  // Map cast data
  const cast =
    movie.cast?.map((member) => ({
      name: member.name,
      image: member.image || "/images/movie.png",
    })) || [];

  // Map reviews data
  const reviews =
    movie.reviews?.map((review) => ({
      name: review.userName,
      location: "Verified User",
      content: review.comment,
    })) || [];

  // Map ratings data
  const ratings = [
    { title: "", value: movie.contentRating || 0 },
    // { title: "Maturity", value: movie.maturity || "G" },
  ].filter((r) => r.value !== 0);
  // Map seasons data
  const seasons =
    movie.season?.map((s) => ({
      ...s,
      season: s.seasonNumber,
      type: s.type || movie?.type || "",
      episodes: (movie.episode || [])
        .filter((ep) => ep.seasonNumber === s.seasonNumber)
        .map((ep) => ({
          ...ep,
          id: ep.episodeNumber,
          title: ep.name,
        })),
    })) || [];

  const hasEpisodes =
    (movie.media_type === "series" || movie.media_type === "tv") &&
    seasons.length > 0;
  const totalEpisodes = movie.episode?.length || 0;

  return (
    <div className="min-h-screen text-white font-manrope]">
      <Header />
      {/* <BackgroundVideo /> */}
      <HeroCarousel
        slides={slides as any}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        from="movie"
        onRefresh={refetch}
      />
      {/* Tabs Navigation */}
      <div className="mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-6 border-b border-neutral-800">
        <div className="flex gap-4 lg:gap-8">
          {hasEpisodes && (
            <button
              onClick={() => setActiveTab("episodes")}
              className={cn(
                "pb-4 text-sm xl:text-lg 2xl:text-lg font-medium transition-all relative cursor-pointer",
                activeTab === "episodes"
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-neutral-200",
              )}
            >
              {t("episodes")}{" "}
              {/* <span className="ml-2 text-xs bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400"> */}
              ({totalEpisodes}){/* </span> */}
              {activeTab === "episodes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab("more-info")}
            className={cn(
              "pb-4 text-sm xl:text-lg 2xl:text-lg font-medium transition-all relative cursor-pointer",
              activeTab === "more-info"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200",
            )}
          >
            {t("moreInfo")}
            {activeTab === "more-info" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          {movie.media_type == "movie" && (
            <button
              onClick={() => setActiveTab("trailors")}
              className={cn(
                "pb-4 text-sm xl:text-lg 2xl:text-lg font-medium transition-all relative cursor-pointer",
                activeTab === "trailors"
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-neutral-200",
              )}
            >
              Trailers & More
              {activeTab === "trailors" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
        </div>
      </div>
      <section className="mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-4 sm:mt-7 mb-12">
        <div className="space-y-8">
          {activeTab === "episodes" && hasEpisodes && (
            <SeasonsAndEpisodes
              seasons={seasons}
              movieId={movie._id}
              isSubscribed={isSubscribed}
              autoPlayEpisodeId={autoPlayEpisodeId || undefined}
              autoPlaySeason={
                autoPlaySeason ? parseInt(autoPlaySeason) : undefined
              }
              onRefresh={refetch}
            />
          )}

          {activeTab === "more-info" && (
            <div className="space-y-6">
              <DescriptionSection description={movie.description} />
              <MovieInfoSidebar
                releasedYear={new Date(movie.year).getFullYear().toString()}
                languages={[]}
                genres={[]}
                ratings={ratings as any}
                director={movie.director}
                music={movie.music}
              />
              {cast.length > 0 && <CastSection cast={cast} />}
              {reviews.length > 0 && <ReviewsSection reviews={reviews} />}
            </div>
          )}

          {activeTab === "trailors" && (
            <TrailersSection movieId={movie._id} fallbackImage={movie.image} />
          )}
        </div>
      </section>
    </div>
  );
}
