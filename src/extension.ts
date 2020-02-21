import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let extension = new CommandOnSave(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.hello", () => {}),
    vscode.workspace.onDidSaveTextDocument(e => {
      let outputChannel: vscode.OutputChannel;
      outputChannel = vscode.window.createOutputChannel("command on save");
      outputChannel.show();

      let result = "command on save msg";
      outputChannel.appendLine(result);
    })
  );
}

export function deactivate() {}

class CommandOnSave {
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadConfig();
  }

  loadConfig() {
    this.config = vscode.workspace
      .getConfiguration()
      .get("jerrychoux.commandOnSave");

    console.log(">>>config=", this.config);
  }
}
