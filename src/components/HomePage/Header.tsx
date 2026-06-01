"use client";

import {
  Bell,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Settings,
  Globe,
  Users,
  LogOut,
  ChevronLeft,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn, getCountry } from "@/lib/utils";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/Common/Button";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/hooks/useProfile";
import { Profile } from "@/types/profile";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/context/ToastContext";
import { useRenewSubscription } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { BackgroundVideo } from "../Common/BackgroundVideo";
import { NotificationDropdown } from "../Notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useFcmToken } from "@/hooks/useFcmToken";
import { useGenres } from "@/hooks/useMovie";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, planType, userEmail } =
    useAuth();
  const { data: profileData } = useProfiles();
  const { data: notifications } = useNotifications();
  useFcmToken();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"main" | "language">("main");
  const [isSidebarLangOpen, setIsSidebarLangOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const subItemRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const { data: genresData } = useGenres();

  const activeProfile = profileData?.profiles?.find((p: Profile) => p.isActive);
  const renewSubscription = useRenewSubscription();
  const { track } = useAnalytics();

  const hasUnread = notifications?.some((n) => !n.viewed);

  const AVATAR_COLORS = [
    "from-sky-500 via-cyan-500 to-teal-500",
    "from-purple-500 via-pink-500 to-red-500",
    "from-orange-500 via-amber-500 to-yellow-500",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-indigo-500 via-blue-500 to-sky-500",
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        !(event.target as Element).closest(".user-dropdown")
      ) {
        setIsDropdownOpen(false);
        setActiveMenu("main");
      }
      if (
        isAccountDropdownOpen &&
        !(event.target as Element).closest(".account-dropdown")
      ) {
        setIsAccountDropdownOpen(false);
      }
      if (
        isNotificationOpen &&
        !notificationRef.current?.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        isCategoriesOpen &&
        !(event.target as Element).closest(".categories-dropdown")
      ) {
        setIsCategoriesOpen(false);
      }
      if (
        isMobileCategoriesOpen &&
        !(event.target as Element).closest(".mobile-categories-dropdown")
      ) {
        setIsMobileCategoriesOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isCategoriesOpen, isMobileCategoriesOpen]);

  useEffect(() => {
    const activeKey = pathname?.startsWith("/category")
      ? "categories"
      : pathname;
    const activeEl = activeKey ? subItemRefs.current.get(activeKey) : null;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [pathname]);

  const navItems = [
    ...(isAuthenticated
      ? [
          { name: t("home"), path: "/home" },
          { name: t("movies"), path: "/movies" },
          { name: t("tvShows"), path: "/tv-shows" },
          { name: t("watchlist"), path: "/watchlist" },
          // { name: t("downloads"), path: "/downloads" },
          // { name: t("loopr"), path: "/shorts" },
          { name: t("liveTV"), path: "/live-tv" },
        ]
      : [
          { name: t("home"), path: "/home" },
          { name: t("movies"), path: "/movies" },
          { name: t("tvShows"), path: "/tv-shows" },
        ]),
  ];

  const subItems = [
    ...(isAuthenticated
      ? [
          { name: t("home"), path: "/home" },
          { name: t("movies"), path: "/movies" },
          { name: t("tvShows"), path: "/tv-shows" },
          // { name: t("downloads"), path: "/downloads" },
          // { name: t("loopr"), path: "/shorts" },
          // { name: t("liveTV"), path: "/live-tv" },
        ]
      : [
          { name: t("home"), path: "/home" },
          { name: t("movies"), path: "/movies" },
          { name: t("tvShows"), path: "/tv-shows" },
        ]),
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsAccountDropdownOpen(false);
    setActiveMenu("main");
  };

  const handleProfileClick = () => {
    router.push("/home");
  };

  const handleUpgradePlan = async () => {
    const email = userEmail;
    if (!email) {
      toast("User email not found. Please log in again.", "error");
      return;
    }

    try {
      const country = await getCountry();
      const response = await renewSubscription.mutateAsync({
        email,
        country: country,
      });

      if (response.status && response.token) {
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link.", "error");
      }
    } catch (error) {
      console.error("Renewal error:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex flex-wrap z-1000 items-center justify-between px-3 md:px-5 xl:px-8 z-50 transition-colors duration-300 ${
        isScrolled ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/profile" ||
        pathname === "/forgot-password" ||
        pathname?.startsWith("/user/changePassword")
          ? "bg-background"
          : "bg-background/0"
      }`}
    >
      {/* Desktop Logo & Navigation */}
      {pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname?.startsWith("/user/changePassword") ? (
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer px-4 py-3"
            onClick={handleProfileClick}
          >
            <Image
              src="/images/logo-sense.png"
              loading="eager"
              alt="logo"
              width={180}
              height={100}
              className="w-full h-14"
            />
          </div>
        </div>
      ) : (
        <div className="hidden xl:flex items-center gap-4">
          <div
            className="flex items-center gap-4 cursor-pointer px-4 pr-1 py-3"
            onClick={handleProfileClick}
          >
            <Image
              src="/images/logo-sense.png"
              loading="eager"
              alt="logo"
              width={180}
              height={100}
              className="w-full h-14"
            />
            {/* <img src="/images/logo-sense.png"
            loading="eager" alt="" className="w-12 h-12" /> */}
          </div>

          <nav className="flex items-center gap-1 rounded-lg py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`text-sm xl:text-md 2xl:text-base px-2 py-2 rounded-lg font-medium transition-colors text-nowrap cursor-pointer ${
                    isActive ? "text-primary" : "text-white hover:text-primary"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}

            {/* Categories dropdown */}
            <div className="relative categories-dropdown">
              <button
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className={`text-sm xl:text-md 2xl:text-base px-2 py-2 rounded-lg font-medium transition-colors text-nowrap cursor-pointer flex items-center gap-1 ${
                  pathname?.startsWith("/category")
                    ? "text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {t("categories")}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    isCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoriesOpen && (
                <div
                  className="absolute start-0 top-full mt-2 w-56 bg-[#262d38] shadow-xl overflow-hidden z-50"
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
                  <div className="max-h-80 overflow-y-auto py-1 thin-scrollbar">
                    {genresData?.genre?.length ? (
                      genresData.genre.map((g) => {
                        const isActive = pathname === `/category/${g._id}`;
                        return (
                          <button
                            key={g._id}
                            onClick={() => {
                              router.push(`/category/${g._id}`);
                              setIsCategoriesOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm sm:text-md 2xl:text-base capitalize transition-colors hover:bg-white/5 hover:text-primary cursor-pointer ${
                              isActive ? "text-primary" : "text-white"
                            }`}
                          >
                            {g.name?.toLowerCase()}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-neutral-400">
                        {t("noResults") || "No categories"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Header (Hamburger - Logo - Search) */}
      {pathname !== "/login" &&
        pathname !== "/signup" &&
        pathname !== "/forgot-password" &&
        !pathname?.startsWith("/user/changePassword") && (
          <div className="flex xl:hidden items-center justify-between w-full py-2">
            <button className="text-white" onClick={() => setIsMenuOpen(true)}>
              <Menu size={28} />
            </button>

            <div
              className="flex items-center cursor-pointer absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 py-2"
              onClick={handleProfileClick}
            >
              <Image
                src="/images/logo-sense.png"
                loading="eager"
                alt="logo"
                width={180}
                height={100}
                className="mt-2 h-12 w-full"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                className="text-white hover:text-white p-2"
                onClick={() => router.push("/search")}
              >
                <Search size={24} />
              </button>
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-white hover:text-white p-2 relative"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={24} />
                  {hasUnread && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background shadow-sm" />
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationDropdown
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

      {/* Mobile Sub-Nav (top quick links) */}
      {pathname !== "/login" &&
        pathname !== "/signup" &&
        pathname !== "/forgot-password" &&
        !pathname?.startsWith("/user/changePassword") &&
        subItems.length > 0 && (
          <div className="relative xl:hidden w-full mobile-categories-dropdown">
            <div className="flex w-full justify-between sm:justify-start items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-4">
              {subItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.name}
                    ref={(el) => {
                      subItemRefs.current.set(item.path, el);
                    }}
                    onClick={() => router.push(item.path)}
                    className={`text-sm font-medium px-3 py-2 rounded-md whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}

              {/* Categories trigger */}
              <button
                ref={(el) => {
                  subItemRefs.current.set("categories", el);
                }}
                onClick={() => setIsMobileCategoriesOpen((prev) => !prev)}
                className={`text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                  pathname?.startsWith("/category") || isMobileCategoriesOpen
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white hover:bg-white/10"
                }`}
              >
                {t("categories")}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    isMobileCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {isMobileCategoriesOpen && (
              <div className="absolute start-2 end-2 top-full mt-1 bg-[#262d38] shadow-xl overflow-hidden z-50 rounded-md">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
                <div className="max-h-72 overflow-y-auto py-1 thin-scrollbar">
                  {genresData?.genre?.length ? (
                    genresData.genre.map((g) => {
                      const isActive = pathname === `/category/${g._id}`;
                      return (
                        <button
                          key={g._id}
                          onClick={() => {
                            router.push(`/category/${g._id}`);
                            setIsMobileCategoriesOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors hover:bg-white/5 hover:text-primary cursor-pointer ${
                            isActive ? "text-primary" : "text-white"
                          }`}
                        >
                          {g.name.toLowerCase()}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-neutral-400">
                      {t("noResults") || "No categories"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Desktop Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname?.startsWith("/user/changePassword") ? (
          <div className="relative user-dropdown">
            <button
              onMouseEnter={() => setIsDropdownOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-white transition-colors cursor-pointer hover:text-primary"
            >
              {/* <Globe size={20} /> */}
              <span className="text-sm sm:text-md 2xl:text-base font-medium">
                {t("language")} ({language === "en" ? t("en") : t("ar")})
              </span>
              <ChevronDown size={14} />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute end-0 top-12 w-50 bg-[#262d38] shadow-xl overflow-hidden py-1"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
                {["en"].map((langCode) => {
                  const lang =
                    langCode === "en"
                      ? "(" + t("en") + ") " + t("english")
                      : "(" + t("ar") + ") " + t("arabic");
                  return (
                    <button
                      key={langCode}
                      lang={langCode}
                      onClick={() => {
                        setLanguage(langCode as "en" | "ar");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm sm:text-md 2xl:text-base transition-colors hover:bg-white/5 hover:text-primary flex items-center justify-between cursor-pointer ${
                        language === langCode ? "text-primary" : "text-white"
                      }`}
                    >
                      {lang}
                      {language === langCode && <Check size={20} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-6">
            <Search
              className="cursor-pointer text-white hover:text-white"
              size={22}
              onClick={() => router.push("/search")}
            />
            {/* <Bell className="cursor-pointer text-white hover:text-white" /> */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <div className="relative">
                  <Bell
                    className="cursor-pointer text-white hover:text-primary transition-colors"
                    size={22}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1f252e] pointer-events-none" />
                  )}
                </div>
                {isNotificationOpen && (
                  <NotificationDropdown
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>
            )}

            <div className="flex items-center">
              {!isAuthenticated ? (
                <>
                  <div className="relative user-dropdown">
                    <button
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-2 py-2 mr-2 text-white transition-colors cursor-pointer hover:text-primary"
                    >
                      {/* <Globe size={20} /> */}
                      <span className="text-sm sm:text-md 2xl:text-base font-medium text-nowrap">
                        {t("language")} ({language === "en" ? t("en") : t("ar")}
                        )
                      </span>
                      <ChevronDown size={14} />
                    </button>

                    {isDropdownOpen && (
                      <div
                        className="absolute end-0 top-12 w-50 bg-[#262d38] shadow-xl overflow-hidden"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
                        {["en"].map((langCode) => {
                          const lang =
                            langCode === "en"
                              ? "(" + t("en") + ") " + t("english")
                              : "(" + t("ar") + ") " + t("arabic");
                          return (
                            <button
                              key={langCode}
                              lang={langCode}
                              onClick={() => {
                                setLanguage(langCode as "en" | "ar");
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full font-medium text-left px-4 py-3 text-sm sm:text-md 2xl:text-base transition-colors hover:bg-white/5 hover:text-primary flex items-center justify-between cursor-pointer ${
                                language === langCode
                                  ? "text-primary"
                                  : "text-white"
                              }`}
                            >
                              {lang}
                              {language === langCode && <Check size={20} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="custom"
                    onClick={() => router.push("/login")}
                    className="text-white text-nowrap hover:text-primary sm:text-md font-medium border-none bg-transparent hidden sm:flex sm:h-8 2xl:h-10 py-0 px-0 mr-4 ml-2"
                  >
                    {t("signin")}
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => router.push("/signup")}
                    className="sm:h-8 2xl:h-10 font-bold py-0 xl:min-w-48"
                  >
                    {t("subscribe")}
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative account-dropdown flex items-center pe-4">
                    <button
                      onMouseEnter={() => {
                        setIsAccountDropdownOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      onClick={() =>
                        setIsAccountDropdownOpen(!isAccountDropdownOpen)
                      }
                      className="flex items-center gap-2 py-2 text-white transition-colors cursor-pointer hover:text-primary"
                    >
                      <span className="text-sm sm:text-md 2xl:text-base font-medium text-nowrap">
                        {t("myAccount")}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isAccountDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAccountDropdownOpen && (
                      <div
                        onMouseLeave={() => setIsAccountDropdownOpen(false)}
                        className="absolute end-0 top-10 2xl:top-12 mt-3 w-56 bg-[#262d38] overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
                        <div className="flex flex-col">
                          {/* Account Settings */}
                          <button
                            onClick={() => handleNavigation("/profile")}
                            className="flex items-center gap-3 p-4 hover:bg-background transition-colors text-left text-neutral-300 hover:text-primary cursor-pointer w-full"
                          >
                            <Settings
                              size={20}
                              className="sm:text-xs xl:text-sm 2xl:text-base"
                            />
                            <span className="font-medium sm:text-xs xl:text-sm 2xl:text-base">
                              {t("accountSettings")}
                            </span>
                          </button>

                          {/* <div className="h-px bg-white/5" /> */}

                          {/* Logout */}
                          <button
                            onClick={() => {
                              track(AnalyticsEventType.logout);
                              logout();
                              setIsAccountDropdownOpen(false);
                            }}
                            className="flex items-center cursor-pointer gap-3 p-3 transition-colors text-left text-neutral-300 hover:text-primary w-full"
                          >
                            <LogOut
                              size={20}
                              className="sm:text-xs xl:text-sm 2xl:text-base"
                            />
                            <span className="font-medium sm:text-xs xl:text-sm 2xl:text-base">
                              {t("signOut")}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative user-dropdown flex items-center gap-3">
                    <button
                      onMouseEnter={() => {
                        setIsDropdownOpen(true);
                        setIsAccountDropdownOpen(false);
                      }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 2xl:w-11 2xl:h-11 rounded-full bg-gradient-to-br ${
                          AVATAR_COLORS[
                            Math.max(0, (activeProfile?.imageIndex || 1) - 1) %
                              AVATAR_COLORS.length
                          ]
                        } flex items-center justify-center text-white`}
                      >
                        {activeProfile?.type === "kids" ? (
                          <span className="text-white/90 text-[10px] 2xl:text-sm font-bold">
                            {t("kids")}
                          </span>
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <ChevronDown
                        size={12}
                        className={`text-white transition-transform duration-300 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        onMouseLeave={() => {
                          setIsDropdownOpen(false);
                          setActiveMenu("main");
                        }}
                        className="absolute end-0 2xl:end-5 sm:top-10 2xl:top-14 mt-3 w-64 bg-[#262d38] overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />

                        <div className="flex flex-col gap-1">
                          {activeMenu === "main" ? (
                            <>
                              {/* Active Profile */}
                              <button
                                onClick={() =>
                                  handleNavigation("/who-is-watching")
                                }
                                className="flex items-center cursor-pointer gap-3 p-3 rounded-lg hover:bg-background hover:text-primary transition-colors text-left group"
                              >
                                <div
                                  className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-gradient-to-br ${
                                    AVATAR_COLORS[
                                      Math.max(
                                        0,
                                        (activeProfile?.imageIndex || 1) - 1,
                                      ) % AVATAR_COLORS.length
                                    ]
                                  } flex items-center justify-center text-white shadow-lg`}
                                >
                                  {activeProfile?.type === "kids" ? (
                                    <span className="text-white/90 text-xs 2xl:text-sm font-bold">
                                      {t("kids")}
                                    </span>
                                  ) : (
                                    <User size={24} />
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-white font-bold text-sm sm:text-md xl:text-base">
                                    {activeProfile?.name || "User"}
                                  </span>
                                  <span className="text-neutral-300 text-[10px] sm:text-xs transition-colors flex items-center gap-1">
                                    <Users size={14} />
                                    {t("switchProfile")}
                                  </span>
                                </div>
                              </button>
                              {/* <div className="h-px bg-white/5" /> */}

                              <button
                                onClick={() =>
                                  handleNavigation(
                                    "/who-is-watching?isEditMode=true",
                                  )
                                }
                                className="flex items-center gap-3 p-3 hover:bg-background transition-colors text-left text-neutral-300 hover:text-primary cursor-pointer w-full"
                              >
                                <Settings
                                  size={20}
                                  className="sm:text-xs xl:text-sm 2xl:text-base"
                                />
                                <span className="font-medium sm:text-xs xl:text-sm 2xl:text-base">
                                  {t("manageProfiles")}
                                </span>
                              </button>
                              {/* <div className="h-px bg-white/5" /> */}

                              {/* Language Selection */}
                              <button
                                onClick={() => setActiveMenu("language")}
                                className="w-full flex items-center justify-between p-3 pr-5 rounded-lg hover:bg-background transition-colors text-left text-neutral-300 hover:text-primary cursor-pointer"
                              >
                                <div className="flex items-center gap-3 hover:text-primary">
                                  <Globe
                                    size={20}
                                    className="sm:text-xs xl:text-sm 2xl:text-base"
                                  />
                                  <span className="font-medium sm:text-xs xl:text-sm 2xl:text-base">
                                    {t("language")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 hover:text-primary">
                                  <span className="text-xs xl:text-sm font-medium text-neutral-400">
                                    {language === "en"
                                      ? "(" + t("en") + ") " + t("english")
                                      : "(" + t("ar") + ") " + t("arabic")}
                                  </span>
                                  {/* <ChevronDown
                                    size={14}
                                    className="-rotate-90 sm:text-xs 2xl:text-base"
                                  /> */}
                                </div>
                              </button>
                            </>
                          ) : (
                            <div className="animate-in slide-in-from-right-2 duration-200">
                              {/* Back Button */}
                              <button
                                onClick={() => setActiveMenu("main")}
                                className="flex items-center gap-3 p-3 py-5 rounded-lg hover:bg-white/5 transition-colors text-left text-white hover:text-white cursor-pointer mb-2"
                              >
                                <ChevronLeft size={20} />
                                <span className="font-medium text-xs xl:text-sm 2xl:text-base">
                                  {t("language")}
                                </span>
                              </button>

                              <div className="h-px bg-white/5 mb-2" />

                              {["en"].map((langCode) => {
                                const lang =
                                  langCode === "en"
                                    ? "(" + t("en") + ") " + t("english")
                                    : "(" + t("ar") + ") " + t("arabic");
                                return (
                                  <button
                                    key={langCode}
                                    lang={langCode}
                                    onClick={() => {
                                      track(AnalyticsEventType.changeLanguage);
                                      setLanguage(langCode as "en" | "ar");
                                      setIsDropdownOpen(false);
                                      setActiveMenu("main");
                                    }}
                                    className={`w-full text-left px-4 py-4 sm:text-xs xl:text-sm 2xl:text-base font-medium transition-colors cursor-pointer rounded-lg ${
                                      language === langCode
                                        ? "text-primary"
                                        : "text-white hover:bg-black/15 hover:text-primary"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      {lang}
                                      {language === langCode && (
                                        <Check
                                          size={16}
                                          className="text-primary"
                                        />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {planType === "free_trial" && (
                      <Button
                        variant="primary"
                        onClick={handleUpgradePlan}
                        className="sm:h-8 2xl:h-11 font-bold mr-2 py-0 xl:min-w-48"
                      >
                        {t("upgradePlan")}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 start-0 h-full w-full bg-[#181d25] border-r border-stone-800/50 z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMenuOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        {/* <BackgroundVideo /> */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-4 flex justify-between items-center bg-background">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-2 py-4 px-4">
              <Image
                src="/images/logo-sense.png"
                loading="eager"
                alt="logo"
                width={180}
                height={100}
                className="mt-2 h-12 w-full"
              />
              {/* <span className="text-white font-bold tracking-tight">NABTT</span> */}
            </div>
          </div>

          <div className="flex flex-col flex-1">
            {/* Profile Section */}
            {isAuthenticated && (
              <div className="flex flex-col gap-4 bg-background py-2 pb-4">
                <button
                  onClick={() => handleNavigation("/who-is-watching")}
                  className="flex px-4 items-center cursor-pointer gap-4 transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      AVATAR_COLORS[
                        Math.max(0, (activeProfile?.imageIndex || 1) - 1) %
                          AVATAR_COLORS.length
                      ]
                    } flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform`}
                  >
                    {activeProfile?.type === "kids" ? (
                      <span className="text-white/90 text-sm font-bold">
                        {t("kids")}
                      </span>
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="flex flex-col text-start flex-1">
                    <span className="text-white font-bold text-sm leading-tight">
                      {activeProfile?.name || "User"}
                    </span>
                    <span className="text-neutral-400 text-xs flex items-center gap-1.5 mt-1">
                      {/* <Users size={14} className="text-primary" /> */}
                      {t("switchProfile")}
                    </span>
                  </div>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="flex flex-col gap-4 bg-background pb-4 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavigation("/signup")}
                  className="w-[90%] mx-auto h-10 text-sm font-bold rounded-full"
                >
                  {t("subscribe")}
                </Button>
              </div>
            ) : (
              planType === "free_trial" && (
                <div className="flex flex-col gap-4 bg-background pb-4 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleUpgradePlan}
                    className="w-[90%] mx-auto h-10 text-sm font-bold rounded-full"
                  >
                    {t("upgradePlan")}
                  </Button>
                </div>
              )
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-4 bg-background pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/login")}
                  className="w-[90%] mx-auto h-10 mt-0 text-sm font-bold rounded-full text-white border-gradient"
                >
                  {t("signin")}
                </Button>
              </div>
            )}

            {/* Navigation Menus */}
            <nav className="flex flex-col w-[95%] mx-auto mt-4">
              {/* <span className="px-4 py-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                {t("menu")}
              </span> */}
              <div className="rounded-lg bg-white/5">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center gap-3 border-white/5 w-[90%] mx-auto py-3 border-b transition-all ${
                        isActive
                          ? "text-primary"
                          : "text-white hover:bg-background hover:text-primary"
                      }`}
                    >
                      <span className="font-medium text-sm">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Settings & Other Actions */}
            <div className="flex flex-col gap-1.5 mt-5">
              {/* <span className="px-4 py-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                {t("accountSettings")}
              </span> */}

              <div className="rounded-lg bg-white/5 w-[95%] mx-auto">
                {isAuthenticated && (
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="flex items-center gap-3 px-2 py-3 border-b w-full border-white/5 text-white hover:bg-background hover:text-primary transition-all"
                  >
                    <Settings size={20} className="text-white" />
                    <span className="font-medium text-sm">
                      {t("accountSettings")}
                    </span>
                  </button>
                )}
                <div className="flex flex-col">
                  <button
                    onClick={() => setIsSidebarLangOpen(!isSidebarLangOpen)}
                    className="flex items-center justify-between px-2 py-3 text-white hover:bg-white/5 hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-white" />
                      <span className="font-medium text-sm">
                        {t("language")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/5 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-xs font-medium text-primary capitalize">
                          {language === "en"
                            ? `${t("en")} (${t("english")})`
                            : `${t("ar")} (${t("arabic")})`}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-stone-500 transition-transform duration-300",
                          isSidebarLangOpen && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {isSidebarLangOpen && (
                    <div className="flex flex-col bg-[#181d25] rounded-lg mx-2 mb-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      {["en"].map((langCode) => {
                        const lang =
                          langCode === "en"
                            ? "(" + t("en") + ") " + t("english")
                            : "(" + t("ar") + ") " + t("arabic");
                        return (
                          <button
                            key={langCode}
                            lang={langCode}
                            onClick={() => {
                              track(AnalyticsEventType.changeLanguage);
                              setLanguage(langCode as "en" | "ar");
                              setIsSidebarLangOpen(false);
                            }}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 text-sm transition-colors",
                              language === langCode
                                ? "text-primary"
                                : "text-white hover:bg-white/5",
                            )}
                          >
                            <span className="font-medium">{lang}</span>
                            {language === langCode && <Check size={16} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Sidebar Footer - Sign Out */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      track(AnalyticsEventType.logout);
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-2 py-3 text-white hover:bg-white/5 hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={20} className="text-white" />
                      <span className="font-medium text-sm">
                        {t("signOut")}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
