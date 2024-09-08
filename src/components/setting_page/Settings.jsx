import { Col, Row } from "react-bootstrap";
import TopNavBar from "../general/TopNavBar";
import ExerciseTimer from "./ExerciseTimer";
import AppearanceSettings from "./Appearance";
import CachingSettings from "./Caching";

const SettingsPage = () => {
    return (
        <>
            <TopNavBar />
            <div className="p-1 p-md-3">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <h1 className="fw-semibold">SpeakerReact settings</h1>
                        <div className="mt-4">
                            <ExerciseTimer />
                            <hr className="my-4" />
                            <AppearanceSettings />
                            <hr className="my-4" />
                            <CachingSettings />
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default SettingsPage;
