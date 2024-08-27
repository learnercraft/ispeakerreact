import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { Card, Col, OverlayTrigger, Row, Tooltip, Dropdown, Button } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import TopNavBar from "../general/TopNavBar";
import ConversationDetailPage from "./ConversationDetailPage";
import LoadingOverlay from "../general/LoadingOverlay";

const ConversationListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedAccent, setSelectedAccent] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings?.selectedAccent || "american";
    });
    const [selectedConversation, setSelectedConversation] = useState(null);

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

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
                    <Dropdown className="my-4">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <span className="fw-semibold">Accent:</span>{" "}
                            {selectedAccentOptions.find((item) => item.value === selectedAccent).name}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {selectedAccentOptions.map((item) => (
                                <Dropdown.Item
                                    key={item.value}
                                    onClick={() => setSelectedAccent(item.value)}
                                    active={selectedAccent === item.value}>
                                    {item.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
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
