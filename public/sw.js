if (!self.define) {
  let e,
    s = {};
  const a = (a, i) => (
    (a = new URL(a + ".js", i).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = a), (e.onload = s), document.head.appendChild(e));
        } else ((e = a), importScripts(a), s());
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let t = {};
    const d = (e) => a(e, n),
      r = { module: { uri: n }, exports: t, require: d };
    s[n] = Promise.all(i.map((e) => r[e] || d(e))).then((e) => (c(...e), t));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/0ks7FixFiUOBeLn4nussN/_buildManifest.js",
          revision: "8706df8d360f434a572925044f68c454",
        },
        {
          url: "/_next/static/0ks7FixFiUOBeLn4nussN/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1974-4f5cfe6550da4e75.js",
          revision: "4f5cfe6550da4e75",
        },
        {
          url: "/_next/static/chunks/2077-5db2baab162930d6.js",
          revision: "5db2baab162930d6",
        },
        {
          url: "/_next/static/chunks/2098-1950e69e658b4443.js",
          revision: "1950e69e658b4443",
        },
        {
          url: "/_next/static/chunks/2435.7b76b8d48b9f90d6.js",
          revision: "7b76b8d48b9f90d6",
        },
        {
          url: "/_next/static/chunks/2879-dfa06c469961df9d.js",
          revision: "dfa06c469961df9d",
        },
        {
          url: "/_next/static/chunks/3006-1d292042e5d7e1c9.js",
          revision: "1d292042e5d7e1c9",
        },
        {
          url: "/_next/static/chunks/4426-f82c83df38374463.js",
          revision: "f82c83df38374463",
        },
        {
          url: "/_next/static/chunks/4842-6e689916473327f1.js",
          revision: "6e689916473327f1",
        },
        {
          url: "/_next/static/chunks/4b0c18d3-3f36ddeb3e192a1d.js",
          revision: "3f36ddeb3e192a1d",
        },
        {
          url: "/_next/static/chunks/4bd1b696-bf5e0dbacfa5baef.js",
          revision: "bf5e0dbacfa5baef",
        },
        {
          url: "/_next/static/chunks/5772-5e02154705c88040.js",
          revision: "5e02154705c88040",
        },
        {
          url: "/_next/static/chunks/6583-6f0b4a39267251e0.js",
          revision: "6f0b4a39267251e0",
        },
        {
          url: "/_next/static/chunks/6829-0f6e5ab823b3a693.js",
          revision: "0f6e5ab823b3a693",
        },
        {
          url: "/_next/static/chunks/7153-3e8c1f4a6fb9e6f0.js",
          revision: "3e8c1f4a6fb9e6f0",
        },
        {
          url: "/_next/static/chunks/7550-9b95347b8e349514.js",
          revision: "9b95347b8e349514",
        },
        {
          url: "/_next/static/chunks/7807-3dfdda6cb181ca93.js",
          revision: "3dfdda6cb181ca93",
        },
        {
          url: "/_next/static/chunks/7808-45a079b88d77183e.js",
          revision: "45a079b88d77183e",
        },
        {
          url: "/_next/static/chunks/8573-b05a3da272e68eb7.js",
          revision: "b05a3da272e68eb7",
        },
        {
          url: "/_next/static/chunks/8928-5242843269fc546d.js",
          revision: "5242843269fc546d",
        },
        {
          url: "/_next/static/chunks/a4634e51-3331f3b4133da16e.js",
          revision: "3331f3b4133da16e",
        },
        {
          url: "/_next/static/chunks/app/_global-error/page-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-e044b4ca83c0ba17.js",
          revision: "e044b4ca83c0ba17",
        },
        {
          url: "/_next/static/chunks/app/api/subtitle-proxy/route-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/app/downloads/page-2f0c37d706fb0f0d.js",
          revision: "2f0c37d706fb0f0d",
        },
        {
          url: "/_next/static/chunks/app/forgot-password/page-3ba1182496a6a375.js",
          revision: "3ba1182496a6a375",
        },
        {
          url: "/_next/static/chunks/app/history/page-96a57bf11e9258a1.js",
          revision: "96a57bf11e9258a1",
        },
        {
          url: "/_next/static/chunks/app/home/page-6c5d8d433a38fb24.js",
          revision: "6c5d8d433a38fb24",
        },
        {
          url: "/_next/static/chunks/app/layout-4d50d7292d6ea48a.js",
          revision: "4d50d7292d6ea48a",
        },
        {
          url: "/_next/static/chunks/app/login/page-5c1aef1647e355b7.js",
          revision: "5c1aef1647e355b7",
        },
        {
          url: "/_next/static/chunks/app/movie/%5Bid%5D/page-e14f12ff4b06f722.js",
          revision: "e14f12ff4b06f722",
        },
        {
          url: "/_next/static/chunks/app/page-f04fcf089d1d64d4.js",
          revision: "f04fcf089d1d64d4",
        },
        {
          url: "/_next/static/chunks/app/profile/page-ca99a3104bceb223.js",
          revision: "ca99a3104bceb223",
        },
        {
          url: "/_next/static/chunks/app/search/page-4a4918101e2bd485.js",
          revision: "4a4918101e2bd485",
        },
        {
          url: "/_next/static/chunks/app/shorts/%5Bid%5D/page-1afe09c198486a67.js",
          revision: "1afe09c198486a67",
        },
        {
          url: "/_next/static/chunks/app/shorts/page-0389f874717cf91b.js",
          revision: "0389f874717cf91b",
        },
        {
          url: "/_next/static/chunks/app/signup/page-3aa3c942e765c9ae.js",
          revision: "3aa3c942e765c9ae",
        },
        {
          url: "/_next/static/chunks/app/subscription/%5Btoken%5D/page-4d16ac03b697042d.js",
          revision: "4d16ac03b697042d",
        },
        {
          url: "/_next/static/chunks/app/user/changePassword/%5BresetToken%5D/page-4ebd2fe119f4a702.js",
          revision: "4ebd2fe119f4a702",
        },
        {
          url: "/_next/static/chunks/app/user/changePassword/page-76418de0bc689ff8.js",
          revision: "76418de0bc689ff8",
        },
        {
          url: "/_next/static/chunks/app/watchlist/page-b26dced14d245caf.js",
          revision: "b26dced14d245caf",
        },
        {
          url: "/_next/static/chunks/app/who-is-watching/page-cb2e0c576fc8e2f6.js",
          revision: "cb2e0c576fc8e2f6",
        },
        {
          url: "/_next/static/chunks/framework-a7f7b4d2dfa5296c.js",
          revision: "a7f7b4d2dfa5296c",
        },
        {
          url: "/_next/static/chunks/main-3a55d30a5d23965f.js",
          revision: "3a55d30a5d23965f",
        },
        {
          url: "/_next/static/chunks/main-app-5acc14a0545c45cf.js",
          revision: "5acc14a0545c45cf",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/app-error-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/forbidden-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/global-error-ad03426667c78906.js",
          revision: "ad03426667c78906",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/not-found-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-d2e1263159017ea7.js",
          revision: "d2e1263159017ea7",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-c0f72fc209a9f368.js",
          revision: "c0f72fc209a9f368",
        },
        {
          url: "/_next/static/css/5fca04c52d341574.css",
          revision: "5fca04c52d341574",
        },
        {
          url: "/_next/static/css/b7ab3e5331d1d5bf.css",
          revision: "b7ab3e5331d1d5bf",
        },
        {
          url: "/_next/static/media/047eb351a200daf2-s.p.woff2",
          revision: "0e56ce770a43f3f222d981d0c4ae223d",
        },
        {
          url: "/_next/static/media/074a2e369810402d-s.p.woff2",
          revision: "563e37afaf43137eff102e7d2df13d58",
        },
        {
          url: "/_next/static/media/19cfc7226ec3afaa-s.woff2",
          revision: "9dda5cfc9a46f256d0e131bb535e46f8",
        },
        {
          url: "/_next/static/media/21350d82a1f187e9-s.woff2",
          revision: "4e2553027f1d60eff32898367dd4d541",
        },
        {
          url: "/_next/static/media/616b263b18c4d476-s.p.woff2",
          revision: "1883dbf2a8478ca416e6fec6a2f06a4e",
        },
        {
          url: "/_next/static/media/884f508e622cc6d5-s.p.woff2",
          revision: "b967ec125b37f7dc3122c357cc78b6f1",
        },
        {
          url: "/_next/static/media/88858bca2290748b-s.p.woff2",
          revision: "b62ee2778719e40df98050ce8b620769",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/aafb073fa1a155cc-s.p.woff2",
          revision: "e3ec53460246ee6986fdf44884d194f8",
        },
        {
          url: "/_next/static/media/ba9851c3c22cd980-s.woff2",
          revision: "9e494903d6b0ffec1a1e14d34427d44d",
        },
        {
          url: "/_next/static/media/c5fe6dc8356a8c31-s.woff2",
          revision: "027a89e9ab733a145db70f09b8a18b42",
        },
        {
          url: "/_next/static/media/cadda3865c3d59d2-s.p.woff2",
          revision: "6de105dc73504402d1e0316b16ec1618",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        {
          url: "/_next/static/media/f1429c53baafd0f0-s.p.woff2",
          revision: "6d4f7d33856ccf85033642c5e7593de2",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        {
          url: "/firebase-messaging-sw.js",
          revision: "17da2ff286db5c17476b6330bcfc93ca",
        },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/icon-192x192.png",
          revision: "16e86b03f3d9cce7b540dfb81c371795",
        },
        {
          url: "/icons/icon-256x256.png",
          revision: "16e86b03f3d9cce7b540dfb81c371795",
        },
        {
          url: "/icons/icon-384x384.png",
          revision: "16e86b03f3d9cce7b540dfb81c371795",
        },
        {
          url: "/icons/icon-512x512.png",
          revision: "16e86b03f3d9cce7b540dfb81c371795",
        },
        {
          url: "/images/apple.png",
          revision: "323c82f45545df0c07ed155636e36cee",
        },
        { url: "/images/bg.mp4", revision: "c35c7a088563f09ea3c23f11c1fc8c4a" },
        {
          url: "/images/google.png",
          revision: "77c742c6808919a0c4c3b88b65fd34cd",
        },
        {
          url: "/images/image.png",
          revision: "2ade4b2914bab2967a65f98cde01ddc7",
        },
        {
          url: "/images/kids.png",
          revision: "fc0ca28084485cf5eb203884527ba4e3",
        },
        {
          url: "/images/left-arrow.png",
          revision: "dd9fe8a45e70d2ae638407170035437c",
        },
        {
          url: "/images/loading-bg.svg",
          revision: "fa68761b8ae09280426bfa11f83307e0",
        },
        {
          url: "/images/logo-icon.png",
          revision: "1fe63f8dbc94095fd10078b9b9d4cfa5",
        },
        {
          url: "/images/logo-sense.png",
          revision: "4d3dc1c15055e41adfee9674b6d1d77a",
        },
        {
          url: "/images/logo.svg",
          revision: "011ad72eacb72eaf2faea3c1c713f32e",
        },
        {
          url: "/images/movie.png",
          revision: "27033d3ec4badefe8ddf0df0052af632",
        },
        {
          url: "/images/plus.svg",
          revision: "4ce9b3154c633d6a87eb4b62f3c62bfd",
        },
        {
          url: "/images/right-arrow.png",
          revision: "0cf40ccae25d8b361f6836abf86d6e99",
        },
        {
          url: "/images/slide-1.png",
          revision: "6a5082c6a6edd199373e18664add94ff",
        },
        {
          url: "/images/slide-2.png",
          revision: "c57a599d61f17bae22c5ddca7dc5a5b0",
        },
        {
          url: "/images/slide-3.png",
          revision: "4dc4da2f704f2deb4e99267441ab3d44",
        },
        {
          url: "/images/splash-bg.png",
          revision: "79e12aec3213c81bfaa62c363b90bdd9",
        },
        {
          url: "/images/top10.svg",
          revision: "503643ab3b6ae3a967690b68ae208c02",
        },
        { url: "/manifest.json", revision: "ba9e313b47fea574583f5f4915ef7122" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        {
          url: "/swe-worker-5c72df51bb1f6ee0.js",
          revision: "76fdd3369f623a3edcf74ce2200bfdd0",
        },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && "opaqueredirect" === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: "OK",
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith("/api/auth/callback") || !s.startsWith("/api/")),
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") &&
        "1" === e.headers.get("Next-Router-Prefetch") &&
        a &&
        !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") && a && !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0));
});
