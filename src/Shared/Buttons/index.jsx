import PropTypes from "prop-types";
import clsx from "clsx";

const Button = ({
  children,
  variant = "primary", // primary | secondary | danger | outline
  size = "md", // sm | md | lg
  disabled = false,
  className = "",
  ...props
}) => {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  // Size variants
  const sizeStyles = {
    sm: "h-9 px-4 text-sm",
    md: "h-10 px-6 text-sm",
    lg: "h-11 px-8 text-base",
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-[#153498] text-white hover:bg-blue-800",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-blue-700 text-blue-700 hover:bg-blue-50",
  };

  let finalVariant = variant;

  if (typeof children === "string") {
    const text = children.toLowerCase().trim();
    if (text === "cancel") {
      finalVariant = "danger";
    } else if (["submit", "login", "signup"].includes(text)) {
      finalVariant = "primary";
    }
  }

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[finalVariant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
