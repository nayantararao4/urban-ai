// PlanIt Frontend-Backend Connection JavaScript
// Save this as: planit-connection.js

const API_BASE = 'http://localhost:8000';

// DOM elements
const generateBtn = document.querySelector('.btn.primary');
const reportBtn = document.querySelector('.notice-card .btn');
const arPlaceholder = document.querySelector('.placeholder');
const kpiContainer = document.querySelector('.kpi');

// Generate AR Street View
generateBtn.addEventListener('click', async function() {
    const city = document.getElementById('city').value;
    const street = document.getElementById('street').value;
    const version = document.getElementById('ver').value;
    const mode = document.getElementById('mode').value;
    const notes = document.getElementById('notes').value;
    const termsAccepted = document.getElementById('terms').checked;

    // Validation
    if (!city || !street) {
        alert('Please enter both city and street information');
        return;
    }

    if (!termsAccepted) {
        alert('Please accept the terms and conditions');
        return;
    }

    // Show loading
    generateBtn.textContent = 'Generating AR View...';
    generateBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/planit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: city,
                street: street,
                version: version,
                mode: mode,
                notes: notes
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Update AR placeholder
            arPlaceholder.innerHTML = `
                <div style="background: linear-gradient(45deg, #4CAF50, #2196F3); 
                           color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <h3>🏙️ AR Street View Generated</h3>
                    <p><strong>📍 Location:</strong> ${result.location}</p>
                    <p><strong>👁️ AR Mode:</strong> ${result.ar_mode} | <strong>📋 Version:</strong> ${result.scenario_version}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; text-align: left;">
                        <div>
                            <strong>🏢 Buildings:</strong>
                            <ul style="font-size: 12px; margin: 5px 0;">
                                ${result.ar_view_data.buildings.map(b => `<li>${b}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <strong>🌳 Green Spaces:</strong>
                            <ul style="font-size: 12px; margin: 5px 0;">
                                ${result.ar_view_data.green_spaces.map(g => `<li>${g}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <p><strong>🛡️ Safety Rating:</strong> ${result.ar_view_data.safety_rating}</p>
                    ${result.collaboration_notes ? `<p><strong>📝 Notes:</strong> ${result.collaboration_notes}</p>` : ''}
                    <small>Generated: ${new Date(result.generated_at).toLocaleString()}</small>
                </div>
            `;

            // Update street conditions in KPI
            const conditions = result.street_conditions;
            kpiContainer.innerHTML = `
                <h4>Updated 1m ago</h4>
                <div class="row"><span>Lighting</span><span>${conditions.lighting}</span></div>
                <div class="row"><span>Ped Count</span><span>${conditions.pedestrian_count}</span></div>
                <div class="row"><span>Time</span><span>${conditions.current_time}</span></div>
                <div class="row"><span>Rain</span><span>${conditions.rain_chance}</span></div>
                <div class="row"><span>Temp</span><span>${conditions.temperature}</span></div>
            `;

        } else {
            throw new Error(result.error || 'Failed to generate AR view');
        }

    } catch (error) {
        alert('Error: ' + error.message);
        arPlaceholder.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 20px;">❌ Failed to generate AR view</p>';
    } finally {
        generateBtn.textContent = 'Generate AR View';
        generateBtn.disabled = false;
    }
});

// Report Issue
reportBtn.addEventListener('click', async function() {
    reportBtn.textContent = 'Reporting...';
    reportBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/planit/report-issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(`✅ Issue reported! Ticket ID: ${result.ticket_id}`);
        }
    } catch (error) {
        alert('❌ Error reporting issue: ' + error.message);
    } finally {
        reportBtn.textContent = 'Report';
        reportBtn.disabled = false;
    }
});