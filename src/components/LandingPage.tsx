import Carousel from "@/components/CarouselLandingPage";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div
      className="w-full h-[100vh] bg-gradient-to-b from-neutral-900/0 to-neutral-900"
      style={{
        backgroundImage: "url('/images/loading-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Carousel
        autoPlay={false}
        interval={3500}
        height="h-[100vh]"
        onFinish={() => router.push("/login")}
        slides={[
          {
            // image: "/images/slide-1.png",
            title: "Build Faster",
            subtitle: "Create modern, scalable applications with ease",
          },
          {
            // image: "/images/slide-2.png",
            title: "Powerful UI",
            subtitle: "Design systems that look great on every device",
          },
          {
            // image: "/images/slide-3.png",
            title: "Unlimited entertainment, one low price",
            subtitle: "All of DK, starting at just $149",
          },
        ]}
      />
    </div>
  );
}
