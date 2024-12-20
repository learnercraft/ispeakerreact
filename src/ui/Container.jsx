import PropTypes from "prop-types";

const Container = ({ children, className = "", ...props }) => {
    return (
        <main className={`container mx-auto p-4 mb-5 ${className}`} {...props}>
            {children}
        </main>
    );
};

Container.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Container;
