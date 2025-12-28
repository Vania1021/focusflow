// Define types for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = window as any;

let recognition: any | null = null;
let transcriptBuffer: string = "";

const startRecognition = (): void => {
  if (!webkitSpeechRecognition) {
    console.error("Speech recognition not supported in this browser.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        transcriptBuffer += event.results[i][0].transcript + ". ";
      }
    }
  };

  recognition.start();
};

const summarizeText = async (text: string): Promise<string> => {
  if (text.length < 50) return "Short session: No significant data to summarize.";
  // Placeholder for AI API Call
  return `Summary: ${text.substring(0, 100)}...`;
};

// Check settings and run interval
setInterval(() => {
  chrome.storage.local.get(['enabled', 'interval'], async (data) => {
    if (data.enabled && transcriptBuffer.length > 0) {
      const summary = await summarizeText(transcriptBuffer);
      console.log("FocusFlow Summary Generated");
      alert(summary); 
      transcriptBuffer = ""; 
    }
  });
}, 60000);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    changes.enabled.newValue ? startRecognition() : recognition?.stop();
  }
});
