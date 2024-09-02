import { Card, Col, Row } from "react-bootstrap";
import he from "he";
import { RecordCircleFill, PlayCircleFill } from "react-bootstrap-icons";

const SoundCardItem = ({
    id,
    imgPhonemeThumbSrc,
    handleShow,
    textContent,
    activeRecordingCard,
    isRecordingPlaying,
    activePlaybackCard,
    isRecordingPlayingActive,
    isRecordingAvailable,
    handleRecording,
    handlePlayRecording,
}) => (
    <Card className="mb-2">
        <Card.Body>
            <Row>
                <Col xs={"auto"} className="d-flex align-items-center">
                    <button type="button" className="btn focus-ring p-1" onClick={() => handleShow(id)}>
                        <img src={imgPhonemeThumbSrc} alt="Phoneme Thumbnail" />
                    </button>
                </Col>
                <Col xs={"auto"} className="d-flex align-items-center">
                    <span dangerouslySetInnerHTML={{ __html: he.decode(textContent) }}></span>
                </Col>
                <Col xs={"auto"} className="d-flex align-items-center">
                    <RecordCircleFill
                        aria-label="record icon"
                        size={24}
                        role="button"
                        className={`bi me-2${
                            activeRecordingCard === id
                                ? " text-danger"
                                : activeRecordingCard !== null || isRecordingPlaying
                                ? " pe-none opacity-25"
                                : ""
                        }`}
                        onClick={() => handleRecording(id)}
                    />
                    <PlayCircleFill
                        aria-label="play recording icon"
                        size={24}
                        role="button"
                        className={`bi me-2${
                            isRecordingPlaying && activePlaybackCard !== id
                                ? " pe-none opacity-25"
                                : isRecordingPlayingActive(id)
                                ? " text-success"
                                : !isRecordingAvailable(id) || activeRecordingCard !== null
                                ? " pe-none opacity-25"
                                : ""
                        }`}
                        onClick={() => (isRecordingAvailable(id) ? handlePlayRecording(id) : null)}
                        disabled={isRecordingPlaying && activePlaybackCard !== id}
                    />
                </Col>
            </Row>
        </Card.Body>
    </Card>
);

const SoundPracticeCard = ({
    sound,
    handleShow,
    imgPhonemeThumbSrc,
    activeRecordingCard,
    isRecordingPlaying,
    activePlaybackCard,
    accentData,
    isRecordingPlayingActive,
    isRecordingAvailable,
    handleRecording,
    handlePlayRecording,
}) => {
    return (
        <>
            {sound.shouldShow !== false && (
                <SoundCardItem
                    id={1}
                    imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                    handleShow={handleShow}
                    textContent={sound.phoneme}
                    activeRecordingCard={activeRecordingCard}
                    isRecordingPlaying={isRecordingPlaying}
                    activePlaybackCard={activePlaybackCard}
                    isRecordingPlayingActive={isRecordingPlayingActive}
                    isRecordingAvailable={isRecordingAvailable}
                    handleRecording={handleRecording}
                    handlePlayRecording={handlePlayRecording}
                />
            )}
            {accentData.initial && (
                <SoundCardItem
                    id={2}
                    imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                    handleShow={handleShow}
                    textContent={accentData.initial}
                    activeRecordingCard={activeRecordingCard}
                    isRecordingPlaying={isRecordingPlaying}
                    activePlaybackCard={activePlaybackCard}
                    isRecordingPlayingActive={isRecordingPlayingActive}
                    isRecordingAvailable={isRecordingAvailable}
                    handleRecording={handleRecording}
                    handlePlayRecording={handlePlayRecording}
                />
            )}
            {accentData.medial && (
                <SoundCardItem
                    id={3}
                    imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                    handleShow={handleShow}
                    textContent={accentData.medial}
                    activeRecordingCard={activeRecordingCard}
                    isRecordingPlaying={isRecordingPlaying}
                    activePlaybackCard={activePlaybackCard}
                    isRecordingPlayingActive={isRecordingPlayingActive}
                    isRecordingAvailable={isRecordingAvailable}
                    handleRecording={handleRecording}
                    handlePlayRecording={handlePlayRecording}
                />
            )}
            {accentData.final && (
                <SoundCardItem
                    id={4}
                    imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                    handleShow={handleShow}
                    textContent={accentData.final}
                    activeRecordingCard={activeRecordingCard}
                    isRecordingPlaying={isRecordingPlaying}
                    activePlaybackCard={activePlaybackCard}
                    isRecordingPlayingActive={isRecordingPlayingActive}
                    isRecordingAvailable={isRecordingAvailable}
                    handleRecording={handleRecording}
                    handlePlayRecording={handlePlayRecording}
                />
            )}
        </>
    );
};

export default SoundPracticeCard;
