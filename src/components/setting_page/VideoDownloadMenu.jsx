import { Button, Card, Col, Row } from "react-bootstrap";
import { ChevronRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const VideoDownloadMenu = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4">
            <h4 className="mb-3">{t("settingPage.videoDownloadSettings.videoDownloadHeading")}</h4>
            <Card className="mt-3">
                <Card.Body>
                    <Row>
                        <Col xs="auto" className="d-flex align-items-center">
                            <Button
                                variant="link"
                                className="text-start fw-semibold p-0 link-underline link-underline-opacity-0 stretched-link text-reset"
                                onClick={onClick}>
                                {t("settingPage.videoDownloadSettings.videoDownloadOption")}
                            </Button>
                        </Col>
                        <Col xs="auto" className="d-flex ms-auto align-items-center justify-content-center">
                            <ChevronRight />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default VideoDownloadMenu;
