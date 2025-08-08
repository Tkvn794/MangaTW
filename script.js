let roomId;
let messagesRef;
let userId;

// Генерируем уникальный ID для пользователя
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Генерируем ID при загрузке страницы
userId = generateUserId();
console.log("Мой ID:", userId);

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
    // Определяем, наше ли это сообщение
    const isOwn = data.userId === userId;
    displayMessage(data.sender + ": " + data.text, isOwn);
  });
  
  displayMessage("Вы подключились к комнате: " + roomId, true);
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
      sender: "Пользователь",
      userId: userId, // Добавляем ID пользователя
      timestamp: firebase.database.ServerValue.TIMESTAMP
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
