// Check for Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Sorry, your browser does not support the Web Speech API. Try using Google Chrome or Microsoft Edge.");
} else {
  const recognition = new SpeechRecognition();

  // Configure SpeechRecognition settings
  recognition.continuous = false; // Stop listening automatically after user finishes speaking
  recognition.lang = 'en-US';    // Set language
  recognition.interimResults = false; // Send only final recognition results

  // DOM Elements
  const startBtn = document.getElementById('start-btn');
  const statusText = document.getElementById('status');
  const transcriptOutput = document.getElementById('transcript-output');
  const actionOutput = document.getElementById('action-output');

  // Toggle voice recognition on button click
  startBtn.addEventListener('click', () => {
    if (startBtn.classList.contains('listening')) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  // Event: Speech recognition starts
  recognition.onstart = () => {
    startBtn.classList.add('listening');
    statusText.textContent = "Listening...";
    transcriptOutput.textContent = "...";
    actionOutput.textContent = "Waiting for complete command...";
  };

  // Event: Speech recognition stops
  recognition.onend = () => {
    startBtn.classList.remove('listening');
    statusText.textContent = "Click to speak";
  };

  // Event: Speech recognized successfully
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    transcriptOutput.textContent = `"${event.results[0][0].transcript}"`;
    
    // Process command and decide how to proceed
    processCommand(transcript);
  };

  // Event: Error handling
  recognition.onerror = (event) => {
    statusText.textContent = "Error occurred";
    actionOutput.textContent = `Error: ${event.error}`;
  };

  /**
   * Main logic to proceed based on the user's speech input
   */
  function processCommand(command) {
    let responseText = "";

    // Example 1: Navigation / External Link
    if (command.includes('open google')) {
      responseText = "Opening Google...";
      window.open('https://www.google.com', '_blank');
    } 
    else if (command.includes('open youtube')) {
      responseText = "Opening YouTube...";
      window.open('https://www.youtube.com', '_blank');
    }
    // Example 2: Interactive UI Action
    else if (command.includes('change background to')) {
      const color = command.replace('change background to', '').trim();
      document.body.style.backgroundColor = color;
      responseText = `Background color changed to ${color}.`;
    }
    // Example 3: Dynamic Data Response
    else if (command.includes('time')) {
      const currentTime = new Date().toLocaleTimeString();
      responseText = `The current time is ${currentTime}.`;
    } 
    else if (command.includes('date')) {
      const currentDate = new Date().toLocaleDateString();
      responseText = `Today's date is ${currentDate}.`;
    }
    // Default / Unknown command fallback
    else {
      responseText = `Command not recognized. Searching Google for "${command}"...`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`, '_blank');
    }

    // Output status and optional Text-To-Speech (audio feedback)
    actionOutput.textContent = responseText;
    speakResponse(responseText);
  }

  /**
   * Optional: Text-To-Speech to make the app speak back to the user
   */
  function speakResponse(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }
}