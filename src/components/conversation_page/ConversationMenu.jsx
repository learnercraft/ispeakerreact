import { Suspense, lazy, useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { isElectron } from "../../utils/isElectron";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import { getFileFromIndexedDB, saveFileToIndexedDB } from "../setting_page/offlineStorageDb";

const ConversationDetailPage = lazy(() => import("./ConversationDetailPage"));

const ConversationListPage = () => {
    const { t } = useTranslation();
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
        const selected = data.find((section) => section.titles.some((item) => item.id === id));
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
                <Card.Header className="fw-semibold">{t(heading)}</Card.Header>
                <Card.Body>
                    {titles.map(({ title, info, id }, index) => (
                        <Card.Text key={index} className="">
                            <Button
                                variant="link"
                                className="p-0 m-0"
                                onClick={() => handleSelectConversation(id, title)}>
                                {t(title)}
                            </Button>
                            <TooltipIcon info={t(info)} />
                        </Card.Text>
                    ))}
                </Card.Body>
            </Card>
        </Col>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If it's not an Electron environment, check IndexedDB first
                if (!isElectron()) {
                    const cachedDataBlob = await getFileFromIndexedDB("conversation_list.json", "json");

                    if (cachedDataBlob) {
                        // Convert Blob to text, then parse the JSON
                        const cachedDataText = await cachedDataBlob.text();
                        const cachedData = JSON.parse(cachedDataText);

                        // Use localization keys
                        const localizedData = cachedData.conversationList.map((section) => ({
                            ...section,
                            heading: `${section.heading}`,
                            titles: section.titles.map((title) => ({
                                ...title,
                                title: `${title.title}`, // Adjust key for titles
                                info: `${title.info}`, // Adjust key for info
                            })),
                        }));

                        setData(localizedData);
                        setLoading(false);

                        return;
                    }
                }

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/conversation_list.json`);
                const fetchedData = await response.json();

                // Use localization keys
                const localizedData = fetchedData.conversationList.map((section) => ({
                    ...section,
                    heading: `${section.heading}`,
                    titles: section.titles.map((title) => ({
                        ...title,
                        title: `${title.title}`, // Adjust key for titles
                        info: `${title.info}`, // Adjust key for info
                    })),
                }));

                setData(localizedData);
                setLoading(false);

                // Save the fetched data to IndexedDB (excluding Electron)
                if (!isElectron()) {
                    const blob = new Blob([JSON.stringify(fetchedData)], { type: "application/json" });
                    await saveFileToIndexedDB("conversation_list.json", blob, "json");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
            }
        };
        fetchData();
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
        document.title = `${t("navigation.conversations")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">{t("navigation.conversations")}</h1>
            {selectedConversation ? (
                <Suspense fallback={<LoadingOverlay />}>
                    <ConversationDetailPage
                        id={selectedConversation.id}
                        accent={selectedAccent}
                        title={selectedConversation.title}
                        onBack={handleGoBack}
                    />
                </Suspense>
            ) : (
                <>
                    <AccentDropdown onAccentChange={setSelectedAccent} />
                    <p>{t("conversationPage.selectType")}</p>
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
