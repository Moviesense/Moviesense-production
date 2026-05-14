import { Category } from "./Category";
import { useLanguage } from "@/context/LanguageContext";
import { Ratings, Rating } from "./Ratings";

interface MovieInfoSidebarProps {
  releasedYear: string;
  languages: string[];
  genres: string[];
  ratings: Rating[];
  director?: {
    name: string;
    image?: string;
  };
  music?: {
    name: string;
    image?: string;
  };
}
export function MovieInfoSidebar({
  releasedYear,
  languages,
  genres,
  ratings,
  director,
  music,
}: MovieInfoSidebarProps) {
  const { t } = useLanguage();
  return (
    <aside className="space-y-6">
      {/* Released Year */}
      <InfoBlock title={t("releasedYear")} value={releasedYear} />

      {/* Languages */}
      {languages.length > 0 && (
        <InfoBlock title={t("availableLanguages")}>
          {languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              {lang}
            </span>
          ))}
        </InfoBlock>
      )}

      {/* Ratings */}
      {/* <InfoBlock title={t("ratings")}>
        <Ratings ratings={ratings} />
      </InfoBlock> */}

      {/* Genres */}
      {genres.length > 0 && (
        <InfoBlock title={t("genres")}>
          {genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              {genre}
            </span>
          ))}
        </InfoBlock>
      )}

      {director && (
        <Category
          title={t("director")}
          name={director.name}
          country={t("director")}
          avatar={director.image || "/images/logo.png"}
        />
      )}

      {music && (
        <Category
          title={t("music")}
          name={music.name}
          country={t("music")}
          avatar={music.image || "/images/logo.png"}
        />
      )}
    </aside>
  );
}

function InfoBlock({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm xl:text-md 2xl:text-lg">{title}</h4>
      {value && <p className="text-sm xl:text-md 2xl:text-lg">{value}</p>}
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
