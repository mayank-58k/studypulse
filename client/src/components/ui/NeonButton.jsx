export default function NeonButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 font-heading";

  const variants = {
    primary: "bg-neon-primary text-black hover:shadow-lg hover:shadow-neon-primary/50 active:scale-95",
    secondary: "bg-neon-secondary text-black hover:shadow-lg hover:shadow-neon-secondary/50 active:scale-95",
    outline:
      "border-2 border-neon-primary text-neon-primary hover:bg-neon-primary/10 hover:shadow-lg hover:shadow-neon-primary/50 active:scale-95",
    danger: "bg-neon-warning text-white hover:shadow-lg hover:shadow-neon-warning/50 active:scale-95"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
