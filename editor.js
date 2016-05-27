var editor;

$(document).ready(function(){

  editor = CodeMirror.fromTextArea(document.getElementById("editor"),  {
        matchBrackets: true, // global configs for all editors
        lineWrapping: true
      });

  setupConsoleEditor(editor);

});


function evaluateThis(){
  console.log("Evaluating: " + editor.getValue());
  eval(editor.getValue());
}

function printMessage(){
  editor.appendLineWithStyle("\nHello Message...\n\n> ", "color: red; font-weight: bold");
}

function changeMode(mode){
  console.log("changing Mode: " + mode);
  switch(mode){
    case "js_console" :
        setupConsoleEditor(editor);
    break;
    case "js_editor" :
        setupJSEditor();
    break;
    case "html_editor" :
        setupHTMLEditor();
    break;
    case "html_editor_locked" :
          setupHTMLLockedEditor();
    break;
    case "html_editor_plocked" :
          setupHTMLPartEditor();
    break;
    case "sass_editor" :
          setupSASSEditor();
    break;
    case "css_editor":
          setupCSSEditor();
    break;
  }
}

/* this function sets up the editor as JS console, by adding new keymaps and
*  some new methods to the editor object. */
function setupConsoleEditor(editor){
  resetEditor();
  editor.setOption("mode", "javascript");
  editor.setOption("readOnly", false);
  editor.setOption("lineNumbers", false); // JS Console, no line numbers
  editor.removeKeyMap("default"); // remove default keymap
  editor.setValue("");//reset content
  editor.setOption("keyMap", { // set new keymap
    "Enter" : function(cm){
      var line = cm.getLine(cm.getCursor().line);
      cm.appendLine("\n\n> ");
      cm.lockLines();
      cm.resetStacksWith(line);
    },
    "Right" : "goCharRight",
    "Left"  : function(cm){
        var cursorPos = cm.getCursor();
        if(cursorPos.ch != 2) //after "> "
          cm.execCommand("goCharLeft");
    },
    "Up" : function(cm){
        if(cm.upCommandsStack.length == 0)
            return;

        var prevCommand = cm.upCommandsStack.pop();
        var currCommand = cm.getLine(cm.getCursor().line);

        if(currCommand != "> ")
          cm.downCommandsStack.push(currCommand);

        cm.execCommand("deleteLine");
        cm.appendLine(prevCommand);
        cm.execCommand("goDocEnd");
    },
    "Down": function (cm){
      if(cm.downCommandsStack.length == 0)
            return;

      var prevCommand = cm.downCommandsStack.pop();
      var currCommand = cm.getLine(cm.getCursor().line);
      if(currCommand != "> ")
          cm.upCommandsStack.push(currCommand);
      cm.execCommand("deleteLine");
      cm.appendLine(prevCommand);
      cm.execCommand("goDocEnd");
    },
    "Backspace": function(cm){
      var cursorPos = cm.getCursor();
      if(cursorPos.ch != 2) //after "> "
        cm.execCommand("delCharBefore");
    },
    "Delete" : function(cm){
      var cursorPos = cm.getCursor();
      if(cursorPos.ch != 2) //after "> "
        cm.execCommand("delCharAfter");
    }
  });


  /* setting prototype methods: */
  /* change theme method */
  editor.changeTheme = function (theme){
      console.log("Theme changed: " + theme);
      this.setOption("theme", theme);
  };

  /* lock lines from 0 to cursor */
  editor.lockLines = function(){
      this.markText({line : 0,ch:0},
         {line: this.getCursor().line, ch: 2},
         {
           className : "locked-text",
           inclusiveLeft: true,
           atomic: true
         });
  }

  /* append given line to the end of content */
  editor.appendLine = function(lineString){
      var doc = this.getDoc();
      var cursor = doc.getCursor(); // gets the line number in the cursor position
      var line = doc.getLine(cursor.line); // get the line contents
      var pos = { // create a new object to avoid mutation of the original selection
        line: cursor.line,
        ch: line.length // set the character position to the end of the line
      }
      doc.replaceRange(lineString, pos); // adds a new line
      this.lockLines();
  }

  /* append given line with given CSS styles */
  editor.appendLineWithStyle = function(lineString, cssStyles){
      this.execCommand("goDocEnd");
      var startLine = this.getCursor().line + 1;
      this.appendLine(lineString);
      var endLine = this.getCursor().line;
      this.markText({line : startLine,ch:0},
         {line: startLine + 1, ch: 0},
         {
           inclusiveLeft: true,
           atomic: true,
           css: cssStyles
         });
      this.lockLines();
  }

  /* reset commands stacks */
  this.editor.resetStacksWith = function(line){
         this.commandsStack.push(line);
         this.upCommandsStack = this.commandsStack.slice(0);// shallow copy
         this.downCommandsStack = [];
  }

  /* commands stack */
  editor.upCommandsStack = []; // a stack for js Console when pressing UP button
  editor.downCommandsStack = [];// down button
  editor.commandsStack =[];

  editor.appendLineWithStyle("JS Console: press 'Enter' to submit\n\n", "{}")
  editor.appendLine("> ");
  editor.lockLines();
}

