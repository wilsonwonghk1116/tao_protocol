// Global variables
let selectedFiles = [];
let uploadInProgress = false;

// DOM elements
const folderInput = document.getElementById('folderInput');
const fileList = document.getElementById('fileList');
const fileItems = document.getElementById('fileItems');
const fileCount = document.getElementById('fileCount');
const uploadBtn = document.getElementById('uploadBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const statusMessage = document.getElementById('statusMessage');

// Event listeners
folderInput.addEventListener('change', handleFolderSelect);
uploadBtn.addEventListener('click', handleUpload);

// Handle folder selection
function handleFolderSelect(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        return;
    }

    selectedFiles = files;
    displayFileList(files);
    uploadBtn.disabled = false;
    
    showStatus('Folder selected! Configure GitHub settings and click "Upload to GitHub"', 'info');
}

// Display selected files
function displayFileList(files) {
    fileItems.innerHTML = '';
    fileCount.textContent = files.length;
    
    // Group files by directory
    const fileTree = {};
    files.forEach(file => {
        const path = file.webkitRelativePath || file.name;
        fileTree[path] = file;
    });

    // Display files (limit to first 20 for performance)
    const displayLimit = 20;
    const sortedPaths = Object.keys(fileTree).sort();
    
    sortedPaths.slice(0, displayLimit).forEach(path => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.textContent = path;
        fileItems.appendChild(div);
    });

    if (sortedPaths.length > displayLimit) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.style.fontStyle = 'italic';
        div.textContent = `... and ${sortedPaths.length - displayLimit} more files`;
        fileItems.appendChild(div);
    }

    fileList.style.display = 'block';
}

// Handle upload to GitHub
async function handleUpload() {
    if (uploadInProgress) {
        return;
    }

    // Validate inputs
    const githubToken = document.getElementById('githubToken').value.trim();
    const repoOwner = document.getElementById('repoOwner').value.trim();
    const repoName = document.getElementById('repoName').value.trim();
    const branch = document.getElementById('branch').value.trim() || 'main';
    const targetPath = document.getElementById('targetPath').value.trim();

    if (!githubToken) {
        showStatus('Please enter your GitHub Personal Access Token', 'error');
        return;
    }

    if (!repoOwner) {
        showStatus('Please enter the repository owner', 'error');
        return;
    }

    if (!repoName) {
        showStatus('Please enter the repository name', 'error');
        return;
    }

    if (selectedFiles.length === 0) {
        showStatus('Please select a folder first', 'error');
        return;
    }

    uploadInProgress = true;
    uploadBtn.disabled = true;
    progressBar.classList.add('active');
    showStatus('Starting upload...', 'info');

    try {
        let uploaded = 0;
        const total = selectedFiles.length;

        for (const file of selectedFiles) {
            const relativePath = file.webkitRelativePath || file.name;
            const fullPath = targetPath ? `${targetPath}/${relativePath}` : relativePath;
            
            await uploadFile(file, fullPath, githubToken, repoOwner, repoName, branch);
            
            uploaded++;
            const percentage = Math.round((uploaded / total) * 100);
            updateProgress(percentage, `${uploaded}/${total} files`);
        }

        showStatus(`Successfully uploaded ${uploaded} files to GitHub!`, 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        showStatus(`Upload failed: ${error.message}`, 'error');
    } finally {
        uploadInProgress = false;
        uploadBtn.disabled = false;
        setTimeout(() => {
            progressBar.classList.remove('active');
        }, 2000);
    }
}

// Upload a single file to GitHub
async function uploadFile(file, path, token, owner, repo, branch) {
    const content = await readFileAsBase64(file);
    
    // First, try to get the file SHA if it exists (for updates)
    let sha = null;
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }
    } catch (error) {
        // File doesn't exist, that's fine
    }

    // Create or update the file
    const body = {
        message: `Upload ${path}`,
        content: content,
        branch: branch
    };

    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to upload ${path}`);
    }

    return await response.json();
}

// Read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Update progress bar
function updateProgress(percentage, text) {
    progressFill.style.width = percentage + '%';
    progressFill.textContent = text || percentage + '%';
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message status-' + type;
    statusMessage.style.display = 'block';
}
