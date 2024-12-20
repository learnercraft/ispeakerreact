import LogoLightOrDark from "./LogoLightOrDark";

const Footer = () => {
    return (
        <footer className="footer bg-base-200 p-6 pb-20 text-base-content md:p-10">
            <aside>
                <LogoLightOrDark width="100" height="100" />
                <p>
                    Created by{" "}
                    <a
                        className="link after:content-['_↗']"
                        href="https://yell0wsuit.page"
                        target="_blank"
                    >
                        yell0wsuit
                    </a>
                    <br />
                    Maintained by the community and contributors.{" "}
                    <a
                        className="link after:content-['_↗']"
                        href="https://github.com/yllst-testing-labs/ispeakerreact/graphs/contributors"
                        target="_blank"
                    >
                        See contributors
                    </a>
                </p>
                <p>
                    Licensed under the Apache License, Version 2.0
                    <br />
                    Video and audio materials © Oxford University Press
                </p>
            </aside>
            <nav>
                <h6 className="footer-title">More English learning materials</h6>
                <a
                    className="link-hover link after:content-['_↗']"
                    href="https://yell0wsuit.github.io/docugrammar/"
                    target="_blank"
                >
                    DocuGrammar
                </a>
                <p className="text-xs text-stone-700 dark:text-stone-400">
                    A collection of grammar references in web format, powered by Docusaurus.
                </p>
            </nav>
        </footer>
    );
};

export default Footer;
