export default function TextField({
  label,
  type = "text",
  as = "input",
  placeholder = "",
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  error = "",
  className = "",
  rows,
  variant = "light",
  icon,
  ...props
}) {
  const InputComponent = as;
  const isDark = variant === "dark";

  const baseClasses = `w-full px-4 py-3 rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${as === "textarea" ? "resize-none min-h-[110px]" : ""}`;

  const variantClasses = isDark
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400/60 focus:ring-purple-500/30 backdrop-blur-sm"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/30";

  const labelClasses = isDark ? "text-white" : "text-gray-700";
  const iconColor = isDark ? "text-white" : "text-gray-400";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className={`text-sm font-medium ${labelClasses}`}>
          {label} {required && <span className="text-red-500 ml-1.5"></span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${iconColor}`}
          >
            {icon}
          </div>
        )}
        <InputComponent
          id={name}
          className={`${baseClasses} ${variantClasses} ${error ? "border-red-500" : ""} ${icon ? "pl-11" : "pl-4"}`}
          type={as === "input" ? type : undefined}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
