import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="h-[100vh] w-[100%] bg-transparent flex items-center justify-center absolute top-0 left-0">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );
};
