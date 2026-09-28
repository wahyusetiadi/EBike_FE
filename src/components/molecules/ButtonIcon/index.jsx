import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import "./style.css";

export const ButtonIcon = ({
  icon,
  title,
  className,
  classNameBtn,
  onClick,
  titleColor,
  showArrow = true,
  endIcon,
  linkTo,
  state, // Accept state prop to pass with navigation
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();

    if (linkTo) {
      navigate(linkTo, { state }); // Passing state with navigation
    }
  };

  return (
    <div className="ui-button-icon-wrap">
      <button
        className={`ui-button-icon ${classNameBtn || ""}`}
        data-variant={classNameBtn?.includes("bg-orange-") ? "primary" : "neutral"}
        onClick={handleClick}
      >
        {icon && <span className={`ui-button-icon-graphic ${className || ""}`}>{icon}</span>}
        <span className={`ui-button-icon-label ${titleColor || ""}`}>{title}</span>
        {(showArrow || endIcon) && (
          <span className="ui-button-icon-end">
            {showArrow && <ChevronDownIcon className="size-4" />}
            {endIcon}
          </span>
        )}
      </button>
    </div>
  );
};
