export default function Button({ children, variant = "primary", className = "", ...props }) {
  const classes = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button className={`${classes} ${className}`} {...props}>
      {children}
    </button>
  );
}
