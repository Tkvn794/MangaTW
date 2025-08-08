let userId;
let userName;
let roomId;
let messagesRef;

// Функция для генерации уникального ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функция для сохранения ID в localStorage
function saveUserId(id) {
  try {
    localStorage.setItem('chat_userId', id);
    console.log("User ID saved to localStorage");
  } catch (e) {
    console.error("Failed to save User ID to localStorage", e);
  }
}

// Функция для получения ID из localStorage
function loadUserId() {
  try {
    const savedId = localStorage.getItem('chat_userId');
    if (savedId) {
      console.log("User ID loaded from localStorage");
      return savedId;
    }
  } catch (e) {
    console.error("Failed to load User ID from localStorage", e);
  }
  return null;
}

// Инициализация: проверяем, есть ли сохраненный ID и имя
window.addEventListener('DOMContentLoaded', () => {
  userId = loadUserId();
  if (!userId) {
    userId = generateUserId();
    saveUserId(userId);
  }
  console.log("Мой ID:", userId);
  
  userName = localStorage.getItem('chat_userName');
  if (userName) {
    document.getElementById('user-name-input').value = userName;
    showChatScreen();
  }
  
  // Обновляем отображение ID после его загрузки/генерации
  if (document.getElementById('user-id-display')) {
    document.getElementById('user-id-display').textContent = userId;
  }
});

// Сохранение имени пользователя
document.getElementById("save-name-btn").onclick = () => {
  userName = document.getElementById("user-name-input").value.trim();
  if (!userName) {
    alert("Пожалуйста, введите имя");
    return;
  }
  try {
    localStorage.setItem('chat_userName', userName);
  } catch (e) {
    console.error("Failed to save user name to localStorage", e);
  }
  // Обновляем отображение ID
  if (document.getElementById('user-id-display')) {
    document.getElementById('user-id-display').textContent = userId;
  }
  showChatScreen();
};

function showChatScreen() {
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
}

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
    displayMessage(`${data.senderName} (${data.senderId}): ${data.text}`, data.senderId === userId);
  });
  
  displayMessage(`Вы (${userName}) подключились к комнате: ${roomId}`, true);
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
  if (msg && messagesRef && userName && userId) {
    messagesRef.push({
      text: msg,
      senderName: userName, // Используем введенное имя
      senderId: userId,     // Используем сохраненный ID
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    document.getElementById("message-input").value = "";
  } else if (!userName || !userId) {
    alert("Ошибка: Не удалось определить имя или ID пользователя");
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
