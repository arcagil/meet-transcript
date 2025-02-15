# Google Meet Transcript Capture

A browser extension that captures and displays live transcripts from Google Meet conversations with advanced text tracking and alert features.
![image](https://github.com/user-attachments/assets/8a5fe433-4dde-418d-ae2c-f17307a8660b)


## Features

- 🔴 Live Transcript Sidebar
  - Real-time message capture
  - Timestamp tracking
  - Speaker identification
  - Scrollable transcript view

- 📝 Message Handling
  - Immediate message display
  - Progressive caption update detection
  - Duplicate message prevention
  - Continuous speech segment handling

- 🔔 Alert System
  - Trigger word detection
  - Permanent message highlighting
  - Configurable trigger words
  - Case-insensitive matching

## Installation

### Option 1: Chrome Extension
1. Clone this repository:
```bash
git clone https://github.com/yourusername/meet-transcript.git
cd meet-transcript
```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

### Option 2: Developer Console
For quick testing or development, you can run the script directly in the browser console:

1. Join a Google Meet call
2. Open Chrome Developer Tools (F12 or Ctrl+Shift+I)
3. Copy the entire contents of `caption_monitor.js`
4. Paste into the console and press Enter
5. The transcript sidebar will appear immediately

Note: Running through the console will need to be repeated each time you refresh the page.

## Usage

1. Join a Google Meet call
2. The transcript sidebar will automatically appear on the right side of the screen
3. Messages will be captured and displayed in real-time
4. Messages containing trigger words will be highlighted
5. Use the trash icon to clear the transcript
6. Scroll through the transcript history at any time

## Configuration

### Trigger Words
Current trigger words are configured in `caption_monitor.js`:
```javascript
const TRIGGER_NAMES = ['igor', 'egor', 'igo', 'егор'];
```

Modify this array to add or remove trigger words. The matching is case-insensitive.

### Display Settings
- Messages are limited to the last 100 entries
- Messages are updated within 2 seconds of initial display
- Monitoring interval is set to 200ms for responsive updates

## Technical Details

### DOM Selectors
The extension uses the following selectors to capture captions:

Caption Text:
- '.VbkSUe'
- '.K6EKFb'
- '.bh44bd'

Speaker Names:
- '.KcIKyf.jxFHg'
- '.CNusmb'
- '.F1pOBe'

### Security Measures
- TrustedHTML policy implementation
- Safe text handling
- No direct innerHTML usage
- Sanitized user-generated content

## Known Limitations

- Dependent on Google Meet's current DOM structure
- May require updates if Meet's HTML changes
- Performance impact with frequent DOM querying

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.

Copyright (c) 2025 arcagil

You are free to:
- Use this software for any purpose
- Change the software to suit your needs
- Share the software with anyone
- Distribute commercial versions

## Support

For bugs, feature requests, or questions, please [open an issue](https://github.com/yourusername/meet-transcript/issues).
