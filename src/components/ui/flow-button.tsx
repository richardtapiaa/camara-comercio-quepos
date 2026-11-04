interface FlowButtonProps {
  text: string;
  className?: string;
}

export function FlowButton({ text, className = '' }: FlowButtonProps) {
  return (
    <span
      className={`rounded-full bg-[#222222] px-7 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-[#444444] ${className}`}
    >
      {text}
    </span>
  );
}
