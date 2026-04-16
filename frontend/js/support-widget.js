/**
 * SUPPORT-WIDGET.JS
 * Real-time institutional support link for Neo-Zenith Students
 */

(function() {
  const user = getUser();
  if (!user || user.role !== 'student') return;

  // Append widget HTML
  const widgetHtml = `
    <div class="support-widget" id="supportWidget">
      <button class="support-trigger" id="supportTrigger" title="Institutional Support">
        <i class="fa fa-comments"></i>
      </button>
      <div class="support-panel" id="supportPanel">
        <div class="support-header">
          <div class="support-title">Faculty Support Channel</div>
          <button class="support-close" id="supportClose"><i class="fa fa-xmark"></i></button>
        </div>
        <div class="support-chat" id="studentChatMessages"></div>
        <div class="support-input-area">
          <input type="text" id="studentChatInput" placeholder="How can we assist you?" />
          <button id="sendStudentMsg"><i class="fa fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  const panel = document.getElementById('supportPanel');
  const trigger = document.getElementById('supportTrigger');
  const close = document.getElementById('supportClose');
  const input = document.getElementById('studentChatInput');
  const sendBtn = document.getElementById('sendStudentMsg');
  const msgContainer = document.getElementById('studentChatMessages');

  trigger.onclick = () => {
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
      loadHistory();
      startPolling();
    } else {
      stopPolling();
    }
  };

  close.onclick = () => {
    panel.classList.remove('active');
    stopPolling();
  };

  sendBtn.onclick = sendMessage;
  input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

  let pollTimer = null;

  async function sendMessage() {
    const content = input.value.trim();
    if (!content) return;
    try {
      // Use 'admin' alias to automatically route to the correct admin ID
      await apiCall('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ receiverId: 'admin', content })
      });
      input.value = '';
      loadHistory();
    } catch (err) {
      console.error('Signal lost:', err);
    }
  }

  async function loadHistory() {
    try {
      const res = await apiCall('/chat/history/admin');
      if (res.success) {
        if (!res.data.length) {
          msgContainer.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-state-icon">📡</div><div style="font-size:12px">Secure channel active. Awaiting your transmission.</div></div>';
          return;
        }
        msgContainer.innerHTML = res.data.map(m => `
          <div class="chat-msg ${m.sender_id === user.id ? 'me' : 'them'}">
            <div class="chat-bubble">${m.content}</div>
          </div>
        `).join('');
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(loadHistory, 4000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
  }
})();
