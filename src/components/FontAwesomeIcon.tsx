import React from "react";

interface IconProps {
  name: string;
  prefix: "fas" | "far";
  size?: number;
  className?: string;
}

const FontAwesomeIcon: React.FC<IconProps> = ({
  name,
  prefix,
  size = 16,
  className = "",
}) => {
  const iconClassName = `${prefix} fa-${name}`;
  const style = {
    fontSize: `${size}px`,
    width: `${size}px`,
    height: `${size}px`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <span
      className={`${iconClassName} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default FontAwesomeIcon;
