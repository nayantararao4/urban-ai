// Zoner Frontend-Backend Connection JavaScript
// Save this as: zoner-connection.js

const API_BASE = 'http://localhost:8000';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeZoner();
});

function initializeZoner() {
    // DOM elements with safer selection
    const loadDocBtn = document.querySelector('.btn.primary');
    const reportBtn = document.querySelector('.notice-card .btn:last-child');
    const regenerateBtn = document.querySelector('.notice-card .btn:not(:last-child)');
    const queryTextarea = document.getElementById('q');
    const responseTextarea = document.getElementById('resp');
    const uploadInput = document.getElementById('upload');
    const docTypeSelect = document.getElementById('dtype');
    const docInfoTextarea = document.getElementById('dinfo');
    const responseBadge = document.querySelector('.badge');
    const noticeCard = document.querySelector('.notice-card');
    const termsCheckbox = document.getElementById('terms2');

    // Check if elements exist
    if (!loadDocBtn || !queryTextarea || !responseTextarea) {
        console.error('Required DOM elements not found. Make sure your HTML IDs match.');
        return;
    }

    let currentDocumentLoaded = false;
    let currentQuery = '';

    // Load Document
    loadDocBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const uploadPath = uploadInput?.value || '';
        const docType = docTypeSelect?.value || 'Zoning By-law';
        const docInfo = docInfoTextarea?.value || '';
        const termsAccepted = termsCheckbox?.checked || false;

        // Validation
        if (docType === 'Select') {
            alert('Please select a document type');
            return;
        }

        if (!docInfo.trim()) {
            alert('Please provide document information');
            return;
        }

        if (!termsAccepted) {
            alert('Please accept the terms and conditions');
            return;
        }

        // Show loading
        loadDocBtn.textContent = 'Loading Document...';
        loadDocBtn.disabled = true;

        try {
            console.log('Making request to:', `${API_BASE}/zoner/load-document`);
            
            const response = await fetch(`${API_BASE}/zoner/load-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    document_type: docType,
                    document_info: docInfo,
                    upload_path: uploadPath
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Response data:', result);

            if (result.status === 'success') {
                currentDocumentLoaded = true;
                
                // Show success message in response area
                responseTextarea.value = `✅ DOCUMENT LOADED SUCCESSFULLY\n\n` +
                    `📄 Type: ${result.document_type}\n` +
                    `📝 Info: ${result.document_info}\n` +
                    `📊 Pages: ${result.total_pages}\n` +
                    `⚡ Status: ${result.processing_status}\n\n` +
                    `📋 Summary: ${result.document_summary}\n\n` +
                    `🔑 Key Sections Available:\n` +
                    result.key_sections.map(section => `• ${section}`).join('\n') + 
                    `\n\n💡 You can now ask questions about this document!`;

                // Update UI state
                loadDocBtn.textContent = '✅ Document Loaded';
                loadDocBtn.style.backgroundColor = '#4CAF50';
                queryTextarea.placeholder = 'Ask questions about the loaded document...';
                
                // Enable query functionality
                enableQueryMode();

                if (responseBadge) {
                    responseBadge.textContent = '✅ Document Ready';
                    responseBadge.style.backgroundColor = '#4CAF50';
                }

            } else {
                throw new Error(result.error || 'Failed to load document');
            }

        } catch (error) {
            console.error('Load document error:', error);
            alert('Error loading document: ' + error.message);
            responseTextarea.value = '❌ Failed to load document. Please try again.\nError: ' + error.message;
        } finally {
            if (!currentDocumentLoaded) {
                loadDocBtn.textContent = 'Load Document';
                loadDocBtn.disabled = false;
            }
        }
    });

    // Enable query mode after document is loaded
    function enableQueryMode() {
        // Remove existing listeners to prevent duplicates
        queryTextarea.removeEventListener('input', handleQueryInput);
        queryTextarea.removeEventListener('keypress', handleQuerySubmit);
        
        queryTextarea.addEventListener('input', handleQueryInput);
        queryTextarea.addEventListener('keypress', handleQuerySubmit);
    }

    // Handle query input
    function handleQueryInput() {
        if (queryTextarea.value.trim() && currentDocumentLoaded) {
            // Auto-submit after user stops typing for 2 seconds
            clearTimeout(window.queryTimeout);
            window.queryTimeout = setTimeout(() => {
                submitQuery();
            }, 2000);
        }
    }

    // Handle Enter key for immediate query
    function handleQuerySubmit(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            clearTimeout(window.queryTimeout);
            submitQuery();
        }
    }

    // Submit query to backend
    async function submitQuery() {
        const query = queryTextarea.value.trim();
        
        if (!query || !currentDocumentLoaded) return;
        
        currentQuery = query;
        responseTextarea.value = '🔍 Analyzing document and generating response...';
        
        try {
            console.log('Making query request to:', `${API_BASE}/zoner/query`);
            
            const response = await fetch(`${API_BASE}/zoner/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    document_type: docTypeSelect?.value || 'Zoning By-law',
                    document_info: docInfoTextarea?.value || ''
                })
            });

            console.log('Query response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Query response data:', result);

            if (result.status === 'success') {
                // Display comprehensive response
                responseTextarea.value = `🎯 QUERY: ${result.query}\n\n` +
                    `📋 ANALYSIS:\n${result.response}\n\n` +
                    `📊 Confidence: ${result.confidence_score}%\n\n` +
                    `📚 Relevant Sections:\n${result.relevant_sections.map(s => `• ${s}`).join('\n')}\n\n` +
                    `📖 Citations:\n${result.citations.map(c => `• ${c}`).join('\n')}`;

                // Show response generated notice
                if (responseBadge) {
                    responseBadge.textContent = '✅ Response Generated';
                    responseBadge.style.backgroundColor = '#4CAF50';
                }
                
                if (noticeCard) {
                    const noticeText = noticeCard.querySelector('p');
                    if (noticeText) {
                        noticeText.textContent = 'Response ready! Use regenerate for alternative analysis.';
                    }
                }

            } else {
                throw new Error(result.error || 'Failed to process query');
            }

        } catch (error) {
            console.error('Query error:', error);
            responseTextarea.value = `❌ Error processing query: ${error.message}`;
            if (responseBadge) {
                responseBadge.textContent = '❌ Query Failed';
                responseBadge.style.backgroundColor = '#f44336';
            }
        }
    }

    // Regenerate Response
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!currentQuery || !currentDocumentLoaded) {
                alert('Please load a document and ask a question first');
                return;
            }

            regenerateBtn.textContent = 'Regenerating...';
            regenerateBtn.disabled = true;
            responseTextarea.value = '🔄 Regenerating alternative response...';

            try {
                console.log('Making regenerate request to:', `${API_BASE}/zoner/regenerate`);
                
                const response = await fetch(`${API_BASE}/zoner/regenerate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        query: currentQuery,
                        document_type: docTypeSelect?.value || 'Zoning By-law',
                        document_info: docInfoTextarea?.value || ''
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'success') {
                    responseTextarea.value = `🎯 QUERY: ${result.query}\n\n` +
                        `🔄 REGENERATED ANALYSIS:\n${result.response}\n\n` +
                        `📊 Confidence: ${result.confidence_score}%\n\n` +
                        `📚 Relevant Sections:\n${result.relevant_sections.map(s => `• ${s}`).join('\n')}\n\n` +
                        `📖 Citations:\n${result.citations.map(c => `• ${c}`).join('\n')}`;

                    if (responseBadge) {
                        responseBadge.textContent = '🔄 Response Regenerated';
                        responseBadge.style.backgroundColor = '#2196F3';
                    }
                }

            } catch (error) {
                console.error('Regenerate error:', error);
                responseTextarea.value = `❌ Error regenerating: ${error.message}`;
            } finally {
                regenerateBtn.textContent = 'Regenerate';
                regenerateBtn.disabled = false;
            }
        });
    }

    // Report Issue
    if (reportBtn) {
        reportBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            reportBtn.textContent = 'Reporting...';
            reportBtn.disabled = true;

            try {
                console.log('Making report request to:', `${API_BASE}/zoner/report-issue`);
                
                const response = await fetch(`${API_BASE}/zoner/report-issue`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'success') {
                    alert(`✅ Issue reported! Ticket ID: ${result.ticket_id}`);
                }
                
            } catch (error) {
                console.error('Report error:', error);
                alert('❌ Error reporting issue: ' + error.message);
            } finally {
                reportBtn.textContent = 'Report';
                reportBtn.disabled = false;
            }
        });
    }
}

// Test function - call this in browser console to test
function testZonerConnection() {
    fetch('http://localhost:8000/test/zoner')
        .then(response => response.json())
        .then(data => {
            console.log('Zoner test successful:', data);
            alert('✅ Zoner backend connection test passed!');
        })
        .catch(error => {
            console.error('Zoner test failed:', error);
            alert('❌ Zoner backend connection test failed: ' + error.message);
        });
}