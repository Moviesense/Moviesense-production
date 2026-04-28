export const Top10Tag = () => {
  return (
    <span className="absolute top-0 right-0">
      <span className="text-[8px] absolute right-1/2 font-bold translate-x-1/2 top-1 flex justify-center items-center flex-col">
        TOP <span className="text-lg leading-none">10</span>
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="31"
        height="44"
        viewBox="0 0 31 44"
        fill="none"
      >
        <path
          d="M0 44V-1H31V44L15.5 37.9266L0 44Z"
          fill="url(#paint0_linear_572_175)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_572_175"
            x1="20.5"
            y1="-1"
            x2="20.5"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#B50B8D" />
            <stop offset="1" stopColor="#F80C37" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
};
