if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

// создать подключение
var socket = new WebSocket("ws://localhost:8081");

// отправить сообщение из формы publish
// document.forms.publish.onsubmit = function() {
//     var outgoingMessage = this.message.value;

//     socket.send(outgoingMessage);
//     return false;
// };

// обработчик входящих сообщений
socket.onmessage = function(event) {
    var incomingMessage = event.data;
    msgObj = JSON.parse(incomingMessage);
    if (msgObj.modelChange === "create") {
        $(".listed").append(createListElem(msgObj.id, msgObj.text));
    } else if (msgObj.modelChange === "dropBefore") {
        $('#' + msgObj.id + '.todoelem').remove();
        $('#' + msgObj.position + '.todoelem').before($(createListElem(msgObj.id, msgObj.text)));
    } else if (msgObj.modelChange === "dropAfter") {
        $('#' + msgObj.id + '.todoelem').remove();
        $('#' + msgObj.position + '.todoelem').after($(createListElem(msgObj.id, msgObj.text)));
    }

};

function allowDrop(ev) {
    var id = ev.dataTransfer.getData("text/plain")
    ev.dataTransfer.dropEffect = "move"
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
    ev.dataTransfer.setData("text/html", ev.target.textContent);
}

function dropBefore(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text/plain");
    var text = ev.dataTransfer.getData("text/html");
    // $('#' + id + '.todoelem').remove();
    // $(ev.target).parent().before($(createListElem(id, text)));
    var listEle = { "modelChange": "dropBefore", "id": id, "text": text, "position": ev.target.id };
    socket.send(JSON.stringify(listEle));
}

function dropAfter(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text/plain");
    var text = ev.dataTransfer.getData("text/html");
    // $('#' + id + '.todoelem').remove();
    // $(ev.target).parent().after($(createListElem(id, text)));
    var listEle = { "modelChange": "dropAfter", "id": id, "text": text, "position": ev.target.id };
    socket.send(JSON.stringify(listEle));
}

function createListElem(id, text) {
    $containerElem = $("<li id='" + id + "' class='todoelem' ></li>")
    $elem = $("<div id='" + id + "' class='bright1 rectangle stack nodrop' draggable='true' ondragstart='drag(event)' >" + text + "</div>")
    $topDropZone = $("<div id='" + id + "' class='pseudo-top' ondrop='dropBefore(event)' ondragover='allowDrop(event)'></div>");
    $botDropZone = $("<div id='" + id + "' class='pseudo-bot' ondrop='dropAfter(event)' ondragover='allowDrop(event)'></div>");
    $containerElem.append($topDropZone, $elem, $botDropZone);
    return $containerElem;
}


$(document).ready(function() {


    //adding element
    $("form").submit(function(e) {
        e.preventDefault();
        var text = $(".inp").val();
        if (text !== '') {
            var id = "id" + Math.random().toString(16).slice(2)

            //$(".listed").append(createListElem(id, text));

            var listEle = { "modelChange": "create", "id": id, "text": text };
            socket.send(JSON.stringify(listEle));
            this.reset();
        }
    });

});
