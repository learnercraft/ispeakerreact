import requests
import os

# Get info from the environment
repo = os.environ.get("GITHUB_REPOSITORY", "yllst-testing-labs/ispeakerreact")
release_id = os.environ.get("RELEASE_ID")

# Define the GitHub API URL and headers
url = f"https://api.github.com/repos/{repo}/releases/{release_id}"
token = os.environ.get("GITHUB_TOKEN")
headers = {
    "User-Agent": "yllst-testing-labs-release-updater-action",
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github.v3+json",
}

# Fetch the release data
response = requests.get(url, headers=headers)
release_data = response.json()

# Extract necessary details
tag = release_data["tag_name"]
name = release_data["name"]
assets = release_data["assets"]
changelog_url = f"https://github.com/{repo}/compare/{tag.split('-')[0]}...{tag}"

# Organize assets by platform
windows_downloads = []
macos_downloads = []
linux_downloads = []

# First, collect all Windows downloads
for asset in assets:
    asset_name = asset["name"]
    download_url = asset["browser_download_url"]
    if "win32" in asset_name:
        is_portable = "Setup.exe" not in asset_name
        is_arm64 = "arm64" in asset_name

        # Create tuple for sorting: (is_portable, is_arm64, label, url)
        if is_portable:
            label = "Portable version"
            if is_arm64:
                label += " for Windows ARM"
            windows_downloads.append((True, is_arm64, label, download_url))
        else:
            label = "Installer version"
            if is_arm64:
                label += " for Windows ARM"
            windows_downloads.append((False, is_arm64, label, download_url))
    elif asset_name.endswith(".dmg"):
        if "arm64" in asset_name:
            label = "For Mac with Apple Silicon chip"
        else:
            label = "For Mac with Intel chip"
        macos_downloads.append(f"- [{label}]({download_url})")
    elif (
        asset_name.endswith(".zip")
        or asset_name.endswith(".deb")
        or asset_name.endswith(".rpm")
    ):
        linux_downloads.append(f"- [{asset_name}]({download_url})")

# Sort Windows downloads: portable first, then x64 before arm64
windows_downloads.sort(key=lambda x: (not x[0], x[1]))
windows_formatted = [f"- [{item[2]}]({item[3]})" for item in windows_downloads]

# Build markdown
markdown = f"""## Download

### Windows
{"\n".join(windows_formatted)}

This app requires Windows 10 or later.

### macOS
{"\n".join(macos_downloads)}

### Linux
{"\n".join(linux_downloads)}

There is no AppImage version for this app yet.

## App updates

/* Please add some here manually */

**Full Changelog**: {changelog_url}
"""

print(markdown.strip())
