# tao_protocol

## Folder Upload to GitHub

This application provides a simple web interface to upload folders from your PC to a GitHub repository.

### Features

- 📁 Select and upload entire folders to GitHub
- 🔐 Secure authentication using GitHub Personal Access Token
- 📊 Progress tracking with visual feedback
- 🎯 Configurable target path in repository
- 💾 Automatic file overwrite if file already exists

### How to Use

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or host it on a web server

2. **Select a Folder**
   - Click on the "Choose Folder" button
   - Select the folder you want to upload from your PC
   - All files in the folder (including subdirectories) will be selected

3. **Configure GitHub Settings**
   - **GitHub Personal Access Token**: Create a token at https://github.com/settings/tokens with `repo` scope
   - **Repository Owner**: Your GitHub username or organization name
   - **Repository Name**: The name of the repository where you want to upload
   - **Branch**: The target branch (default: main)
   - **Target Path**: Optional path where files will be uploaded (e.g., `uploads/`)

4. **Upload**
   - Click "Upload to GitHub" button
   - Wait for the upload to complete
   - Files will be committed to your repository with appropriate commit messages

### GitHub Token Setup

To use this application, you need to create a GitHub Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Folder Upload")
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token"
6. Copy the token and paste it in the application

⚠️ **Important**: Keep your token secure and never share it publicly!

### Technical Details

- Uses GitHub REST API v3
- Supports all file types (uploaded as base64)
- Maintains folder structure
- Handles file updates (overwrites existing files)

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

### Limitations

- GitHub API rate limits apply (5000 requests per hour for authenticated users)
- Maximum file size: 100 MB per file (GitHub API limitation)
- Large uploads may take time depending on file count and size