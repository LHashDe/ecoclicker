function initElement() {
  let chat = document.getElementById("messagesBlock");
  setTimeout(() => chat.scrollTop = chat.scrollHeight, 1500);
  fetch('/api/getScore').then(x => x.json()).then(x => scoredom.innerText = x.score);
  var p = document.getElementById("hitbox");
  var scoredom = document.getElementById("scorevalue");
  p.addEventListener('click', event => {
    var e = window.event;
    var posX = e.pageX;
    var posY = e.pageY;
    fetch('/api/incrementScore');
    fetch('/api/getScore').then(x => x.json()).then(x => scoredom.innerText = x.score);

    let img = document.createElement('img');
    img.src = "/ressources/wota.gif";
    img.style.height = '10%';
    img.style.top = (posY - 100 - 380) + "px";
    img.style.left = (posX - 100 - 380) + "px";
    p.appendChild(img);
    setTimeout(() => p.removeChild(img), 350);
  });
};


function refresh_messages() {
  setInterval(function() {
    fetch('/messages_content').then(function(response) {
      return response.text();

    }).then(function(text) {
      var messages = document.getElementById('messagesBlock');
      messages.innerHTML = text;
    });
  }, 100);
}

var loadFile = function(event) {
	var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
};

function showAlert() {
  alert("Evènement de click détecté");
}


function postMessage() {
  let chat = document.getElementById("messagesBlock");
  let text = document.getElementById("messagetext");
  console.log(text);
  let message = {
    content: text.value
  };
  fetch('/api/add_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify(message)
  })

  setTimeout(() => text.value = "", 1);
  chat.scrollTop = chat.scrollHeight;
}