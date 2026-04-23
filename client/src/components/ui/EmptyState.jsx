export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  actionText = "Get Started",
  className = ""
}) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        py-12
        px-6
        ${className}
      `}
    >
      {Icon && (
        <div className="mb-6 text-neon-primary/50">
          <Icon size={64} />
        </div>
      )}

      {title && (
        <h3 className="text-xl font-bold text-white mb-2 font-heading">
          {title}
        </h3>
      )}

      {message && (
        <p className="text-white/60 text-center max-w-sm mb-6">
          {message}
        </p>
      )}

      {action && (
        <button
          onClick={action}
          className="
            px-6
            py-2
            rounded-lg
            bg-neon-primary
            text-black
            font-semibold
            hover:shadow-lg
            hover:shadow-neon-primary/50
            transition-all
            duration-300
            font-heading
          "
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
