import PropTypes from "prop-types";

const Pagination = ({ currentPage, totalPages, onPageChange, t, scrollTo }) => {
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                    goToPage(1);
                    scrollTo();
                }}
                disabled={currentPage === 1}
            >
                « {t("wordPage.firstPageBtn")}
            </button>
            <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                    goToPage(currentPage - 1);
                    scrollTo();
                }}
                disabled={currentPage === 1}
            >
                ‹ {t("wordPage.prevPageBtn")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                    (page) => page >= currentPage - 1 && page <= currentPage + 1 // Show nearby pages
                )
                .map((page) => (
                    <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? "btn-primary" : "btn-outline"}`}
                        onClick={() => {
                            goToPage(page);
                            scrollTo();
                        }}
                    >
                        {page}
                    </button>
                ))}
            <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                    goToPage(currentPage + 1);
                    scrollTo();
                }}
                disabled={currentPage === totalPages}
            >
                {t("wordPage.nextPageBtn")} ›
            </button>
            <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                    goToPage(totalPages);
                    scrollTo();
                }}
                disabled={currentPage === totalPages}
            >
                {t("wordPage.lastPageBtn")} »
            </button>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    scrollTo: PropTypes.func,
};

export default Pagination;
