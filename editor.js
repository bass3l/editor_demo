var editor;

$(document).ready(function(){
  editor = CodeMirror.fromTextArea(document.getElementById("editor"),  {
        lineNumbers: true,
        matchBrackets: true
      });

      editor.setOption("lineWrapping", true);
      editor.setOption("value", "window.alert('Hello World!');");
});

function changeTheme(theme){
  console.log(theme);
  editor.setOption("theme", theme);
}

function evaluateThis(){
  eval(editor.getValue());
}
