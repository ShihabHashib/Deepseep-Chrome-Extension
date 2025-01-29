import * as vscode from 'vscode';
import * as path from 'path';

export class WorkspaceManager {
    static async getOpenEditorContent(): Promise<string | undefined> {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.document.getText();
        }
        return undefined;
    }

    static async getRelatedFiles(currentFile: string): Promise<Map<string, string>> {
        const workspaceFiles = new Map<string, string>();

        if (!vscode.workspace.workspaceFolders) {
            return workspaceFiles;
        }

        const files = await vscode.workspace.findFiles('**/*.{ts,js,jsx,tsx,json,html,css}', '**/node_modules/**');
        const maxFiles = 5; // Limit the number of related files
        let filesAdded = 0;

        for (const file of files) {
            if (filesAdded >= maxFiles) break;

            const content = await this.readFile(file);
            if (content) {
                workspaceFiles.set(file.fsPath, content);
                filesAdded++;
            }
        }

        return workspaceFiles;
    }

    private static async readFile(uri: vscode.Uri): Promise<string | undefined> {
        try {
            const content = await vscode.workspace.fs.readFile(uri);
            return Buffer.from(content).toString('utf-8');
        } catch (error) {
            console.error(`Error reading file ${uri.fsPath}:`, error);
            return undefined;
        }
    }

    static getFileContext(): string {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return '';
        }

        const selection = editor.selection;
        const document = editor.document;
        const fileName = path.basename(document.fileName);

        let context = `File: ${fileName}\n`;

        if (!selection.isEmpty) {
            const selectedText = document.getText(selection);
            context += `Selected code:\n${selectedText}\n`;
        } else {
            const visibleRanges = editor.visibleRanges;
            const visibleText = visibleRanges
                .map(range => document.getText(range))
                .join('\n');
            context += `Visible code:\n${visibleText}\n`;
        }

        return context;
    }

    static async getWorkspaceFiles(): Promise<string[]> {
        const files: string[] = [];

        if (!vscode.workspace.workspaceFolders) {
            return files;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const foundFiles = await vscode.workspace.findFiles(
            '**/*.{ts,js,jsx,tsx,json,html,css,md,py,java,cpp,c,h,hpp,go,rs,php}',
            '**/node_modules/**'
        );

        return foundFiles.map(file => {
            const relativePath = vscode.workspace.asRelativePath(file);
            return relativePath;
        });
    }
} 