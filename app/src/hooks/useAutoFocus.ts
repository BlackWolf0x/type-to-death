import { useEffect, useRef } from "react";

export function useAutoFocus<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        // Focus element on mount
        ref.current?.focus();

        // Refocus element whenever it loses focus
        const handleBlur = () => {
            setTimeout(() => {
                ref.current?.focus();
            }, 0);
        };

        // Refocus on any click outside
        const handleClick = () => {
            ref.current?.focus();
        };

        const element = ref.current;
        element?.addEventListener("blur", handleBlur);
        document.addEventListener("click", handleClick);

        return () => {
            element?.removeEventListener("blur", handleBlur);
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return ref;
}
