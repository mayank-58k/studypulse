import { forwardRef } from "react";

const GlassmorphInput = forwardRef(
  (
    {
      label,
      placeholder,
      type = "text",
      error,
      helpText,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2 font-heading">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            w-full
            bg-white/5
            backdrop-blur-lg
            border
            border-white/10
            rounded-xl
            px-4
            py-3
            text-white
            placeholder-white/30
            transition-all
            duration-300
            focus:outline-none
            focus:border-neon-primary
            focus:shadow-lg
            focus:shadow-neon-primary/30
            ${error ? "border-neon-warning" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-neon-warning font-medium">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-2 text-sm text-white/50">{helpText}</p>
        )}
      </div>
    );
  }
);

GlassmorphInput.displayName = "GlassmorphInput";

export default GlassmorphInput;
