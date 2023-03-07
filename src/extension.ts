import * as vscode from 'vscode';


class Item implements vscode.QuickPickItem {
	constructor(public label: string, public line: number) {
		this.label = label.trim();
	}
}

let valueFromPreviousInvocation = '';
let lastSelected: Item;
let lastInputValue: string; // последнее введенное значение в поисковой строке плагина

// декоратор и его опции. определяет как будет выделяться найденная строка
const decorationOptions = {
	//isWholeLine: true,
	//overviewRulerLane: vscode.OverviewRulerLane.Right,
	//overviewRulerColor: 'blue',
	backgroundColor: 'green'
 };
const decoration = vscode.window.createTextEditorDecorationType(decorationOptions);



// Changes "5" to "0005", ie, ensures that |str| has |length| characters in it.
function pad(str: string, length: number) {
	return '0'.repeat(length - str.length) + str;
}

// сгенерирует регулялрку на основе переданной строки
function generateRegExp(searchString: string) {
	if (!searchString) { 
		return; 
	}
	
	let words: string[] = searchString.split(" ");

	let regExpStr: string = "";
	words.forEach((value) => {
		regExpStr = regExpStr + "(?=.*" + value + ")";
	});
	regExpStr = regExpStr + ".*";
	
	console.log("регулярка:", regExpStr);
	return new RegExp(regExpStr);
}

  
function find(useCurrentSelection: boolean, searchQuery: string) {
	// Build the entries we will show the user. One entry for each non-empty line,
	// prefixed with the line number. We prefix with the line number so lines stay
	// in the correct order and so duplicate lines do not get merged together.
	if (!vscode.window.activeTextEditor) {
		return;
	}

	let documentText: string = vscode.window.activeTextEditor.document.getText();
	let lines: string[] = documentText.split(/\r?\n/);
	let maxNumberLength = lines.length.toString().length;
	let quickPickEntries: Item[] = [];

	let regex = generateRegExp(searchQuery);

	for (let i = 0; i < lines.length; ++i) {
		if (lines[i] && ( (regex && regex.exec(lines[i])) || (!regex) )) {
			quickPickEntries.push(
				new Item(`${pad((i + 1).toString(), maxNumberLength)}: ${lines[i]}`, i));
		}
	}

	if (quickPickEntries.length === 0) {
		vscode.window.showInformationMessage('Ничего не найдено');
		return;
	}

	// Setup basic quick pick.
	let pick = vscode.window.createQuickPick<Item>();
	pick.items = quickPickEntries;
	pick.canSelectMany = false;


	pick.activeItems = [lastSelected];
	// Save the item the user selected so it can be pre-selected next time fuzzy
	// search is invoked.
	pick.onDidAccept(() => {
		lastSelected = pick.selectedItems[0];
		pick.hide();
	});


	// Show the currently selected item in the editor.
	pick.onDidChangeActive(items => {
		if (!items.length) {
			return;
		}
		
		//console.log("onDidChangeActive");

		const start = new vscode.Position(items[0].line, 0);
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			editor.revealRange(new vscode.Range(start, start), vscode.TextEditorRevealType.InCenter);
			editor.selection = new vscode.Selection(start, start);

			//const end = new vscode.Position(items[0].line, editor.document.lineAt(start).text.length);
			const end = new vscode.Position(items[0].line, items[0].label.length);
			editor.setDecorations(decoration, [new vscode.Range(start, end)]);
		}
	});


	if (useCurrentSelection) {
		pick.value = vscode.window.activeTextEditor.document.getText(
		vscode.window.activeTextEditor.selection);
	} else {
		// Show the previous search string. When the user types a character, the
		// preview string will replaced with the typed character.
		pick.value = valueFromPreviousInvocation;
		let previewValue = valueFromPreviousInvocation;
		let hasPreviewValue = previewValue.length > 0;
		pick.onDidChangeValue(value => {
			if (hasPreviewValue) {
				hasPreviewValue = false;

				// Try to figure out what text the user typed. Assumes that the user
				// typed at most one character.
				for (let i = 0; i < value.length; ++i) {
				if (previewValue.charAt(i) !== value.charAt(i)) {
					pick.value = value.charAt(i);
					break;
				}
				}
			}
		});
		// Save the search string so we can show it next time fuzzy search is
		// invoked.
		pick.onDidChangeValue(value => valueFromPreviousInvocation = value);
	}


	// If fuzzy-search was cancelled navigate to the previous location.
	let startingSelection = vscode.window.activeTextEditor.selection;
	pick.onDidHide(() => {
		if (pick.selectedItems.length === 0 && vscode.window.activeTextEditor) {
		vscode.window.activeTextEditor.revealRange(
			new vscode.Range(startingSelection.start, startingSelection.end),
			vscode.TextEditorRevealType.InCenter);
		vscode.window.activeTextEditor.selection = startingSelection;
		}
	});


	pick.show();
}


function showInput(){
	vscode.window.showInputBox({
		placeHolder: "Слова для поиска",
		prompt: "Искать",
		value: lastInputValue
	})
	.then(searchQuery => {
		// если нажат ESC
		if (searchQuery === undefined) {
			return;
		}

		console.log(searchQuery);
		lastInputValue = searchQuery;
			
		if (vscode.window.activeTextEditor) {
			find(false, searchQuery);
		} else {
			console.log("Нет активного редактора");
		}
	})
	;
}




export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('searchwords.find', () => {
		//find(false);
		showInput();
	});

	context.subscriptions.push(disposable);
}


export function deactivate() {}
