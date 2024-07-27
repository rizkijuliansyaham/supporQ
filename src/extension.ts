import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

// Promisify fs.writeFile for better async/await support
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.customContextMenu', (uri: vscode.Uri) => {
        // This function is triggered when the context menu item is selected

		
        // uri is the file that was right-clicked
        const filePath = uri.fsPath;

        // Display an information message
        vscode.window.showInformationMessage(`Custom action triggered on ${filePath}`);
        
        // Add your custom logic here. For example, you can read the file, modify it, etc.
    });

	let actionForAddPartFile = vscode.commands.registerCommand('extension.actionForAddPartFile', async (uri: vscode.Uri) => {
        // Ensure the selected resource is a file
        if (uri.scheme !== 'file' || uri.path === '') {
            vscode.window.showErrorMessage('Please select a file.');
            return;
        }

        // Get the directory of the selected file
        const folderPath = path.dirname(uri.fsPath);

        // Prompt the user for the file name without the extension
        const fileNameWithoutExtension = await vscode.window.showInputBox({
            prompt: 'Enter the name of the new file (without extension)',
            placeHolder: 'filename'
        });

        if (!fileNameWithoutExtension) {
            return;
        }

        // Append the .dart extension
        const fileName = `${fileNameWithoutExtension}.dart`;
        const filePath = path.join(folderPath, fileName);

        // Append the .dart extension
        const newFileName = `${fileNameWithoutExtension}.dart`;
        const newFilePath = path.join(folderPath, newFileName);

		// Get the clicked file name
        const clickedFileName = path.basename(uri.fsPath);

        // Define the specific content to be written to the new file
        const newFileContent = `part of '${clickedFileName}';`;

        // Define the text to be inserted into the clicked file
        const textToInsert = 'part \'' + newFileName + '\';\n';

        try {
            // Create the new file with specific content
            await writeFile(newFilePath, newFileContent);
            vscode.window.showInformationMessage(`New file created: ${newFilePath}`);

            // Read the existing content of the clicked file
            const fileContent = await readFile(uri.fsPath, 'utf8');
            const lines = fileContent.split('\n');

            // Find the index of the line containing 'import package'
            const importIndex = lines.findIndex(line => line.includes('import'));

            if (importIndex === -1) {
                vscode.window.showErrorMessage('No line with "import package" found in the clicked file.');
            } else {
                // Insert the new text after the import statement
                lines.splice(importIndex + 1, 0, textToInsert);

                // Join the lines back into a single string
                const updatedFileContent = lines.join('\n');

                // Write the updated content back to the clicked file
                await writeFile(uri.fsPath, updatedFileContent);
                vscode.window.showInformationMessage(`Clicked file updated: ${uri.fsPath}`);
            }

            // Optionally, open the new file in the editor
            const document = await vscode.workspace.openTextDocument(newFilePath);
            vscode.window.showTextDocument(document);

            // Refresh the clicked file in the editor
            const clickedDoc = await vscode.workspace.openTextDocument(uri.fsPath);
            vscode.window.showTextDocument(clickedDoc);

        } catch (err) {
            vscode.window.showErrorMessage(`Failed to create or modify files: ${err}`);
        }
    });

   
	let actionForOtherFile = vscode.commands.registerCommand('extension.actionForDirectory', (uri: vscode.Uri) => {
        // This function is triggered when the context menu item for non-Dart files is selected
        const filePath = uri.fsPath;
        vscode.window.showInformationMessage(`Action for Other File triggered for: ${filePath}`);
        // Add custom logic for other files here
    });

    context.subscriptions.push(disposable, actionForAddPartFile, actionForOtherFile);
}

export function deactivate() {}
