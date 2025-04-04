import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function Loading({ className }: Props) {
  return (
    <svg
      className={cn('dark:invert', className)}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.0"
      width="160px"
      height="20px"
      viewBox="0 0 128 16"
      xmlSpace="preserve"
    >
      <g>
        <path
          d="M-22.949-5.576l4.525,4.525L-41.051,21.576l-4.525-4.525Zm19.2,0L0.776-1.051-21.851,21.576l-4.526-4.525Zm19.2,0,4.525,4.525L-2.651,21.576l-4.525-4.525Zm19.2,0,4.525,4.525L16.549,21.576l-4.525-4.525Zm19.2,0,4.525,4.525L35.749,21.576l-4.526-4.525Zm38.4,0,4.525,4.525L74.149,21.576l-4.525-4.525Zm-19.2,0,4.525,4.525L54.949,21.576l-4.526-4.525Zm38.4,0,4.525,4.525L93.349,21.576l-4.526-4.525Zm19.2,0,4.525,4.525L112.549,21.576l-4.525-4.525Zm19.2,0,4.525,4.525L131.749,21.576l-4.525-4.525Z"
          fill="#000"
        />

        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="-19 0"
          dur="360ms"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}
