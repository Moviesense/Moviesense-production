import ResetPassword from "@/components/Signup/ResetPassword";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";

export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ resetToken: string }>;
}) {
  const { resetToken } = await params;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <ResetPassword resetToken={resetToken} />
      </div>
      <Footer />
    </div>
  );
}
