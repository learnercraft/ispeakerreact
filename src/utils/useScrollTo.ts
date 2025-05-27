import { useRef } from "react";

const useScrollTo = () => {
    const ref = useRef(null);
    const padding = 300; // extra padding

    const scrollTo = (options = { behavior: "smooth" }) => {
        if (ref.current) {
            const element = ref.current;
            const top =
                (element as HTMLElement).getBoundingClientRect().top + window.scrollY - padding;

            window.scrollTo({ top, behavior: options.behavior as ScrollBehavior });
        }
    };

    return { ref, scrollTo };
};

export default useScrollTo;
