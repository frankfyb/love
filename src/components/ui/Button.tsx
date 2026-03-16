import type { ButtonProps } from '@/types';

const Button = ({ children, variant = 'primary', className = '', onClick, icon: Icon, disabled }: ButtonProps) => {
  const baseStyle = "flex items-center justify-center px-6 py-2.5 rounded-full font-medium transition-all duration-300 active:scale-95";
  
  const variants = {
    primary: "bg-rose-400 hover:bg-rose-500 text-white shadow-lg shadow-rose-200 hover:shadow-rose-300",
    secondary: "bg-white hover:bg-pink-50 text-rose-500 border border-pink-100 shadow-sm",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100",
    text: "text-slate-500 hover:text-rose-500 hover:bg-transparent"
  };

  // 禁用状态样式
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabledStyle} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export default Button;