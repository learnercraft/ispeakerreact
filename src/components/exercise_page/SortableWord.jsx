import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "react-bootstrap";
import he from "he";

const SortableWord = ({ word, isCorrect, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: word.text });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: disabled ? "not-allowed" : "move",
    };

    return (
        <Button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            variant={isCorrect === null ? "light" : isCorrect ? "success" : "danger"}
            className="mb-3 w-100"
            disabled={disabled}>
            {he.decode(word.text)}
        </Button>
    );
};

export default SortableWord;
