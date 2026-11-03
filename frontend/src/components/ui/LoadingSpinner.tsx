interface Props { size?: 'sm' | 'md' | 'lg'; className?: string; }

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const s = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  const t = { sm: 'border-[2px]', md: 'border-[2.5px]', lg: 'border-[3px]' }[size];
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full border-stone-200 border-t-[#e8501e] animate-spin ${s} ${t} ${className}`}
      style={{ animationDuration: '0.75s' }}
    />
  );
}
