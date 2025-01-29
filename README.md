# BakaAI - AI-Powered Coding Assistant

BakaAI is a Visual Studio Code extension that provides AI-powered coding assistance similar to Cursor AI. It helps developers with code understanding, generation, and modifications using the DeepSeek AI model.

![BakaAI Demo](images/demo.gif)

## Features

- 🤖 AI-powered code assistance
- 📁 File context awareness
- 🔍 Smart file referencing with `@` mentions
- 📸 Image upload and analysis support
- ⌨️ Convenient keyboard shortcuts
- 🎨 Modern, VS Code-native UI

### Smart Context Understanding

- Automatically includes relevant file context
- References multiple files using `@` mentions
- Understands code selection

### Image Support

- Drag & drop image upload
- Paste images directly
- Multiple image analysis

### Keyboard Shortcuts

- `Ctrl+Shift+A` (`Cmd+Shift+A` on Mac): Quick AI query
- `Ctrl+Shift+L` (`Cmd+Shift+L` on Mac): Toggle sidebar
- `Ctrl+Enter`: Submit query from sidebar

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "BakaAI"
4. Click Install

Or install from VS Code Marketplace: [BakaAI Extension](https://marketplace.visualstudio.com/items?itemName=yourusername.bakaai)

## Setup

1. Get a DeepSeek API key from [platform.deepseek.com](https://platform.deepseek.com)
2. In VS Code, open Command Palette (Ctrl+Shift+P)
3. Type "BakaAI: Set API Key" and enter your key

## Usage

### Basic Usage

1. Open the BakaAI sidebar (click the BakaAI icon in the activity bar)
2. Type your question or request
3. Press Enter or click "Ask AI"

### File References

1. Type `@` in the input box
2. Start typing a filename
3. Use arrow keys or mouse to select the file
4. Press Enter to insert the file reference

### Image Analysis

1. Click "Add Image" or drag & drop images
2. Type your question about the images
3. Submit to get AI analysis

## Examples

### Code Explanation

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
