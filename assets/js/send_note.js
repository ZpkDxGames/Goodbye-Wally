const WEBHOOK_URL = "https://discord.com/api/webhooks/1446295261549690971/WG3J1OcGB58ahnaEBBn7JkM6kCZEmCAWkGvkCkbPs6zAQIe-aiUrWmT0nOvssTC2S9NY"; // Paste your Discord Webhook URL here

document.getElementById('note-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const statusDiv = document.getElementById('status-message');
    const submitBtn = this.querySelector('.submit-btn');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
        showStatus('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (!WEBHOOK_URL) {
        showStatus('Erro de configuração: URL do Webhook não definida.', 'error');
        console.error('WEBHOOK_URL is missing in send_note.js');
        return;
    }

    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const payload = {
        username: name,
        content: message
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 204) {
            showStatus('Mensagem enviada com sucesso!', 'success');
            // nameInput.value = ''; // Don't clear the locked name
            messageInput.value = '';
        } else {
            throw new Error(`Erro: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showStatus('Falha ao enviar mensagem. Tente novamente.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensagem';
    }

    function showStatus(text, type) {
        statusDiv.textContent = text;
        statusDiv.className = 'status-message'; // Reset classes
        statusDiv.classList.add(type === 'success' ? 'status-success' : 'status-error');
        statusDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
});
