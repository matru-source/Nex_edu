import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";

interface ClientLogo {
  id: string;
  imageUrl: string;
  name: string | null;
  order: number;
  isActive: boolean;
}

interface ClientLogosResponse {
  status: boolean;
  data?: ClientLogo[];
}

const CollabrationScroll: React.FC = () => {
  // Fetch logos from API
  const { data: logosData } = useQuery({
    queryKey: ["client-logos"],
    queryFn: async () => {
      const res = await api.get<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.LIST);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const logos = logosData?.data || [];

  // Don't render if less than 2 logos
  if (logos.length < 2) {
    return null;
  }

  // Quadruple for seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Trusted By Leading Companies</h2>
        <p className="text-muted-foreground">Partnering with industry leaders worldwide</p>
      </div>

      {/* Fade effect on left side */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />

      {/* Fade effect on right side */}
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

      {/* Scrolling container */}
      <div 
        className="flex items-center"
        style={{
          animation: 'scroll 30s linear infinite',
          width: 'fit-content',
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            className="flex-shrink-0 mx-10 opacity-80 hover:opacity-100 transition-all duration-300"
          >
            <div className="w-36 h-20 flex items-center justify-center bg-white/5 rounded-lg p-3">
              <img
                src={logo.imageUrl}
                alt={logo.name || `Partner ${(index % logos.length) + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default CollabrationScroll;
