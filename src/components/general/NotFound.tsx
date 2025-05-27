import Container from "../../ui/Container.js";
import TopNavBar from "./TopNavBar.js";

const NotFound = () => {
    return (
        <>
            <TopNavBar />
            <Container>
                <div className="my-8 items-center p-8 text-center">
                    <h1 className="mb-4 text-2xl font-bold">404 - Page Not Found</h1>
                    <p className="text-lg my-4">
                        We couldn’t find the page you were looking for. Please check to ensure the
                        URL is correct.
                    </p>
                    <img
                        className="mx-auto my-4 block object-contain"
                        src={`${import.meta.env.BASE_URL}images/undraw_by_the_road_re_vvs7.svg`}
                        alt="By the road - Undraw illustration"
                    />
                </div>
            </Container>
        </>
    );
};
export default NotFound;
