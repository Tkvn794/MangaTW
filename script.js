let peerConnection;
const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

document.getElementById("join-btn").onclick = () => {
  const roomId = document.getElementById("room-id").value;
  if (!roomId) return alert("Введите ID комнаты");

  document.getElementById("chat").style.display = "block";

  // Подключаемся к комнате
  setupPeer(roomId);
};

document.getElementById("send-btn").onclick = () => {
  const msg = document.getElementById("message-input").value;
  if (msg && peerConnection) {
    peerConnection.send(msg);
    displayMessage("Вы: " + msg);
    document.getElementById("message-input").value = "";
  }
};

function setupPeer(roomId) {
  const db = firebase.database();
  const roomRef = db.ref(`rooms/${roomId}`);

  peerConnection = new RTCPeerConnection(servers);

  // Отправка ICE кандидатов
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      roomRef.child("iceCandidates").push(event.candidate);
    }
  };

  // Получение сообщений через DataChannel
  let dataChannel;
  peerConnection.ondatachannel = event => {
    dataChannel = event.channel;
    dataChannel.onmessage = e => displayMessage("Собеседник: " + e.data);
  };

  // Создание DataChannel
  dataChannel = peerConnection.createDataChannel("chat");
  dataChannel.onopen = () => console.log("DataChannel открыт");
  dataChannel.onmessage = e => displayMessage("Собеседник: " + e.data);

  // Создание предложения
  peerConnection.createOffer().then(offer => {
    return peerConnection.setLocalDescription(offer);
  }).then(() => {
    roomRef.child("offer").set(peerConnection.localDescription);
  });

  // Слушаем ответ
  roomRef.child("answer").on("value", snapshot => {
    const data = snapshot.val();
    if (data && !peerConnection.currentRemoteDescription) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    }
  });

  // Слушаем ICE кандидаты
  roomRef.child("iceCandidates").on("child_added", snapshot => {
    const candidate = snapshot.val();
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

function displayMessage(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  document.getElementById("messages").appendChild(div);
}
