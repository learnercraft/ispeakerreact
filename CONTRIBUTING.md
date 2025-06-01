# Contributing to iSpeakerReact

Thank you for your interest in contributing! Please take a moment to review this guide before submitting issues, feature requests, translation contributions, or pull requests.

> 📝 **Note:** This guide is not exhaustive. Project practices may evolve, and new situations may arise. When in doubt, feel free to ask questions or open an issue for clarification.

## 📬 Submitting issues, feature requests, or translations

- To report bugs or request features, [open an issue](https://github.com/learnercraft/ispeakerreact/issues/new/choose) and choose the appropriate category.

- For translation contributions, [refer to this issue](https://github.com/learnercraft/ispeakerreact/issues/18) for more information.

## ▶️ Run the code locally

To run the code locally, you need the latest **LTS (Long Term Support)** version of [Node.js](https://nodejs.org/en/) installed.

Then, clone the repository using either [Git](https://git-scm.com/downloads) (if you are familiar with the command line) or [GitHub Desktop](https://desktop.github.com/).

Install dependencies with `npm install`, then start the development server using one of the following commands:

- Web: `npm run dev`  
- Electron: `npm run start`

To test the production build:

- Web: `npm run build`, then `npm run preview`
- Electron: `npm run make` — the executable will appear in the `./out` folder

## 🔀 Submitting pull requests

As of [pull request #65](https://github.com/learnercraft/ispeakerreact/pull/65), this project uses TypeScript for improved type safety and developer experience.

### ✅ What you should do

- **Use a code editor** (e.g., Visual Studio Code) to write and format code efficiently.

- **Format your code** before committing using Prettier with the project's configuration.

- **Test your code thoroughly** before pushing. Resolve any TypeScript and ESLint errors if possible.

- **Use a clear, concise pull request title**. We recommend following [semantic commit message conventions](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716). Examples:
  - `fix: handle audio timeout error on older devices`
  - `feat: add pitch detection to feedback view`

  If the title doesn’t fully describe your changes, please provide a detailed description in the PR body.

- Use **multiple small commits** with clear messages when possible. This improves readability and makes it easier to review specific changes.

- Before submitting a **large pull request** or major change, open an issue first and select the appropriate category. After a review by our team, you can start your work.

### 💻 Coding style

- Follow the latest ECMAScript standards. This project is built with modern JavaScript in mind, so polyfills are typically unnecessary.
  - Be mindful of browser compatibility. Check [Can I use...](https://caniuse.com/) before using experimental APIs.

- Do not use deprecated APIs. Refer to [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API) for up-to-date information.

- **Use clear, concise variable names** written in `camelCase`. For React components, use `PascalCase`. Names should be self-explanatory and reflect their purpose.

- Prefer **arrow functions** over `function` declarations to avoid hoisting issues and for consistency.

- Use `async` and `await` instead of `.then()` where possible for readability.

- In React components, wrap expensive computations in `useMemo` and functions in `useCallback` hooks when appropriate.

### 🧪 Review process

- All PRs are reviewed before merging. Please be responsive to feedback.  
  When addressing review comments, commit with a message like:  
  `address feedback by @<username>`

### 🤔 What you should NOT do

- Submit pull requests that only include **cosmetic changes** like whitespace tweaks or code reformatting without any functional impact.  
  These changes clutter diffs and make code reviews harder. [See this comment by the Rails team](https://github.com/rails/rails/pull/13771#issuecomment-32746700).

- Submit pull requests that consist of a single large commit or several oversized commits. Break your changes into logical, reviewable commits.

- Use vague or default commit messages like `update file`, `fix`, or `misc changes`.

- Modify configuration files (e.g., `.prettierrc`, `eslint.config.js`, etc.), or any files in the `.github` folder without prior discussion.

### 🚫 Prohibited actions

- Add code or commits that:
  - Are **obscure** or **unclear** in intent  
  - Are **malicious** or **unsafe**  
  - **Executes scripts from external sources** associated with **malicious, unsafe, or illegal behavior**  
  - Attempts to introduce **backdoors** or hidden functionality

  Violations will result in being blocked from contributing. In severe cases, you may also be reported to GitHub for Terms of Use violations.

- Commit **hardcoded secrets, tokens, or sensitive user information**.  
  While our project includes a secret-scanning tool, it is still your responsibility to ensure that no sensitive data is committed to the repository.

- Use **expletives** or **offensive language**. This project is intended for everyone, and we strive to maintain a respectful environment for all contributors and users. Any inappropriate comments will be removed and treated as a final warning.

---

Thank you again for helping us improve the project!
