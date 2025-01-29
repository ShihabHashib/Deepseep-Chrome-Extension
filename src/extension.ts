// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar/SidebarProvider';
import { DeepSeekAPI } from './api/deepseek';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('BakaAI extension is now active');

	// Register Sidebar Provider
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidebarProvider.viewType,
			sidebarProvider
		)
	);

	const api = new DeepSeekAPI();

	// Register the AI command
	let aiCommandDisposable = vscode.commands.registerCommand('bakaai.askAI', async () => {
		// Get input from the user
		const userInput = await vscode.window.showInputBox({
			placeHolder: 'Ask AI about your code...',
			prompt: 'Enter your question or request'
		});

		if (userInput) {
			// Show progress indication
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Processing with AI...",
				cancellable: false
			}, async (progress) => {
				try {
					const response = await api.generateCompletion(userInput);

					// Create and show output channel
					const outputChannel = vscode.window.createOutputChannel('BakaAI');
					outputChannel.show();
					outputChannel.appendLine(response);

				} catch (error) {
					vscode.window.showErrorMessage('Error processing AI request: ' + error);
				}
			});
		}
	});

	// Update the openAISidebar command to use the correct command ID
	let sidebarDisposable = vscode.commands.registerCommand('bakaai.openAISidebar', () => {
		vscode.commands.executeCommand('workbench.view.extension.bakaai-sidebar');
	});

	context.subscriptions.push(aiCommandDisposable, sidebarDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
