import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import he from "he";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

const SortableWord = ({ word, item, isCorrect, disabled, isOverlay }) => {
    const [itemWidth, setItemWidth] = useState(null);
    const ref = React.useRef(null);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: word?.id || item?.id, // Handle both word and item cases
    });

    useEffect(() => {
        if (ref.current) {
            setItemWidth(ref.current.offsetWidth);
        }
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
        cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserDrag: "none",
        WebkitTouchCallout: "none",
        width: isDragging ? itemWidth + 1 : "inherit",
        opacity: isDragging ? 0.5 : 1,
    };

    const variant = isOverlay
        ? "secondary"
        : isCorrect === null
        ? "outline-secondary"
        : isCorrect
        ? "success"
        : "danger";

    const trueFalse = isOverlay ? (
        ""
    ) : isCorrect === null ? (
        ""
    ) : isCorrect ? (
        <CheckCircleFill className="ms-2" />
    ) : (
        <XCircleFill className="ms-2" />
    );

    return (
        <Button
            ref={(node) => {
                setNodeRef(node);
                ref.current = node;
            }}
            style={style}
            {...attributes}
            {...listeners}
            variant={variant}
            className={`${item ? "w-100 " : ""}mb-2 text-center fw-bold ${
                isDragging && !disabled ? " opacity-50" : ""
            } ${disabled ? "pe-none" : ""} ${isOverlay ? "z-2 shadow-sm" : ""}`}>
            {he.decode(word?.text || item?.value)}
            {trueFalse}
        </Button>
    );
};

export default SortableWord;
