import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import he from "he";
import React, { useEffect, useState } from "react";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";

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
        cursor: disabled ? "not-allowed" : isOverlay ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserDrag: "none",
        WebkitTouchCallout: "none",
        width: isDragging ? itemWidth + 1 : "inherit",
        opacity: isDragging ? 0.5 : 1,
    };

    const btnVariant = isOverlay
        ? ""
        : isCorrect === null
          ? "btn-outline"
          : isCorrect
            ? "btn-success"
            : "btn-error";

    const renderTrueFalseIcon = () => {
        if (isOverlay || isCorrect === null) return null;
        return isCorrect ? (
            <BsCheckCircleFill className="ms-1 inline-block h-6 w-6" />
        ) : (
            <BsXCircleFill className="ms-1 inline-block h-6 w-6" />
        );
    };

    return !disabled ? (
        <button
            type="button"
            ref={(node) => {
                setNodeRef(node);
                ref.current = node;
            }}
            style={style}
            {...attributes}
            {...listeners}
            className={`btn btn-lg no-animation break-all transition-none ${btnVariant} text-lg ${item ? "min-w-full" : ""} ${
                isDragging && !disabled ? "opacity-50" : ""
            } ${disabled ? "pointer-events-none" : ""} ${isOverlay ? "z-2 shadow-lg" : ""}`}
        >
            <span lang="en">{he.decode(word?.text || item?.value)}</span>
            {renderTrueFalseIcon()}
        </button>
    ) : (
        <button
            type="button"
            className={`btn btn-lg no-animation w-full justify-center text-lg break-all transition-none ${
                item ? "" : "lg:w-4/5 xl:w-3/4"
            } pointer-events-none ${isCorrect ? "btn-success" : "btn-error"}`}
        >
            <p className="text-center font-bold" lang="en">
                {he.decode(word?.text || item?.value)} {renderTrueFalseIcon()}
            </p>
        </button>
    );
};

export default SortableWord;
