import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="voice-input"
export default class extends Controller {
  static targets = ["input", "startButton"];

    /**
   * Connects the controller to the DOM and initializes the speech recognition.
   *
   * @returns {void}
   */
  connect() {
      console.log("VoiceInputController connected");
      this.speechRecognition = this.getSpeechRecognition();
      this.speaking = false;
  }

    /**
   * Retrieves a new instance of the SpeechRecognition object.
   *
   * @returns {SpeechRecognition} A new instance of the SpeechRecognition object.
   */
  getSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          console.error("Speech recognition not supported in this browser");
          return null;
      }
      const speechRecognition = new SpeechRecognition();
      this.setupSpeechRecognitionProperties(speechRecognition);
      this.setupSpeechRecognitionCallbacks(speechRecognition);
      return speechRecognition;
  }

    /**
   * Sets up the properties for the speech recognition instance.
   *
   * @param {SpeechRecognition} speechRecognition - The speech recognition instance.
   * @returns {void}
   */
  setupSpeechRecognitionProperties(speechRecognition) {
    // Set continuous to true to receive continuous results
    speechRecognition.continuous = true;

    // Set interimResults to true to receive interim results (partial results)
    speechRecognition.interimResults = true;

    // Set the language to English (US)
    speechRecognition.lang = "en-US";
  }

    /**
   * Sets up the callbacks for the speech recognition instance.
   *
   * @param {SpeechRecognition} speechRecognition - The speech recognition instance.
   * @returns {void}
   */
  setupSpeechRecognitionCallbacks(speechRecognition) {
      // Set the callback for when the recording starts
      speechRecognition.onstart = () => console.log("Recording started...");

      // Set the callback for when an error occurs during recording
      speechRecognition.onerror = (event) => this.handleSpeechRecognitionError(event);

      // Set the callback for when the recording stops
      speechRecognition.onend = () => console.log("Recording stopped...");

      // Set the callback for when a result is received during continuous recording
      speechRecognition.onresult = (event) => this.handleSpeechRecognitionResult(event);
  }

    /**
   * Handles an error that occurred during the speech recognition process.
   *
   * @param {SpeechRecognitionEvent} event - The event object containing information about the error.
   */
  handleSpeechRecognitionError(event) {
      console.error("Speech recognition error:", event.error);
      this.stopRecording();
  }

    /**
   * Handles an event when a result is received during continuous recording.
   *
   * @param {SpeechRecognitionEvent} event - The event object containing information about the result.
   */
  handleSpeechRecognitionResult(event) {
      const {finalTranscript, interimTranscript } = this.extractTranscripts(event);
      this.updateInputValue(finalTranscript, interimTranscript);
  }

    /**
   * Extracts final and interim transcripts from the SpeechRecognitionEvent.
   *
   * @param {SpeechRecognitionEvent} event - The event object containing the recognition results.
   * @returns {Object} An object containing the final and interim transcripts.
   */
  extractTranscripts(event){
      let final_transcript = "";
      let interim_transcript = "";

      // Loop through the recognition results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // Check if the result is final
        if (event.results[i].isFinal){
          // Append the transcript to the final transcript
          final_transcript += event.results[i][0].transcript;
        } else {
          // Append the transcript to the interim transcript
          interim_transcript += event.results[i][0].transcript;
        }
      }

      // Return the final and interim transcripts as an object
      return {
        finalTranscript: final_transcript,
        interimTranscript: interim_transcript,
      };
    }

      /**
   * Updates the input value with the final and interim transcripts.
   *
   * @param {string} finalTranscript - The final transcript received from the speech recognition process.
   * @param {string} interimTranscript - The interim transcript received from the speech recognition process.
   * @returns {void} - No return value.
   */
  updateInputValue(finalTranscript, interimTranscript){
    const input = this.inputTarget;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    const currentValue = input.value;
    const beforeSelection = currentValue.substring(0, selectionStart);
    const afterSelection = currentValue.substring(selectionEnd);

    const updatedValue = beforeSelection + finalTranscript + afterSelection;
    input.value = updatedValue;
    input.selectionStart = input.selectionEnd = selectionStart + finalTranscript.length;

    const updatedSelectionStart = selectionStart + finalTranscript.length;
    const updatedSelectionEnd = updatedSelectionStart + interimTranscript.length;
    input.setSelectionRange(updatedSelectionStart, updatedSelectionEnd);
  }


  record(){
    if (!this.speechRecognition){
      console.error("Speech recognition is not available");
      return;
    }

    const startButton = this.startButtonTarget;
    if(this.speaking){
      this.stopRecording();
      startButton.textContent = "Start Voice Input";
    } else {
      this.startRecording();
      startButton.textContent = "Stop Voice Input";
    }
  }

    /**
   * Stops the recording and sets the speaking flag to false.
   *
   * @returns {void}
   */
  stopRecording() {
      this.speechRecognition.stop();
      this.speaking = false;
      console.log("Stop recording");
  }

    /**
   * Starts the recording process.
   *
   * @returns {void}
   */
  startRecording() {
      this.speechRecognition.start();
      this.speaking = true;
      console.log("Start recording");
  }

}


