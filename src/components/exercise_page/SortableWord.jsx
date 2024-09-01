import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import he from "he";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

const SortableWord = ({ word, isCorrect, disabled, isOverlay }) => {
    const [itemWidth, setItemWidth] = useState(null);
    // Ref for capturing the DOM element
    const ref = React.useRef(null);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: word.id,
    });

    useEffect(() => {
        // Measure the width after the component mounts
        if (ref.current) {
            setItemWidth(ref.current.offsetWidth);
        }
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none", // Prevents default touch behavior
        cursor: disabled ? "not-allowed" : "move",
        userSelect: "none", // Prevent text selection
        WebkitUserDrag: "none", // Prevent dragging the element as a browser action (Safari)
        WebkitTouchCallout: "none", // Prevent showing callout on touching and dragging
        width: isOverlay ? itemWidth : "", // Set the width to match with that of the current item
    };

    const variant = isOverlay ? "secondary" : isCorrect === null ? "secondary" : isCorrect ? "success" : "danger";

    return (
        <Button
            ref={(node) => {
                setNodeRef(node); // Pass the node to DnD kit
                ref.current = node; // Capture the reference in our own ref
            }}
            style={style}
            {...attributes}
            {...listeners}
            variant={variant}
            className={`mb-2 fw-bold ${isDragging && !disabled ? "opacity-50" : ""} ${
                isOverlay ? "z-2 shadow-sm" : ""
            }`}
            disabled={disabled}>
            {he.decode(word.text)}
        </Button>
    );
};

export default SortableWord;
