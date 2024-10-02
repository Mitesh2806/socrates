'use client';
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TeamMemberItem } from "./ui/teamcard";
import { useState, useEffect, useCallback } from "react";

const teamMembers = [
  {
    picture: "/assets/team_placeholder.jpg",
    fullName: "Prince",
    designation: "UI/UX Designer & Frontend Developer",
    socialLinks: [{ icon: faInstagram, href: "#" }],
  },
  {
    picture: "/assets/team_placeholder.jpg",
    fullName: "Mitesh Maity",
    designation: "Backend Developer",
    socialLinks: [{ icon: faInstagram, href: "#" }],
  },
  {
    picture: "/assets/team_placeholder.jpg",
    fullName: "Suraj Kumar Jha",
    designation: "ML Engineer",
    socialLinks: [{ icon: faInstagram, href: "#" }],
  },
  {
    picture: "/assets/team_placeholder.jpg",
    fullName: "Rohit ",
    designation: "Android Developer",
    socialLinks: [{ icon: faInstagram, href: "#" }],
  },
];

export default function Team(): JSX.Element {
  const [moonWidth, setMoonWidth] = useState(0);
  const handleResize = useCallback(() => {
    setMoonWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  return (
    <section
      id="team"
      className="ezy__team9 relative py-14 md:py-24 w-[96vw] m-2 rounded-xl  p-10 md:p-20 bg-black text-zinc-900 dark:text-white overflow-hidden"
    >
      <div className="container px-4 mx-auto">
        <div className="flex justify-start mb-6 md:mb-12">
          <div className="max-w-lg text-start">
            <div className="inline-flex gap-1 items-center bg-white/20 bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl px-4 py-2 text-white text-[.8rem] mb-2 md:text-[1rem] max-w-max">
              <span className="bg-white/20 bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-md px-2 text-white">
                <FontAwesomeIcon icon={faUserPlus} />
              </span>
              Team
            </div>
            <h2 className="text-3xl leading-none text-white font-bold md:text-[45px] mb-4">
              Our Experts Team
            </h2>
            <p className="text-gray-500">
              Meet our team of experts who have a wealth of experience in their
              respective fields. We are committed to providing the best services
              to our clients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 text-center pt-6">
          {teamMembers.map((member, i) => (
            <div
              className="col-span-4 md:col-span-2 lg:col-span-1 z-[1]"
              key={i}
            >
              <TeamMemberItem member={member} />
            </div>
          ))}
        </div>
      </div>
      <svg
        className="absolute top-0 left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-0"
        xmlns="http://www.w3.org/2000/svg"
        width={moonWidth}
        height={moonWidth}
        viewBox="0 0 1910 1910"
        fill="white"
      >
        <g filter="url(#filter0_f_3050_2200)">
          <path
            d="M954.562 624C866.892 624 782.812 658.827 720.82 720.82C658.827 782.812 624 866.892 624 954.562C624 1042.23 658.827 1126.31 720.82 1188.31C782.812 1250.3 866.892 1285.12 954.562 1285.12C1042.23 1285.12 1126.31 1250.3 1188.31 1188.31C1250.3 1126.31 1285.12 1042.23 1285.12 954.562C1285.12 866.892 1250.3 782.812 1188.31 720.82C1126.31 658.827 1042.23 624 954.562 624ZM1138.07 973.59C1134 978.941 1128.36 982.887 1121.94 984.877L1070.02 1002.29C1054.15 1007.72 1039.71 1016.64 1027.77 1028.41C1015.91 1040.28 1006.97 1054.75 1001.65 1070.66L983.91 1122.58C981.524 1128.44 977.629 1133.56 972.623 1137.42C967.268 1141.3 960.851 1143.44 954.24 1143.55C947.595 1143.65 941.115 1141.48 935.858 1137.42C930.494 1133.57 926.442 1128.17 924.248 1121.94L907.155 1070.02C901.843 1054.05 892.862 1039.54 880.933 1027.67C869.003 1015.8 854.458 1006.88 838.462 1001.65L786.863 984.555C780.636 982.361 775.232 978.308 771.383 972.945C767.362 967.664 765.207 961.199 765.255 954.562C765.298 947.841 767.441 941.302 771.383 935.858C775.086 930.63 780.416 926.774 786.54 924.892L838.462 907.477C854.513 902.042 869.16 893.121 881.355 881.355C893.287 869.293 902.221 854.587 907.477 838.462L924.892 787.508C926.825 781.406 930.53 776.017 935.535 772.028C940.679 767.684 947.185 765.287 953.917 765.255C960.316 765.145 966.603 766.941 971.977 770.415C977.653 773.943 981.971 779.284 984.233 785.573L1001.65 838.14C1007.07 854.362 1016.1 869.132 1028.09 881.355C1040.21 893.056 1054.74 901.971 1070.66 907.477L1122.58 925.538C1128.76 927.504 1134.09 931.477 1137.74 936.825C1141.51 942.217 1143.53 948.631 1143.55 955.208C1143.52 961.722 1141.61 968.108 1138.07 973.59Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_3050_2200"
            x="0"
            y="0"
            width="1909.12"
            height="1909.12"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="312"
              result="effect1_foregroundBlur_3050_2200"
            />
          </filter>
        </defs>
      </svg>
      
    </section>
  );
}