function setupJSEditor(){
  resetEditor();
  editor.setOption("mode" , "javascript");
  editor.setOption("lineNumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", false);
  editor.setValue("var msg = 'Hello World';\nwindow.alert(msg);");
}

function setupHTMLEditor(){
  resetEditor();
  editor.setOption("mode", "text/html");
  editor.setOption("linenumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", false);
  editor.setValue("Loading...");
  //load content from gist:
  $.ajax({
      url: "https://gist.githubusercontent.com/bass3l/54cbcce35467dac69df449ba0971eb97/raw/80af768725d2eb09f6b06141e8ca1f82e84e5a0d/html_demo1.html",
      type: 'GET',
      dataType: 'text',
      cache: false,
    }).success( function(gistdata) {
        var content = gistdata;
        editor.setValue(content);
    }).error( function(e) {
        editor.setValue("ERROR LOADING GIST " + e.toString());
    });
}

function setupHTMLLockedEditor(){
  resetEditor();
  editor.setOption("mode", "text/html");
  editor.setOption("linenumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", true);
  editor.setValue("Loading...");
  //load content from gist:
  $.ajax({
      url: "https://gist.githubusercontent.com/bass3l/54cbcce35467dac69df449ba0971eb97/raw/80af768725d2eb09f6b06141e8ca1f82e84e5a0d/html_demo1.html",
      type: 'GET',
      dataType: 'text',
      cache: false,
    }).success( function(gistdata) {
        var content = gistdata;
        editor.setValue(content);
    }).error( function(e) {
        editor.setValue("ERROR LOADING GIST " + e.toString());
    });
}

function setupHTMLPartEditor(){
  resetEditor();
  editor.setOption("mode", "text/html");
  editor.setOption("linenumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", false);
  editor.setValue("Loading...");
  //load content from gist:
  $.ajax({
      url: "https://gist.githubusercontent.com/bass3l/54cbcce35467dac69df449ba0971eb97/raw/80af768725d2eb09f6b06141e8ca1f82e84e5a0d/html_demo1.html",
      type: 'GET',
      dataType: 'text',
      cache: false,
    }).success( function(gistdata) {
        var content = gistdata;
        editor.setValue(content);

        //prevent changing
        editor.on("beforeChange", events.html_partially_locked_event);
    }).error( function(e) {
        editor.setValue("ERROR LOADING GIST " + e.toString());
    });
}

function setupCSSEditor(){
  resetEditor();
  editor.setOption("mode", "css");
  editor.setOption("linenumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", false);
  editor.setValue(".hello_world {\n  color: red;\n}");
}

function setupSASSEditor(){
  resetEditor();
  editor.setOption("mode", "sass");
  editor.setOption("linenumbers", true);
  editor.setOption("keyMap", "default");
  editor.setOption("readOnly", false);
  editor.setValue("h1 {\n  color: $color-base;\n}");
}


/* this function should unregister all events' listeners which where registered during the excution */
function resetEditor(){
  //reset onBeforeChange
  editor.off("beforeChange", events.html_partially_locked_event);
}

//an object that holds all events' listeners
var events = {
  html_partially_locked_event : function(cm, change){
      //set readonly lines:
      var readonlyLines = [0,1,2,3,4,5,6,7,9,10];
      if(~readonlyLines.indexOf(change.from.line))
        change.cancel();
  }
}
