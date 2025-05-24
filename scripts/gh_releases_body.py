import requests
import os
import json
import sys

# Get environment variables with fallbacks
repo = "learnercraft/ispeakerreact"
# release_id = os.environ.get("RELEASE_ID")

# Define the GitHub API URL and headers
# if release_id:
# url = f"https://api.github.com/repos/{repo}/releases/{release_id}"
# else:
# Fallback to latest release if no specific release ID is provided
url = f"https://api.github.com/repos/{repo}/releases/latest"

token = os.environ.get("GITHUB_TOKEN")
headers = {
    "User-Agent": "release-updater-action",
    "Accept": "application/vnd.github.v3+json",
}

# Add authorization header if token is available
if token:
    headers["Authorization"] = f"token {token}"

# Fetch the release data
try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise exception for 4XX/5XX responses
    release_data = response.json()

    # Debug: Print the keys in the response
    #print(f"DEBUG: Response keys: {list(release_data.keys())}", file=sys.stderr)

except requests.exceptions.RequestException as e:
    print(f"ERROR: Failed to fetch release data: {e}", file=sys.stderr)
    print(f"Response status code: {response.status_code}", file=sys.stderr)
    print(f"Response content: {response.text}", file=sys.stderr)
    sys.exit(1)

# Extract necessary details
try:
    tag = release_data.get("tag_name")
    if not tag:
        print(f"ERROR: No tag_name in response data", file=sys.stderr)
        sys.exit(1)

    name = release_data.get("name", tag)
    assets = release_data.get("assets", [])

    if not assets:
        print("WARNING: No assets found in the release", file=sys.stderr)

    # For the changelog URL, handle possible tag format variations
    base_tag = tag.split("-")[0] if "-" in tag else tag
    changelog_url = f"https://github.com/{repo}/compare/{base_tag}...{tag}"

except KeyError as e:
    print(f"ERROR: Missing required field in response data: {e}", file=sys.stderr)
    print(f"Full response: {json.dumps(release_data, indent=2)}", file=sys.stderr)
    sys.exit(1)

# Organize assets by platform
windows_downloads = []
macos_downloads = []
linux_downloads = []

for asset in assets:
    asset_name = asset["name"]
    download_url = asset["browser_download_url"]
    # Windows
    if asset_name.startswith("iSpeakerReact-win32-x64") and asset_name.endswith(".zip"):
        windows_downloads.append(f"- [Windows x64 ZIP]({download_url})")
    elif asset_name.startswith("iSpeakerReact-win32-arm64") and asset_name.endswith(".zip"):
        windows_downloads.append(f"- [Windows ARM64 ZIP]({download_url})")
    # macOS
    elif asset_name.startswith("iSpeakerReact-darwin-x64") and asset_name.endswith(".zip"):
        macos_downloads.append(f"- [macOS Intel (x64) ZIP]({download_url})")
    elif asset_name.startswith("iSpeakerReact-darwin-arm64") and asset_name.endswith(".zip"):
        macos_downloads.append(f"- [macOS Apple Silicon (arm64) ZIP]({download_url})")
    # Linux
    elif asset_name.startswith("iSpeakerReact-linux-x64") and asset_name.endswith(".zip"):
        linux_downloads.append(f"- [Linux x64 ZIP]({download_url})")
    elif asset_name.endswith(".deb"):
        linux_downloads.append(f"- [DEB package]({download_url})")
    elif asset_name.endswith(".rpm"):
        linux_downloads.append(f"- [RPM package]({download_url})")

# Build markdown
markdown = f"""## Download

### Windows
{chr(10).join(windows_downloads)}

This app requires Windows 10 or later.

### macOS
{chr(10).join(macos_downloads)}

### Linux
{chr(10).join(linux_downloads)}

There is no AppImage version for this app yet.

## App updates

/* Please add some here manually */

**Full Changelog**: {changelog_url}
"""

print(markdown.strip())
