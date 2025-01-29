import * as vscode from 'vscode';
import { DeepSeekAPI } from '../api/deepseek';

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
                    if (data.value) {
                        try {
                            const response = await this.api.generateCompletion(data.value);
                            this._view?.webview.postMessage({
                                type: 'response',
                                value: response
                            });
                        } catch (error) {
                            this._view?.webview.postMessage({
                                type: 'error',
                                value: error.message
                            });
                        }
                    }
                    break;
                }
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
                    body {
                        padding: 10px;
                    }
                    .input-container {
                        margin-bottom: 10px;
                    }
                    textarea {
                        width: 100%;
                        min-height: 100px;
                        margin-bottom: 10px;
                    }
                    button {
                        width: 100%;
                        padding: 8px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        cursor: pointer;
                    }
                    .response {
                        margin-top: 10px;
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                <div class="input-container">
                    <textarea id="question" placeholder="Ask AI about your code..."></textarea>
                    <button id="ask">Ask AI</button>
                </div>
                <div id="response" class="response"></div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const questionInput = document.getElementById('question');
                    const responseDiv = document.getElementById('response');

                    document.getElementById('ask').addEventListener('click', () => {
                        const question = questionInput.value;
                        if (question) {
                            vscode.postMessage({
                                type: 'askAI',
                                value: question
                            });
                        }
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'response':
                                responseDiv.textContent = message.value;
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
} 