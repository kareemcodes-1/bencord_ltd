import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

const EmptyState = ({
  icon: Icon,
  message,
  buttonText,
  buttonHref,
  onButtonClick,
}: EmptyStateProps) => {
  const showButton = Boolean(buttonText && (buttonHref || onButtonClick));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center sm:gap-5 sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:h-16 sm:w-16">
        <Icon
          size={24}
          strokeWidth={1.5}
          className="text-[#ee0a0a] sm:size-7"
        />
      </div>

      <p className="tracking-[-0.03em] max-w-[min(22rem,100%)] text-[1.15rem] leading-snug text-black/80 lg:text-[1.5rem]">
        {message}
      </p>

      {showButton &&
        (buttonHref ? (
          <Link href={buttonHref} className="btn-primary">
            {buttonText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onButtonClick}
            className="btn-primary"
          >
            {buttonText}
          </button>
        ))}
    </div>
  );
};

export default EmptyState;