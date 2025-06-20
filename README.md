# Automated Video Generator

This project creates marketing videos by combining OpenAI for script and image generation with ElevenLabs for speech synthesis. Images and audio are assembled into a final MP4 using MoviePy and FFmpeg.

## Requirements

- Node.js 18 or newer
- Python 3.8 or newer
- FFmpeg installed and available in your `PATH`

## Installation

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Create a Python virtual environment and install packages:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and provide your API keys.

### Environment variables

- `OPENAI_API_KEY` – OpenAI API key used for text and image generation.
- `ELEVENLABS_API_KEY` – ElevenLabs API key for text‑to‑speech.
- `BASE_URL` – Base URL where the app is served (e.g. `http://localhost:3000`).

## Running the development server

Start the Next.js dev server:
```bash
npm run dev
```
Then open `http://localhost:3000` in your browser.

## Generating videos

1. Use the web interface to generate voice‑over scripts from a marketing prompt.
2. Upload an image to create styled variations via DALL·E.
3. Select the desired voice and images, then click **Generate Video**. The resulting MP4 files are saved under `public/output`.

