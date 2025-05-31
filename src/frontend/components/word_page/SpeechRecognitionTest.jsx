import { useState } from "react";

const SpeechRecognitionTest = () => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    // const [confidence, setConfidence] = useState(null);
    // const [feedback, setFeedback] = useState("");

    const startSpeechRecognition = () => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setError("Your browser does not support the Web Speech API.");
            return;
        }

        // Use either webkitSpeechRecognition or SpeechRecognition
        const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new Recognition();

        recognition.lang = "en"; // Set the language
        recognition.interimResults = false; // Only capture final results
        recognition.maxAlternatives = 1; // Limit to one transcription

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log("Speech recognition started");
        };

        recognition.onerror = (e) => {
            setError(`Error: ${e.error}`);
            console.error("Speech recognition error:", e);
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log("Speech recognition stopped");
        };

        recognition.onresult = (e) => {
            const recognizedText = e.results[0][0].transcript;
            const confidenceScore = e.results[0][0].confidence;
            console.log(confidenceScore);

            setTranscript(recognizedText);
            // setConfidence(confidenceScore);

            // Confidence score is only available on Google Chorme and Safari.
            // Microsoft Edge always returns `0`, and Firefox returns `1`, therefore, its relevant code
            // is commented out until major browsers implement this feature properly.

            // Provide feedback based on confidence
            /* if (confidenceScore >= 0.9) {
                setFeedback("Excellent! Your pronunciation is spot on.");
            } else if (confidenceScore >= 0.7) {
                setFeedback(
                    "Good job! Your pronunciation is clear but could use slight improvement."
                );
            } else {
                setFeedback("Keep practicing! Your pronunciation was unclear.");
            } */
        };

        recognition.start();
    };

    return (
        <div className="my-4 text-center">
            <p className="mb-4">Web Speech API Test</p>
            <button
                type="button"
                onClick={startSpeechRecognition}
                disabled={isListening}
                className="btn btn-info"
            >
                {isListening ? "Listening..." : "Start Speech Recognition"}
            </button>
            {error && (
                <p className="text-error my-4">
                    <strong>{error}</strong>
                </p>
            )}
            <div className="my-4">
                <strong>Recognized text:</strong>
                <p>{transcript || "No speech recognized yet."}</p>
            </div>
        </div>
    );
};

export default SpeechRecognitionTest;
