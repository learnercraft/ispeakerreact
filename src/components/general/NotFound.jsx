import TopNavBar from "./TopNavBar";

const NotFound = () => {
    return (
        <>
            <TopNavBar />
            <div className="my-4 text-center">
                <h1 className="fw-bold mb-4">404 - Page Not Found</h1>
                <p>We couldn't find the page you were looking for. Please check to ensure the URL is correct.</p>
                <img className="img-fluid my-4" src={`${import.meta.env.BASE_URL}images/undraw_by_the_road_re_vvs7.svg`} />
            </div>
        </>
    );
};
export default NotFound;
