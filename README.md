# JVQUIZ (burricat) 🐱✨

JVQUIZ, also known as **burricat**, is a cozy, premium pixel-art themed quiz platform built with Vanilla JS. It features a personalized "Lady Bug & Cat Noir" aesthetic, supporting both **Solo Adventure** and **P2P Multiplayer Battle** modes.

![burricat Logo](logo.png)

## 🌟 Features

- **🎮 Dual Game Modes**:
  - **Solo Adventure**: Track your progress and build streaks as you study. Includes a "Recap" panel to review mistakes.
  - **Battle Match**: Host or join matches using short P2P room codes. Real-time synchronization of scores and progress.
- **💬 Interactive Chat**: Built-in chat system for multiplayer matches with:
  - **GIF Library**: Integrated Tenor GIF search (Cat-themed by default!).
  - **Voice Memos**: Record and send voice messages directly in the chat.
- **🎨 Dynamic Themes**: Toggle between the "Secret/Cute" pixel-art theme and a "Plain/Stealth" theme for serious study sessions.
- **📥 Easy Content Loading**: Drag and drop JSON files or paste raw JSON text to load your quiz questions instantly.
- **✨ Rich Visuals**: Animated stickers, heart trails, confetti effects, and floating particles that make learning feel like a game.
- **🎵 Retro Boombox**: Integrated music player with a curated playlist and volume controls.
- **💌 Personalized Touches**: Includes hidden interactive elements like the "Kyla" sticker and a secret appreciation letter.

## 🛠️ Technology Stack

- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Networking**: [PeerJS](https://peerjs.com/) for Peer-to-Peer multiplayer connectivity.
- **APIs**: [Tenor API](https://tenor.com/gif-api) for GIF search and delivery.
- **Fonts**: Google Fonts (Caveat, VT323).
- **Styling**: Pixel-art aesthetics with custom HSL palettes and glassmorphism.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/JVQUIZ.git
   ```
2. **Open `index.html`**: Simply open the `index.html` file in any modern web browser. No server setup is required thanks to P2P technology!
3. **Load Questions**: 
   - Drag and drop a `.json` file into the "Host" or "Solo" lobby.
   - Or paste your JSON directly into the text area.

## 📋 Question Format Guide

The app supports three main types of questions. Your JSON file should follow this structure:

```json
[
  {
    "type": "mcq",
    "question": "What is the capital of France?",
    "choices": ["Berlin", "Madrid", "Paris", "Rome"],
    "answer": "Paris"
  },
  {
    "type": "identification",
    "question": "What is the Tagalog word for 'Dead'?",
    "answer": "Patay"
  },
  {
    "type": "assertion-reason",
    "assertion": "The Earth is round.",
    "reason": "Gravity pulls everything towards the center.",
    "answer": "A"
  }
]
```

### Supported Types:
1. **`mcq`**: Multiple Choice. Provide an array of `choices` and the exact `answer` string.
2. **`identification`**: Fill-in-the-blank. The user must type the answer.
3. **`assertion-reason`**: Special academic format. Provide `assertion` and `reason`. The answer should be "A", "B", "C", or "D".

---

# 🤖 AI Prompt Guide (Reviewer to JSON)

When using an AI (like Gemini, ChatGPT, or Claude) to convert your reviewers or notes into the correct format for **burricat**, use the following prompt to ensure 100% compatibility:

### 📝 The Prompt
> "I want you to act as a quiz generator. I will provide you with a reviewer or a set of notes. Please convert the information into a JSON array of questions compatible with my app. 
> 
> **Strict Rules:**
> 1. Use the following types: 'mcq' (multiple choice), 'identification' (single word/phrase), or 'assertion-reason'.
> 2. For 'mcq', provide exactly 4 choices in an array and the 'answer' field must exactly match one of the choices.
> 3. For 'identification', ensure the answer is concise.
> 4. For 'assertion-reason', follow this logic:
>    - A: Both A and R are true and R explains A.
>    - B: Both A and R are true but R does not explain A.
>    - C: A is true but R is false.
>    - D: A is false but R is true.
> 5. Output ONLY the JSON array. Do not include markdown code blocks or explanations.
> 
> Here is the reviewer text:
> [PASTE YOUR TEXT HERE]"

---

## 📄 License

This project is open-source. Feel free to modify and adapt it for your own study needs! 🎀
