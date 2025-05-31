import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ children, className = "", ...props }: ContainerProps) => {
    return (
        <main className={`container mx-auto p-4 mb-5 ${className}`} {...props}>
            {children}
        </main>
    );
};

export default Container;
