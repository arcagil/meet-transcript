(function() {
    // Constants
    const TRIGGER_NAMES = ['igor', 'egor', 'igo', 'егор'];  // Including Russian variation
    const ALERT_DURATION_MS = 30000; // 30 seconds

    // Create a policy for TrustedHTML
    const policy = trustedTypes.createPolicy('transcriptPolicy', {
        createHTML: (string) => string
    });
    
    // Create and style the sidebar container
    var sidebar = document.createElement('div');
    sidebar.id = 'live-transcript-sidebar';
    Object.assign(sidebar.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '300px',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderLeft: '1px solid #ccc',
        padding: '10px',
        overflowY: 'auto',
        zIndex: '10000',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        lineHeight: '1.4',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        userSelect: 'text',
        cursor: 'text'
    });

    // Add the header to the sidebar
    var header = document.createElement('div');
    Object.assign(header.style, {
        position: 'sticky',
        top: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid #ccc',
        marginBottom: '10px',
        paddingBottom: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none'  // Prevent header text selection
    });
    
    // Add title text
    var titleText = document.createElement('span');
    titleText.textContent = 'Live Transcript';
    header.appendChild(titleText);
    
    // Add trash button
    var trashButton = document.createElement('button');
    Object.assign(trashButton.style, {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '5px',
        color: '#666',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    // Use trusted HTML for the trash icon
    trashButton.innerHTML = policy.createHTML('🗑️');
    trashButton.title = 'Clear transcript';
    
    trashButton.onmouseover = function() {
        trashButton.style.color = '#d32f2f';
    };
    
    trashButton.onmouseout = function() {
        trashButton.style.color = '#666';
    };
    
    trashButton.onclick = function() {
        window.TRANSCRIPT.messages = [];
        window.TRANSCRIPT.currentMessage = '';
        window.TRANSCRIPT.currentSpeaker = '';
        window.TRANSCRIPT.lastUpdateTime = null;
        
        // Clear all timeouts
        window.TRANSCRIPT.alertTimeouts.forEach(timeout => clearTimeout(timeout));
        window.TRANSCRIPT.alertTimeouts.clear();
        window.TRANSCRIPT.pendingMessages.clear();
        
        // Clear the content
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }
    };
    
    header.appendChild(trashButton);
    sidebar.appendChild(header);

    // Add the transcript content container
    var content = document.createElement('div');
    content.id = 'transcript-content';
    sidebar.appendChild(content);

    // Add the sidebar to the page
    document.body.appendChild(sidebar);

    // Initialize transcript state
    window.TRANSCRIPT = {
        currentSpeaker: '',
        currentMessage: '',
        messages: [],
        lastUpdateTime: null,
        alertTimeouts: new Map(), // Store timeouts for clearing alerts
        pendingMessages: new Map() // Store messages that are waiting to be displayed
    };

    // Function to format time as HH:MM
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Function to find and log captions
    function monitorCaptions() {
        // Find all message containers
        const messageContainers = document.querySelectorAll('.nMcdL.bj4p3b');
        
        messageContainers.forEach(container => {
            // Get speaker name from the container
            const speakerElement = container.querySelector('.KcIKyf.jxFHg');
            if (!speakerElement) return;
            
            const speakerName = speakerElement.textContent.trim();
            
            // Get caption text from the container
            const captionElement = container.querySelector('.bh44bd.VbkSUe');
            if (!captionElement) return;
            
            // Combine text from all spans
            const textSpans = captionElement.querySelectorAll('span');
            if (!textSpans.length) return;
            
            const text = Array.from(textSpans)
                .map(span => span.textContent.trim())
                .join('')
                .trim();
                
            if (!text) return;
            
            const currentTime = new Date();
            const timestamp = formatTime(currentTime);
            
            // Check for trigger words
            const lowerText = text.toLowerCase();
            const containsTrigger = TRIGGER_NAMES.some(name => 
                lowerText.includes(name.toLowerCase())
            );

            // Find recent message from same speaker
            const recentMessages = window.TRANSCRIPT.messages.slice(-5);
            const recentMsg = recentMessages.findLast(msg => 
                msg.speaker === speakerName && 
                (currentTime - new Date(msg.fullTime)) < 2000
            );

            if (recentMsg) {
                // Only update if new message is longer and not exactly the same
                if (text.length > recentMsg.text.length && text !== recentMsg.text) {
                    recentMsg.text = text;
                    recentMsg.fullTime = currentTime;
                    if (containsTrigger) {
                        recentMsg.isAlerted = true;
                    }
                    updateDisplay();
                }
            } else {
                // Check if this exact message exists in recent history
                const exactDuplicate = recentMessages.some(msg => 
                    msg.speaker === speakerName && 
                    msg.text === text
                );

                // Only add if it's not an exact duplicate
                if (!exactDuplicate) {
                    // Add new message immediately
                    window.TRANSCRIPT.messages.push({
                        speaker: speakerName,
                        text: text,
                        time: timestamp,
                        fullTime: currentTime,
                        isAlerted: containsTrigger
                    });
                    
                    // Keep only last 100 messages
                    if (window.TRANSCRIPT.messages.length > 100) {
                        window.TRANSCRIPT.messages = window.TRANSCRIPT.messages.slice(-100);
                    }
                    
                    updateDisplay();
                }
            }
        });
    }

    // Function to update the display
    function updateDisplay() {
        if (window.TRANSCRIPT.messages.length > 0) {
            const existingMessages = content.querySelectorAll('.transcript-message');
            const currentMessageCount = existingMessages.length;
            
            let lastSpeaker = null;
            let lastTimestamp = null;
            
            // Update display with messages
            window.TRANSCRIPT.messages.forEach((msg, index) => {
                let messageDiv;
                
                if (index < currentMessageCount) {
                    // Update existing message div
                    messageDiv = existingMessages[index];
                } else {
                    // Create new message div
                    messageDiv = document.createElement('div');
                    messageDiv.className = 'transcript-message';
                    messageDiv.style.marginBottom = '8px';
                    messageDiv.style.cursor = 'text';
                    content.appendChild(messageDiv);
                }
                
                // Update message content
                if (lastSpeaker !== msg.speaker || lastTimestamp !== msg.time) {
                    // Update or create metadata and text spans
                    let metadataSpan = messageDiv.querySelector('.message-metadata');
                    let textSpan = messageDiv.querySelector('.message-text');
                    
                    if (!metadataSpan) {
                        metadataSpan = document.createElement('span');
                        metadataSpan.className = 'message-metadata';
                        metadataSpan.style.color = '#666';
                        messageDiv.appendChild(metadataSpan);
                    }
                    
                    if (!textSpan) {
                        textSpan = document.createElement('span');
                        textSpan.className = 'message-text';
                        messageDiv.appendChild(textSpan);
                    }
                    
                    metadataSpan.textContent = `[${msg.time}] [${msg.speaker}]: `;
                    textSpan.textContent = msg.text;
                    messageDiv.style.paddingLeft = '0';
                    
                    lastSpeaker = msg.speaker;
                    lastTimestamp = msg.time;
                } else {
                    // Update continuation message
                    messageDiv.style.paddingLeft = '20px';
                    messageDiv.textContent = msg.text;
                }
                
                // Update alert styling
                if (msg.isAlerted) {
                    Object.assign(messageDiv.style, {
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        padding: '5px',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                    });
                } else {
                    Object.assign(messageDiv.style, {
                        backgroundColor: '',
                        color: '',
                        padding: messageDiv.style.paddingLeft ? '0 0 0 20px' : '0',
                        borderRadius: '',
                        fontWeight: ''
                    });
                }
            });
            
            // Remove any extra message divs
            while (content.children.length > window.TRANSCRIPT.messages.length) {
                content.removeChild(content.lastChild);
            }
            
            // Auto-scroll to bottom
            sidebar.scrollTop = sidebar.scrollHeight;
        }
    }

    // Add minimize/maximize button
    var toggleButton = document.createElement('button');
    Object.assign(toggleButton.style, {
        position: 'fixed',
        right: '310px',
        top: '10px',
        zIndex: '10000',
        padding: '5px 10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '3px',
        cursor: 'pointer',
        userSelect: 'none'  // Prevent button text selection
    });
    toggleButton.textContent = '<<';
    
    let isMinimized = false;
    toggleButton.onclick = function() {
        if (isMinimized) {
            sidebar.style.right = '0';
            toggleButton.style.right = '310px';
            toggleButton.textContent = '<<';
        } else {
            sidebar.style.right = '-290px';
            toggleButton.style.right = '20px';
            toggleButton.textContent = '>>';
        }
        isMinimized = !isMinimized;
    };
    document.body.appendChild(toggleButton);

    // Start monitoring captions every 200ms for more responsive updates
    setInterval(monitorCaptions, 200);

    // Log initialization
    console.clear();
    console.log('Live transcript sidebar initialized.');
})();
