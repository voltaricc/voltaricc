import Image from 'next/image';
import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  posterPath: string | null;
};

export default function PosterCard({ href, title, posterPath }: Props) {
  return (
    <Link href={href} className="shrink-0 w-36 md:w-44">
      <div className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300 hover:-translate-y-1">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              fill
              sizes="(min-width: 768px) 176px, 144px"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-neutral-500">
              {title}
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="font-semibold text-xs truncate text-neutral-100">{title}</h3>
        </div>
      </div>
    </Link>
  );
}