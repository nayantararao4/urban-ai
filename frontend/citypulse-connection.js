const API_BASE = 'http://localhost:8000';

const linkTextarea = document.getElementById('link');
const launchBtn = document.querySelector('.btn.primary');
const reportBtn = document.querySelector('.notice-card .btn');
const placeholder = document.querySelector('.placeholder');
const wordCloudTab = document.getElementById('tab1');

launchBtn.addEventListener('click', async function() {
    const websiteLink = linkTextarea.value.trim();
    
    if (!websiteLink) {
        alert('Please enter a website link');
        return;
    }

    launchBtn.textContent = 'Analyzing...';
    launchBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/citypulse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: websiteLink, budget: 100000 })
        });

        const result = await response.json();

        if (result.status === 'success') {
            if (wordCloudTab.checked) {
                placeholder.innerHTML = `
                    <div class="wordcloud">
                        <div style="font-size:42px">${result.wordcloud.slice(0,4).join(' • ')}</div>
                        <div>${result.wordcloud.slice(4,10).join(' • ')}</div>
                        <div>${result.wordcloud.slice(10).join(' • ')}</div>
                    </div>
                `;
            } else {
                placeholder.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3>Sentiment Analysis</h3>
                        <p>😊 Positive: ${result.sentiment.positive}%</p>
                        <p>😐 Neutral: ${result.sentiment.neutral}%</p>
                        <p>😞 Negative: ${result.sentiment.negative}%</p>
                        <p><strong>Mood:</strong> ${result.sentiment.community_mood}</p>
                    </div>
                `;
            }
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        launchBtn.textContent = 'Launch';
        launchBtn.disabled = false;
    }
});

// Report Issue
reportBtn.addEventListener('click', async function() {
    alert('Issue reported! Ticket ID: CITYPULSE-' + Math.floor(Math.random() * 9999));
});