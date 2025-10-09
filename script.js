const $ = (s) => document.querySelector(s);
const state = { chats: [], activeId: null };

const uid = () => Math.random().toString(36).slice(2, 9);
const nowISO = () => new Date().toISOString();
const fmt = (ts) => new Date(ts).toLocaleString();

// 初始 mock 数据
function seed() {
  const t = nowISO();
  state.chats = [
    {
      id: uid(),
      title: "欢迎使用 Chatbot",
      lastMessage: "这里会显示最近一条消息...",
      updatedAt: t,
      messages: [
        { id: uid(), role: "assistant", content: "你好，我是你的智能助手。", time: t },
        { id: uid(), role: "user", content: "你好！", time: t },
      ],
    },
  ];
  state.activeId = state.chats[0].id;
}

function renderList() {
  const box = $("#chatList");
  box.innerHTML = "";
  for (const c of state.chats) {
    const li = document.createElement("button");
    li.className = "item" + (c.id === state.activeId ? " active" : "");
    li.innerHTML = `
      <div class="row">
        <div class="title">${c.title}</div>
        <div class="time">${fmt(c.updatedAt)}</div>
      </div>
      <div class="snippet">${c.lastMessage}</div>`;
    li.onclick = () => { state.activeId = c.id; renderAll(); };
    box.appendChild(li);
  }
}

function renderMessages() {
  const active = state.chats.find((c) => c.id === state.activeId);
  const box = $("#messageList");
  const title = $("#chatTitle");
  if (!active) {
    title.textContent = "未选择会话";
    box.innerHTML = `<div class="empty">在左侧选择一个会话</div>`;
    return;
  }
  title.textContent = active.title;
  box.innerHTML = active.messages.map(m => `
    <div class="msg ${m.role}">
      <div class="bubble">
        <div>${m.content}</div>
        <div class="meta">${fmt(m.time)}</div>
      </div>
    </div>`).join("");
  box.scrollTop = box.scrollHeight;
}

function onSend() {
  const input = $("#draft");
  const text = input.value.trim();
  if (!text) return;
  const active = state.chats.find(c => c.id === state.activeId);
  const msg = { id: uid(), role: "user", content: text, time: nowISO() };
  active.messages.push(msg);
  active.lastMessage = msg.content;
  active.updatedAt = msg.time;
  input.value = "";
  renderAll();

  setTimeout(() => {
    const reply = { id: uid(), role: "assistant", content: "（示例回复）已收到：" + text, time: nowISO() };
    active.messages.push(reply);
    active.lastMessage = reply.content;
    active.updatedAt = reply.time;
    renderAll();
  }, 400);
}

function renderAll() {
  renderList();
  renderMessages();
}

$("#sendBtn").onclick = onSend;
$("#newBtn").onclick = () => {
  const id = uid();
  const created = nowISO();
  state.chats.unshift({ id, title: "新会话", lastMessage: "", updatedAt: created, messages: [] });
  state.activeId = id;
  renderAll();
};

$("#delBtn").onclick = () => {
  const i = state.chats.findIndex(c => c.id === state.activeId);
  if (i >= 0) state.chats.splice(i, 1);
  state.activeId = state.chats[0]?.id || null;
  renderAll();
};

seed();
renderAll();
