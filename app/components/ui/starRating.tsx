'use client';

interface Props {
  rating: number;
  max?: number;
}

export default function StarRating({ rating, max = 5 }: Props) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const filled = i < rating;

        return (
          <span
            key={i}
            className={filled ? 'text-yellow-500' : 'text-gray-300'}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
