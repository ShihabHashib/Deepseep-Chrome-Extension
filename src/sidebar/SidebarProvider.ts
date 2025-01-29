import * as vscode from 'vscode';
import { DeepSeekAPI } from '../api/deepseek';
import { WorkspaceManager } from '../utils/WorkspaceManager';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'bakaai.sidebar';
    private _view?: vscode.WebviewView;
    private api: DeepSeekAPI;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this.api = new DeepSeekAPI();
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'askAI': {
                    if (data.value || data.images?.length > 0) {
                        try {
                            const response = await this.api.generateCompletion(
                                data.value,
                                data.includeContext,
                                data.images || []
                            );
                            this._view?.webview.postMessage({
                                type: 'response',
                                value: response
                            });
                        } catch (error: any) {
                            this._view?.webview.postMessage({
                                type: 'error',
                                value: error.message || 'An unknown error occurred'
                            });
                        }
                    }
                    break;
                }
                case 'getWorkspaceFiles':
                    const files = await WorkspaceManager.getWorkspaceFiles();
                    this._view?.webview.postMessage({
                        type: 'workspaceFiles',
                        files: files
                    });
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>BakaAI Assistant</title>
                <style>
                    :root {
                        --container-padding: 16px;
                        --input-padding: 12px;
                    }

                    body {
                        padding: var(--container-padding);
                        color: var(--vscode-foreground);
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        line-height: 1.6;
                    }

                    .input-container {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    textarea {
                        width: 100%;
                        min-height: 120px;
                        padding: var(--input-padding);
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 4px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        resize: vertical;
                    }

                    textarea:focus {
                        outline: none;
                        border-color: var(--vscode-focusBorder);
                    }

                    .context-toggle {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 13px;
                        opacity: 0.8;
                    }

                    .context-toggle input[type="checkbox"] {
                        margin: 0;
                    }

                    button {
                        padding: 8px 12px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 500;
                        transition: background-color 0.2s;
                    }

                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }

                    .loading {
                        display: none;
                        color: var(--vscode-textLink-foreground);
                        font-size: 13px;
                        margin-top: 8px;
                        align-items: center;
                        gap: 6px;
                    }

                    .loading::before {
                        content: '';
                        width: 12px;
                        height: 12px;
                        border: 2px solid var(--vscode-textLink-foreground);
                        border-top-color: transparent;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .response {
                        margin-top: 20px;
                        padding: var(--input-padding);
                        background: var(--vscode-editor-background);
                        border-radius: 4px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        white-space: pre-wrap;
                    }

                    .error {
                        color: var(--vscode-errorForeground);
                        background: var(--vscode-inputValidation-errorBackground);
                        border: 1px solid var(--vscode-inputValidation-errorBorder);
                        padding: 8px 12px;
                        border-radius: 4px;
                        margin-top: 8px;
                    }

                    .shortcuts {
                        margin-top: 8px;
                        font-size: 11px;
                        opacity: 0.7;
                    }

                    .drop-zone {
                        border: 2px dashed var(--vscode-input-border);
                        border-radius: 4px;
                        padding: 20px;
                        text-align: center;
                        margin-bottom: 12px;
                        transition: all 0.2s;
                        display: none;
                    }

                    .drop-zone.active {
                        border-color: var(--vscode-focusBorder);
                        background: var(--vscode-input-background);
                    }

                    .image-preview {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-top: 8px;
                    }

                    .image-item {
                        position: relative;
                        width: 100px;
                        height: 100px;
                        border-radius: 4px;
                        overflow: hidden;
                    }

                    .image-item img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .image-item .remove {
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        background: rgba(0, 0, 0, 0.6);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 12px;
                    }

                    .toolbar {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 8px;
                    }

                    .toolbar button {
                        padding: 4px 8px;
                        font-size: 12px;
                        opacity: 0.8;
                    }

                    .toolbar button:hover {
                        opacity: 1;
                    }

                    .file-suggestions {
                        position: absolute;
                        background: var(--vscode-input-background);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 4px;
                        max-height: 200px;
                        overflow-y: auto;
                        width: 100%;
                        display: none;
                        z-index: 1000;
                    }

                    .file-suggestion-item {
                        padding: 8px 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .file-suggestion-item:hover,
                    .file-suggestion-item.selected {
                        background: var(--vscode-list-hoverBackground);
                    }

                    .file-suggestion-item .icon {
                        opacity: 0.7;
                        font-size: 12px;
                    }

                    .file-tag {
                        display: inline-flex;
                        align-items: center;
                        background: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 12px;
                        margin: 2px;
                    }

                    .file-tag .remove {
                        margin-left: 4px;
                        cursor: pointer;
                        opacity: 0.7;
                    }

                    .file-tag .remove:hover {
                        opacity: 1;
                    }

                    .textarea-wrapper {
                        position: relative;
                    }
                </style>
            </head>
            <body>
                <div class="input-container">
                    <div class="toolbar">
                        <button id="toggleUpload">📎 Add Image</button>
                    </div>
                    <div id="dropZone" class="drop-zone">
                        Drop image here or click to upload
                        <input type="file" id="fileInput" accept="image/*" style="display: none">
                    </div>
                    <div id="imagePreview" class="image-preview"></div>
                    <div class="textarea-wrapper">
                        <textarea 
                            id="question" 
                            placeholder="Type @ to reference files, or ask about your code..."
                            spellcheck="false"
                        ></textarea>
                        <div id="fileSuggestions" class="file-suggestions"></div>
                    </div>
                    <div class="context-toggle">
                        <input type="checkbox" id="includeContext" checked>
                        <label for="includeContext">Include file context</label>
                    </div>
                    <button id="ask">Ask AI</button>
                    <div class="shortcuts">Press Ctrl+Enter to submit</div>
                    <div id="loading" class="loading">Processing request...</div>
                </div>
                <div id="response" class="response"></div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const questionInput = document.getElementById('question');
                    const responseDiv = document.getElementById('response');
                    const loadingDiv = document.getElementById('loading');
                    const contextCheckbox = document.getElementById('includeContext');
                    const dropZone = document.getElementById('dropZone');
                    const fileInput = document.getElementById('fileInput');
                    const imagePreview = document.getElementById('imagePreview');
                    const toggleUpload = document.getElementById('toggleUpload');
                    const fileSuggestions = document.getElementById('fileSuggestions');
                    
                    let uploadedImages = [];
                    let selectedFileIndex = -1;
                    let workspaceFiles = [];
                    let isShowingSuggestions = false;

                    // Toggle upload zone
                    toggleUpload.addEventListener('click', () => {
                        dropZone.style.display = dropZone.style.display === 'none' ? 'block' : 'none';
                    });

                    // Handle file selection
                    fileInput.addEventListener('change', handleFiles);
                    
                    // Handle drag and drop
                    dropZone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        dropZone.classList.add('active');
                    });

                    dropZone.addEventListener('dragleave', () => {
                        dropZone.classList.remove('active');
                    });

                    dropZone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        dropZone.classList.remove('active');
                        handleFiles(e.dataTransfer.files);
                    });

                    dropZone.addEventListener('click', () => {
                        fileInput.click();
                    });

                    // Handle paste
                    document.addEventListener('paste', (e) => {
                        const items = e.clipboardData?.items;
                        if (items) {
                            for (let item of items) {
                                if (item.type.indexOf('image') !== -1) {
                                    const file = item.getAsFile();
                                    if (file) handleFiles([file]);
                                }
                            }
                        }
                    });

                    function handleFiles(files) {
                        for (let file of files) {
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const base64 = e.target.result;
                                    uploadedImages.push(base64);
                                    updateImagePreview();
                                };
                                reader.readAsDataURL(file);
                            }
                        }
                    }

                    function updateImagePreview() {
                        imagePreview.innerHTML = uploadedImages.map((img, index) => `
            < div class="image-item" >
                <img src="${img}" alt = "Uploaded image ${index + 1}" >
                    <button class="remove" onclick = "removeImage(${index})" >×</button>
                        </div>
                            `).join('');
                    }

                    function removeImage(index) {
                        uploadedImages.splice(index, 1);
                        updateImagePreview();
                    }

                    // Update the ask event to include images
                    document.getElementById('ask').addEventListener('click', () => {
                        const question = questionInput.value.trim();
                        if (question || uploadedImages.length > 0) {
                            loadingDiv.style.display = 'flex';
                            responseDiv.textContent = '';
                            vscode.postMessage({
                                type: 'askAI',
                                value: question,
                                includeContext: contextCheckbox.checked,
                                images: uploadedImages
                            });
                        }
                    });

                    // Request workspace files on load
                    vscode.postMessage({ type: 'getWorkspaceFiles' });

                    // Handle file suggestions
                    questionInput.addEventListener('input', (e) => {
                        const cursorPosition = e.target.selectionStart;
                        const textBeforeCursor = e.target.value.substring(0, cursorPosition);
                        const match = textBeforeCursor.match(/@([^@\s]*)$/);

                        if (match) {
                            const searchTerm = match[1].toLowerCase();
                            showFileSuggestions(searchTerm);
                        } else {
                            hideFileSuggestions();
                        }
                    });

                    questionInput.addEventListener('keydown', (e) => {
                        if (isShowingSuggestions) {
                            switch (e.key) {
                                case 'ArrowDown':
                                    e.preventDefault();
                                    selectedFileIndex = Math.min(selectedFileIndex + 1, workspaceFiles.length - 1);
                                    updateSelectedFile();
                                    break;
                                case 'ArrowUp':
                                    e.preventDefault();
                                    selectedFileIndex = Math.max(selectedFileIndex - 1, 0);
                                    updateSelectedFile();
                                    break;
                                case 'Enter':
                                    if (selectedFileIndex >= 0) {
                                        e.preventDefault();
                                        insertFileReference(workspaceFiles[selectedFileIndex]);
                                    }
                                    break;
                                case 'Escape':
                                    hideFileSuggestions();
                                    break;
                            }
                        }
                    });

                    function showFileSuggestions(searchTerm) {
                        const filteredFiles = workspaceFiles.filter(file => 
                            file.toLowerCase().includes(searchTerm)
                        );

                        if (filteredFiles.length > 0) {
                            fileSuggestions.innerHTML = filteredFiles.map((file, index) => `
                        < div class="file-suggestion-item${index === selectedFileIndex ? ' selected' : ''}"
        data - index="${index}" >
            <span class="icon" >📄</span>
                < span > ${ file } </span>
                    </div>
                        `).join('');

                            fileSuggestions.style.display = 'block';
                            isShowingSuggestions = true;

                            // Add click handlers
                            fileSuggestions.querySelectorAll('.file-suggestion-item').forEach(item => {
                                item.addEventListener('click', () => {
                                    insertFileReference(workspaceFiles[parseInt(item.dataset.index)]);
                                });
                            });
                        } else {
                            hideFileSuggestions();
                        }
                    }

                    function hideFileSuggestions() {
                        fileSuggestions.style.display = 'none';
                        isShowingSuggestions = false;
                        selectedFileIndex = -1;
                    }

                    function updateSelectedFile() {
                        const items = fileSuggestions.querySelectorAll('.file-suggestion-item');
                        items.forEach((item, index) => {
                            item.classList.toggle('selected', index === selectedFileIndex);
                        });
                    }

                    function insertFileReference(filename) {
                        const cursorPosition = questionInput.selectionStart;
                        const textBeforeCursor = questionInput.value.substring(0, cursorPosition);
                        const textAfterCursor = questionInput.value.substring(cursorPosition);
                        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
                        
                        const newText = textBeforeCursor.substring(0, lastAtIndex) + 
                            `@${ filename } ` + 
                            textAfterCursor;
                        
                        questionInput.value = newText;
                        questionInput.focus();
                        hideFileSuggestions();
                    }

                    // Handle messages from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        loadingDiv.style.display = 'none';
                        switch (message.type) {
                            case 'response':
                                responseDiv.textContent = message.value;
                                responseDiv.style.display = 'block';
                                break;
                            case 'error':
                                responseDiv.innerHTML = \`<div class="error">\${message.value}</div>\`;
                                break;
                            case 'workspaceFiles':
                                workspaceFiles = message.files;
                                break;
                        }
                    });

                    questionInput.addEventListener('keydown', (e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                            document.getElementById('ask').click();
                        }
                    });

                    // Focus textarea on load
                    questionInput.focus();
                </script>
            </body>
            </html>
        `;
    }
} 