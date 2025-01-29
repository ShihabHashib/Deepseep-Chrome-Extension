import axios from 'axios';
import * as vscode from 'vscode';

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

    public async generateCompletion(prompt: string): Promise<string> {
        if (!await this.checkApiKey()) {
            throw new Error('API key not configured');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: 'deepseek-coder-33b-instruct',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1000
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