import * as vscode from "vscode";
import { exec } from "child_process";

const CHANNEL_NAME = "Command On Save";
const EXTENSION_NAME = "jerrychoux.commandOnSave";

export function activate(context: vscode.ExtensionContext) {
  let extension = new CommandOnSave(context);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      extension.ExecuteCommands(document);
    }),
    vscode.workspace.onDidChangeConfiguration(() => {
      extension.LoadConfig();
    })
  );
}

export function deactivate() {}

interface ICommand {
  ext: string;
  cmd: string;
}

class CommandOnSave {
  output: vscode.OutputChannel;
  context: vscode.ExtensionContext;
  commands: Array<ICommand>;

  constructor(context: vscode.ExtensionContext) {
    this.output = vscode.window.createOutputChannel(CHANNEL_NAME);
    this.context = context;
    this.commands = [];

    this.LoadConfig();
  }

  public LoadConfig() {
    this.commands = <Array<ICommand>>(
      vscode.workspace.getConfiguration().get(EXTENSION_NAME)
    );
  }

  private executeCommand(
    commands: Array<ICommand>,
    document: vscode.TextDocument
  ) {
    if (commands.length === 0) {
      this.output.appendLine("Execute Commands Done.");
      return;
    }

    let command = commands.shift();
    exec(command!.cmd).on(
      "exit",
      this.executeCommand.bind(this, commands, document)
    );
  }

  public ExecuteCommands(document: vscode.TextDocument) {
    if (this.commands.length === 0) {
      return;
    }

    let fileExt = document.fileName
      .substr(document.fileName.lastIndexOf(".") + 1)
      .toLowerCase();

    let commands = this.commands.filter(command => fileExt === command.ext);
    if (commands.length === 0) {
      return;
    }

    commands.forEach(command => {
      command.cmd = command.cmd.replace(/\${file}/g, `${document.fileName}`);
    });

    this.output.appendLine("Execute Commands for file " + document.fileName);
    this.executeCommand(commands, document);
  }
}
