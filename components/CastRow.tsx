interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

interface CastRowProps {
  cast: CastMember[];
  limit?: number;
}

export default function CastRow({ cast, limit = 10 }: CastRowProps) {
  const topCast = cast?.slice(0, limit) || [];

  if (topCast.length === 0) return null;

  return (
    <section className="space-y-4 pt-4">
      <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
        <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
        Main Cast
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {topCast.map((actor) => {
          const imageUrl = actor.profile_path
            ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
            : null;

          return (
            <div
              key={actor.id}
              className="flex-none w-[135px] md:w-[155px] flex flex-col overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-xl"
            >
              {/* Actor Photo Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-neutral-950 text-neutral-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-10 h-10 mb-1 opacity-50"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Actor Name & Character Footer */}
              <div className="p-3 bg-neutral-900/90 backdrop-blur-md flex flex-col justify-between flex-grow">
                <h3 className="text-xs font-bold text-white truncate" title={actor.name}>
                  {actor.name}
                </h3>
                {actor.character && (
                  <p
                    className="text-[10px] text-neutral-400 mt-0.5 truncate"
                    title={actor.character}
                  >
                    {actor.character}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}