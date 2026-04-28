import { stripHtml } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface DescriptionSectionProps {
  description: string;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-2">
      {/* <h3 className="font-medium text-sm xl:text-md 2xl:text-xl">
        {t("description")}
      </h3> */}
      <p className="text-xs xl:text-md 2xl:text-base capitalize">
        {stripHtml(description)}
      </p>
    </div>
  );
}
