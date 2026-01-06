# FocusFlow: Mastering the speed of thought, not the speed of executive dysfunction.

**FocusFlow** is a bio-adaptive software ecosystem designed to eliminate cognitive exclusion by dynamically remapping the digital world to fit the human brain. The platform serves as an **“external frontal lobe,”** utilizing Azure AI and multimodal processing to transform overwhelming data into structured, high-signal intelligence in real time.

---

## 1. Problem Statement

Modern digital environments are built on **cognitive uniformity**, assuming every user possesses identical executive function capabilities.  

For individuals with **ADHD** or **dyslexia**, the digital world becomes a source of:
- “Wall of Text” anxiety  
- Auditory processing delays  
- Task paralysis  

Standard learning tools fail to address the high friction caused by constant switching between auditory, visual, and textual contexts—leading to rapid cognitive fatigue and disengagement.

---

## 2. Solution: Bio-Adaptive Orchestration

FocusFlow bridges the executive function gap through a **dual-interface system**:

### Web Workspace
A centralized hub for deep processing of static assets:
- PDFs  
- Long-form text  
- Links  
- Downloaded videos  

### Browser Extension
A real-time intervention layer for:
- Live meetings (Google Meet / Microsoft Teams)  
- Web navigation  

Provides **active recall assistance** and **visual logic mapping** on the fly.

---

## 3. Key Feature Suites

### 🔹 Intelligent Content Transformation
- Quick content summarization  
- PDFs, long texts, links, and videos transformed into:
  - **Bionic text**
  - Visual diagrams
  - Flowcharts
  - Flashcards  
- Optimized for cognitive understanding and long-term retention

---

### 🔹 Real-Time Media Intelligence (Meet Mode)

- **Live Bionic Transcription**  
  Real-time audio-to-context conversion using Azure Speech Services with Bionic anchors to prevent tracking loss.

- **Smart Nuggets**  
  AI-driven summarization prioritizing:
  - Definitions  
  - Actionable tasks  
  Using color-coded semantic tags.

- **Topic Segmentation**  
  Azure Video Indexer–powered color-coded navigation across meeting or video timelines.

- **The Shredder**  
  Converts dense transcripts and slides into structured flowcharts to visualize logic paths.

- **Visual Analysis (OCR Snipper + Chat)**  
  Azure AI Vision-powered tool that:
  - Captures slide or video regions  
  - Extracts handwriting or text  
  - Passes it to a specialized visual chatbot

- **Output Diversity**
  Export content as:
  - Bionic text  
  - Flowcharts  
  - Visual diagrams  
  - Flashcards  

---

### 🔹 Reading & Web Optimization (Reading Mode)

- **Bionic Web Engine**  
  Instantly converts any website (e.g., Wikipedia) into Bionic format.

- **Contextual Chat**  
  ADHD-friendly chatbot that:
  - Explains selected text  
  - Supports follow-up questions  
  - Adapts explanations visually and structurally

---

### 🔹 Behavioral Intelligence

- **Non-Invasive Focus Tracking**  
  Computes a real-time **Focus Score (0–100)** using:
  - Tab focus  
  - Idle thresholds  
  - Scroll behavior  
  *(No webcams, no keystrokes)*

- **AI Companion**
  - Monitors focus state  
  - Politely alerts when attention drops  
  - Triggers micro-quizzes based on current content to reinforce retention

---

## 4. Technical Architecture

FocusFlow is built on a **high-concurrency monorepo architecture**, ensuring sub-second latency for real-time AI interventions.

---

### Backend Infrastructure (`apps/web/server`)

- **Core Logic**  
  Node.js + TypeScript environment handling complex data remapping.

- **AI Processors (`/processors`)**  
  Dedicated workers for:
  - Flashcard generation  
  - Flowchart construction  
  - Bionic summarization  

- **Identity & Progress (`/controllers`)**  
  Manages:
  - User bio-preferences  
  - Study streaks  
  - Focus session analytics  

---

### Frontend Intelligence (`apps/web/client` & `apps/extensions`)

- **Dashboard (`/pages/Dashboard.tsx`)**  
  High-performance React interface using progressive disclosure to reduce cognitive overload.

- **Bionic Engine (`/components/dashboard/summaryrender.tsx`)**  
  Custom Markdown parser converting raw content into visual Bionic anchors.

- **Extension Logic (`/content/vision.js`)**  
  Handles:
  - Canvas-level OCR capture  
  - Real-time DOM manipulation for Bionic remapping  

---

### Integrated Azure Stack

| Azure Service | Role |
|--------------|------|
| **Azure Cosmos DB** | Stores user preferences, bio-adaptive settings, and session metadata |
| **Azure Blob Storage** | Durable storage for processed JSON assets and visual exports |
| **Azure AI Foundry** | Custom-tuned ADHD-optimized summarization & recall models |
| **Azure AI Vision** | Real-time OCR and image analysis |
| **Azure Video Indexer** | Multimodal topic segmentation & scene detection |
| **Azure Speech Service** | Low-latency diarization and transcription |

---

## 5. Development Roadmap & Impact

### Feasibility & Real-World Adaptability
FocusFlow integrates seamlessly into existing educational and corporate workflows.  
The browser extension enables **zero platform modification**, working instantly with:
- Google Meet  
- YouTube  
- Internal LMS systems  

---

### Core MVP

The MVP delivers immediate value through:
- Live audio-to-text transcription with ADHD-friendly formatting  
- Bionic summarization for text, links, and PDFs  
- Rule-based **Focus State Machine**:
  - `FOCUSED`
  - `AT_RISK`
  - `LOST`  

Supportive nudges replace disruptive alerts.

---

### Future Development (V2)

- **Azure Immersive Reader Integration**  
  Enhanced accessibility and voice-assisted reading.

- **Bio-Feedback Focus Loop**  
  Optional gaze tracking (Azure Vision) to pause sessions during focus gaps.

- **Study Companion Agent**
  - Proactively suggests breaks  
  - Detects erratic mouse movement or digital “fidgeting” patterns  

---

### Impact

- **Educational**  
  Reduces *Time-to-Understanding* for neurodivergent learners.

- **Social**  
  Promotes cognitive equity in remote education and workspaces.

- **Privacy**  
  Privacy-first design with local bio-data processing for high-trust adoption.

---

## 6. Deployment & Setup

### Prerequisites
- Node.js v18+  
- Azure Subscription (Cosmos DB, Blob Storage, AI Services)  
- Gemini 1.5 Pro / Flash API Key (via Azure AI Foundry)  

---

### Environment Setup

1. Clone the repository  
2. Configure `.env` files in:
   - `apps/web/server`
   - `apps/extensions/backend`
3. Run `npm install` at the monorepo root  
4. Launch locally using:
   ```bash
   docker-compose up
   ```


<div align="center">

### **FocusFlow © 2026**

*Remapping the digital world for the human brain.*

</div>

