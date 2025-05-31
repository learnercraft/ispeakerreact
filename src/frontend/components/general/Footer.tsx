import openExternal from "../../utils/openExternal.js";
import LogoLightOrDark from "./LogoLightOrDark.js";

const Footer = () => {
    return (
        <footer
            lang="en"
            className="footer sm:footer-horizontal bg-base-200 text-base-content p-6 pb-20 md:p-10"
        >
            <aside>
                <LogoLightOrDark width={100} height={100} />
                <p>
                    Created by{" "}
                    <button
                        type="button"
                        className="link after:content-['_↗']"
                        onClick={() => openExternal("https://yell0wsuit.page")}
                    >
                        yell0wsuit
                    </button>
                    <br />
                    Maintained by the community and contributors.{" "}
                    <button
                        type="button"
                        className="link after:content-['_↗']"
                        onClick={() =>
                            openExternal(
                                "https://github.com/learnercraft/ispeakerreact/graphs/contributors"
                            )
                        }
                    >
                        See contributors
                    </button>
                </p>
                <p>
                    Licensed under the Apache License, Version 2.0
                    <br />
                    Video and audio materials © Oxford University Press
                </p>
            </aside>
            <nav>
                <h6 className="footer-title">More English learning materials</h6>
                <button
                    type="button"
                    className="link after:content-['_↗']"
                    onClick={() => openExternal("https://yell0wsuit.github.io/docugrammar/")}
                >
                    DocuGrammar
                </button>
                <p className="text-xs text-stone-700 dark:text-stone-400">
                    A collection of grammar references in web format, powered by Docusaurus.
                </p>
            </nav>
        </footer>
    );
};

export default Footer;
