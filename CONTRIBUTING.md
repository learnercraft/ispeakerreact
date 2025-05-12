# Contributing to iSpeakerReact

Thank you for your interest in contributing! Please take a moment to review this guide before submitting issues, feature requests, translation contributions, or pull requests.

> 📝 **Note:** This guide is not exhaustive. Project practices may evolve, and new situations may arise. When in doubt, feel free to ask questions or open an issue for clarification.

## 📬 Submitting issues, feature requests, or translations

- To report bugs or request features, please [open an issue](https://github.com/yllst-testing-labs/ispeakerreact/issues/new/choose) and choose the appropriate category.

- For translation contributions, please [refer to this issue](https://github.com/yllst-testing-labs/ispeakerreact/issues/18) for more information.

## 🔀 Submitting pull requests

### 📌 Project note

- This project **does not use TypeScript** or any kind of static type checking yet.
  - In the meantime, **use** `PropTypes` to validate component props for basic type safety.

### ✅ What you should do

- **Use a code editor** (e.g., Visual Studio Code) to write and format code efficiently.

- **Format your code** before committing and pushing. You must use **Prettier with our configuration** to ensure consistent formatting.

- **Test your code thoroughly** before pushing. Resolve any ESLint errors if possible.
  - An exception is allowed for variables defined in `vite.config.js` and available only at build time. If ESLint complains about these (e.g., the `__APP_VERSION__` variable), you can safely ignore the warning.

- **Use clear, concise variable names** written in `camelCase`. Names should be self-explanatory and reflect their purpose.

- **Use a clear, concise pull request title**. We recommend following [semantic commit message conventions](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716). Examples:
  - `fix: handle audio timeout error on older devices`
  - `feat: add pitch detection to feedback view`

  If the title doesn’t fully describe your changes, please provide a detailed description in the PR body.

- Use **multiple small commits** with clear messages when possible. This improves readability and makes it easier to review specific changes.

- Before submitting a **large pull request** or major change, open an issue first and select the appropriate category. After a review by our team, you can start your work.

### 🧪 Review process

- All PRs are reviewed before merging. Please be responsive to feedback.  
  When resolving comments, **make a new commit with**:  
  `address feedback by @<username>`

### 🤔 What you should NOT do

- Submit pull requests that only include **cosmetic changes** like whitespace tweaks or code reformatting without any functional impact.  
  These changes clutter diffs and make code reviews harder. [See this comment by the Rails team](https://github.com/rails/rails/pull/13771#issuecomment-32746700).

- Submit a pull request with **one or several giant commit(s)**. This makes it difficult to review.

- Use unclear, vague, or default commit messages like `Update file`, `fix`, or `misc changes`.

- Modify configuration files (e.g., `.prettierrc`, `eslint.config.js`, etc.), or any files in the `.github` folder without prior discussion.

### 🚫 Prohibited actions

- Add code or commits that:
  - Are **obscure** or **unclear** in intent  
  - Are **malicious** or **unsafe**  
  - **Executes scripts from external sources**  
  - Attempts to introduce **backdoors** or hidden functionality

  If we find any code that violates these rules, you will be blocked from further contributions and reported to GitHub for Terms of Use violations.

- Use expletives or offensive language. This project is intended for everyone, and we strive to maintain a respectful environment for all contributors and users.

---

Thank you again for helping us improve the project!
