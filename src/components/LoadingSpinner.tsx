import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "w-24 h-24" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src="/hammer-animation.lottie"
        loop
        autoplay
      />
    </div>
  );
}
