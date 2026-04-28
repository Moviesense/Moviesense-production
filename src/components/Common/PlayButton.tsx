export default function PlayButton({ onClick }: { onClick: () => void }) {
  return (
    <span>
      <span
        className="relative flex shrink-0 items-center justify-center text-shahidGray h-[24px] w-[24px] md:h-[27px] md:w-[27px]"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="absolute inset-0 h-full w-full group-hover/media-btn:hidden"
        >
          <defs>
            <linearGradient
              id="linearGradient-0.2846585821788603"
              x1="0%"
              x2="100%"
              y1="50%"
              y2="50%"
            >
              <stop offset="0%" stop-color="#0C9"></stop>
              <stop offset="100%" stop-color="#09F"></stop>
            </linearGradient>
          </defs>
          <g
            fill="none"
            fill-opacity="0.4"
            fill-rule="evenodd"
            stroke="none"
            stroke-width="1"
          >
            <rect
              width="30"
              height="30"
              x="1"
              y="1"
              fill="#181D25"
              stroke="url(#linearGradient-0.2846585821788603)"
              rx="15"
            ></rect>
          </g>
        </svg>
        <span className="absolute inset-0 hidden h-full w-full rounded-full bg-primary group-hover/media-btn:inline-block"></span>
        <img
          alt="playIcon"
          title="Play"
          className="relative h-[16px] w-[16px] 2xl:vw-h-[14] 2xl:vw-w-[14]"
          src="https://shahid.mbc.net/staticFiles/production/static/images/shdicons-24-2-px-player-play-filled.svg"
        />
      </span>
      Watch Now
    </span>
  );
}
