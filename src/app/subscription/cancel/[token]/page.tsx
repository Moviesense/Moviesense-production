import { Suspense } from "react";
import CancelConfirmView from "@/components/Subscription/CancelConfirmView";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SubscriptionCancelPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-[100vh] bg-black/20 flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      }
    >
      <CancelConfirmView token={token} />
    </Suspense>
  );
}
