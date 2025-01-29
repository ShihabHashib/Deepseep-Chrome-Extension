import axios from 'axios';
import * as vscode from 'vscode';
import { WorkspaceManager } from '../utils/WorkspaceManager';

export class DeepSeekAPI {
    private apiKey: string;
    private baseURL = 'https://api.deepseek.com/v1';

    constructor() {
        this.apiKey = vscode.workspace.getConfiguration('bakaai').get('apiKey') || '';
    }

    public async checkApiKey(): Promise<boolean> {
        if (!this.apiKey) {
            const input = await vscode.window.showInputBox({
                prompt: 'Please enter your DeepSeek API key',
                password: true,
                ignoreFocusOut: true
            });

            if (input) {
                await vscode.workspace.getConfiguration('bakaai').update('apiKey', input, true);
                this.apiKey = input;
                return true;
            }
            return false;
        }
        return true;
    }

    public async generateCompletion(
        prompt: string,
        includeContext: boolean = true,
        images: string[] = []
    ): Promise<string> {
        if (!await this.checkApiKey()) {
            throw new Error('API key not configured');
        }

        try {
            let fullPrompt = prompt;

            if (includeContext) {
                const fileContext = WorkspaceManager.getFileContext();
                const relatedFiles = await WorkspaceManager.getRelatedFiles(
                    vscode.window.activeTextEditor?.document.fileName || ''
                );

                fullPrompt = `Context:\n${fileContext}\n\nRelated Files:\n`;
                relatedFiles.forEach((content, filepath) => {
                    fullPrompt += `\nFile: ${filepath}\n${content}\n`;
                });
            }

            if (images.length > 0) {
                fullPrompt += '\n[Images attached]\n';
            }

            fullPrompt += `\nQuestion: ${prompt}`;

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: 'deepseek-coder-33b-instruct',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI programming assistant. Analyze the provided code context, related files, and images to provide accurate and helpful responses.'
                        },
                        {
                            role: 'user',
                            content: fullPrompt,
                            images: images // Add images to the request
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
} 