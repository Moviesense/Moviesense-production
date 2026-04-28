import { Suspense } from "react";
import SubscriptionFlow from "@/components/Subscription/SubscriptionFlow";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SubscriptionTokenPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-[100vh] bg-black/20 flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      }
    >
      <SubscriptionFlow token={token} />
    </Suspense>
  );
}
