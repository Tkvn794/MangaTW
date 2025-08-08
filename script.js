let roomId;
let messagesRef;
let userName = 'Пользователь'; // Можно сделать ввод имени

document.getElementById("join-btn").onclick = () => {
  roomId = document.getElementById("room-id").value.trim();
  if (!roomId) return alert("Введите ID комнаты");

  document.getElementById("chat").style.display = "block";
  
  // Подключаемся к комнате через Firebase
  const db = firebase.database();
  messagesRef = db.ref(`messages/${roomId}`);
  
  // Слушаем новые сообщения
  messagesRef.on("child_added", snapshot => {
    const data = snapshot.val();
    displayMessage(data.sender + ": " + data.text, data.isOwn);
  });
  
  displayMessage("Подключены к комнате: " + roomId, true);
  document.getElementById("message-input").focus();
};

document.getElementById("send-btn").onclick = () => {
  sendMessage();
};

// Отправка по Enter
document.getElementById("message-input").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const msg = document.getElementById("message-input").value.trim();
  if (msg && messagesRef) {
    messagesRef.push({
      text: msg,
      sender: userName,
      timestamp: Date.now(),
      isOwn: true // Помечаем свои сообщения
    });
    document.getElementById("message-input").value = "";
  }
}

function displayMessage(msg, isOwn = false) {
  const messagesDiv = document.getElementById("messages");
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = isOwn ? "message own" : "message";
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
