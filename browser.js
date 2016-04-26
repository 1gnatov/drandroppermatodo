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
        $('#' + msgObj.id + '.todoelem').insertBefore('#' + msgObj.position + '.todoelem');
    } else if (msgObj.modelChange === "dropAfter") {
        $('#' + msgObj.id + '.todoelem').insertAfter('#' + msgObj.position + '.todoelem');
    }

};

function allowDrop(ev) {
    $(ev.target).addClass('highlighted');
    ev.preventDefault();
}

function removeHighlight(ev) {
    $(ev.target).removeClass('highlighted');
    ev.preventDefault();
}

function removeAllhighlighted() {
    $('.highlighted').each(function(index, el) {
        $(this).removeClass('highlighted');
    });
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
    ev.dataTransfer.setData("text/html", ev.target.textContent);
}

function dropBefore(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text/plain");
    var text = ev.dataTransfer.getData("text/html");
    if (ev.target.id === id) {
        // Nothing to do here
    } else {
        // $('#' + id + '.todoelem').remove();
        // $(ev.target).parent().before($(createListElem(id, text)));
        var listEle = { "modelChange": "dropBefore", "id": id, "text": text, "position": ev.target.id };
        socket.send(JSON.stringify(listEle));
    }

}

function dropAfter(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text/plain");
    var text = ev.dataTransfer.getData("text/html");
    if (ev.target.id === id) {
        // Nothing to do here
    } else {
        // $('#' + id + '.todoelem').remove();
        // $(ev.target).parent().after($(createListElem(id, text)));
        var listEle = { "modelChange": "dropAfter", "id": id, "text": text, "position": ev.target.id };
        socket.send(JSON.stringify(listEle));
    }
}

function createListElem(id, text) {
    $containerElem = $("<div id='" + id + "' class='todoelem' ondrop=''></div>")
    $elem = $("<div id='" + id + "' class='bright1 rectangle stack nodrop' draggable='true' ondragstart='drag(event)' ondragend='removeAllhighlighted()'>" + text + "</div>")
    $topDropZone = $("<div id='" + id + "' class='pseudo-top' ondrop='dropBefore(event)' ondragover='allowDrop(event)' ondragleave='removeHighlight(event)'></div>");
    $botDropZone = $("<div id='" + id + "' class='pseudo-bot' ondrop='dropAfter(event)' ondragover='allowDrop(event)' ondragleave='removeHighlight(event)'></div>");
    $containerElem.append($topDropZone, $elem, $botDropZone);
    return $containerElem;
}


$(document).ready(function() {


    //adding element
    $("form").submit(function(e) {
        e.preventDefault();
        var text = $(".inp").val();
        text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        if (text !== '') {
            var id = "id" + Math.random().toString(16).slice(2)

            //$(".listed").append(createListElem(id, text));

            var listEle = { "modelChange": "create", "id": id, "text": text };
            socket.send(JSON.stringify(listEle));
            this.reset();
        }
    });

});
