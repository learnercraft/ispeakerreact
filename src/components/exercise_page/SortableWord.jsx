import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "react-bootstrap";
import he from "he";

const SortableWord = ({ word, isCorrect, disabled, isOverlay }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: word.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none", // Prevents default touch behavior
        cursor: disabled ? "not-allowed" : "move",
        userSelect: "none", // Prevent text selection
        WebkitUserDrag: "none", // Prevent dragging the element as a browser action (Safari)
        WebkitTouchCallout: "none", // Prevent showing callout on touching and dragging
        ...(isDragging && !disabled && { opacity: 0.5 }), // Make the item semi-transparent while dragging
        zIndex: isDragging ? 1000 : "auto", // Bring the dragging item to the front
        boxShadow: isDragging ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
        ...(!isOverlay && {
            marginBottom: "1rem",
        }),
    };

    const variant = isOverlay ? "light" : isCorrect === null ? "light" : isCorrect ? "success" : "danger";

    return (
        <Button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            variant={variant}
            className="mb-2 fw-bold"
            disabled={disabled}>
            {he.decode(word.text)}
        </Button>
    );
};

export default SortableWord;
