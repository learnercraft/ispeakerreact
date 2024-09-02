import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import ConversationDetailPage from "./ConversationDetailPage";

const ConversationListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [selectedConversation, setSelectedConversation] = useState(null);

    const TooltipIcon = ({ info }) => (
        <OverlayTrigger overlay={<Tooltip>{info}</Tooltip>} trigger={["hover", "focus"]}>
            <InfoCircle className="ms-1" />
        </OverlayTrigger>
    );

    const handleSelectConversation = (id, title) => {
        const selected = data.find((section) => section.titles.some((title) => title.id === id));
        if (selected) {
            setSelectedConversation({
                id,
                title,
                heading: selected.heading,
            });
        }
    };

    const ConversationCard = ({ heading, titles }) => (
        <Col>
            <Card className="mb-4 h-100 shadow-sm">
                <Card.Header className="fw-semibold">{heading}</Card.Header>
                <Card.Body>
                    {titles.map(({ title, info, id }, index) => (
                        <Card.Text key={index} className="">
                            <Button
                                variant="link"
                                className="p-0 m-0"
                                onClick={() => handleSelectConversation(id, title)}>
                                {title}
                            </Button>
                            <TooltipIcon info={info} />
                        </Card.Text>
                    ))}
                </Card.Body>
            </Card>
        </Col>
    );

    useEffect(() => {
        NProgress.start();
        fetch("/json/conversation_list.json")
            .then((response) => response.json())
            .then((data) => {
                setData(data.conversationList);
                setLoading(false);
                NProgress.done();
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                NProgress.done();
            });
    }, []);

    useEffect(() => {
        // Load existing data from localStorage
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};

        // Update the selectedAccent while preserving other data
        const updatedData = {
            ...storedData,
            selectedAccent,
        };

        // Save the updated data back to localStorage
        localStorage.setItem("ispeaker", JSON.stringify(updatedData));
    }, [selectedAccent]);

    const handleGoBack = () => {
        setSelectedConversation(null);
    };

    useEffect(() => {
        document.title = "Conversations | Oxford iSpeaker";
    }, []);

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Conversations</h1>
            {selectedConversation ? (
                <ConversationDetailPage
                    id={selectedConversation.id}
                    accent={selectedAccent}
                    title={selectedConversation.title}
                    onBack={handleGoBack}
                />
            ) : (
                <>
                    <AccentDropdown onAccentChange={setSelectedAccent} />
                    <p>Select a conversation type to get started.</p>
                    {loading ? (
                        <LoadingOverlay />
                    ) : (
                        <Row xs={1} md={3} className="g-4 mt-1 d-flex justify-content-center">
                            {data.map((section, index) => (
                                <ConversationCard key={index} heading={section.heading} titles={section.titles} />
                            ))}
                        </Row>
                    )}
                </>
            )}
        </>
    );
};

export default ConversationListPage;
