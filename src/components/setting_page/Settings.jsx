import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useIsElectron } from "../../utils/isElectron";
import TopNavBar from "../general/TopNavBar";
import AppearanceSettings from "./Appearance";
import AppInfo from "./AppInfo";
import CachingSettings from "./Caching";
import ExerciseTimer from "./ExerciseTimer";
import ResetSettings from "./ResetSettings";

const SettingsPage = () => {
    const isElectron = useIsElectron();

    useEffect(() => {
        document.title = `Settings | iSpeakerReact ${__APP_VERSION__}`;
    }, []);

    const [resetFlag, setResetFlag] = useState(false); // Boolean flag to force remount
    const handleReset = () => {
        // Change the key to remount the CachingSettings component
        setResetFlag((prevFlag) => !prevFlag);
    };

    return (
        <>
            <TopNavBar />
            <div className="p-1 p-md-3">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <h1 className="fw-semibold">iSpeakerReact settings</h1>
                        <div className="mt-4">
                            {isElectron && (
                                <>
                                    <hr className="my-4" />
                                    <AppInfo />
                                </>
                            )}
                            <ExerciseTimer />
                            <hr className="my-4" />
                            <AppearanceSettings />
                            {!isElectron && (
                                <>
                                    <hr className="my-4" />
                                    <CachingSettings key={resetFlag} />
                                </>
                            )}
                            <hr className="my-4" />
                            <ResetSettings onReset={handleReset} />
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default SettingsPage;
