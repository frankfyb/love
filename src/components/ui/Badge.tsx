interface BadgeProps {
  children: React.ReactNode;
  colorClass: string;
}

const Badge = ({ children, colorClass }: BadgeProps) => (
  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}>
    {children}
  </span>
);

export default Badge;