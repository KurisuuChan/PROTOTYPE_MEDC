import PropTypes from "prop-types";
import defaultLogo from "../assets/images/logo-transparent.png";

const Logo = ({ branding }) => {
  const logoUrl = branding?.url || defaultLogo;
  const logoName = branding?.name || "MedCure";

  return (
    <div className="flex items-center space-x-2">
      {/* Logo Image */}
      <div className="h-10 w-10 flex items-center justify-center">
        <img
          src={logoUrl}
          alt={`${logoName} Logo`}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Logo Text */}
      <div className="font-extrabold text-xl text-gray-800">
        <span className="logo-text">{logoName}</span>
      </div>
    </div>
  );
};

Logo.propTypes = {
  branding: PropTypes.shape({
    url: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default Logo;
