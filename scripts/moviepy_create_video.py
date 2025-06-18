#!/usr/bin/env python
"""
Create a slideshow‑style video from still images, with optional intro/outro
cards, a voice‑over track, and (quieter) background music.
"""
import argparse
from moviepy import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    CompositeAudioClip,
)

# ────────────────────────────── CLI ──────────────────────────────
parser = argparse.ArgumentParser(
    description="Create video from images + optional intro/outro + audio/music"
)
parser.add_argument("--audio", help="voice‑over audio file (drives timing if given)")
parser.add_argument(
    "--music", help="background music file (will be mixed under the voice‑over)"
)
parser.add_argument(
    "--music-volume",
    type=float,
    default=0.10,
    help="linear gain to apply to background music (default 0.10 = −20 dB)",
)
parser.add_argument("--intro", help="PNG for intro card (fixed 2 s)")
parser.add_argument("--outro", help="PNG for outro card (fixed 2 s)")
parser.add_argument(
    "--duration",
    type=float,
    default=3,
    help=(
        "Total seconds to divide equally among main images "
        "(ignored if --audio is supplied)"
    ),
)
parser.add_argument("--fps", type=int, default=24, help="frames per second")
parser.add_argument("--output", required=True, help="output video path (e.g. out.mp4)")
parser.add_argument("images", nargs="+", help="main image files (PNG, JPG, …)")
args = parser.parse_args()

# ────────────────────────────── Constants ────────────────────────
INTRO_DURATION = 2.0
OUTRO_DURATION = 2.0
num_images = len(args.images)
if num_images == 0:
    raise ValueError("You must provide at least one main image.")

# ──────────────────────────── Timing logic ───────────────────────
if args.audio:  # use voice‑over length
    vo_clip = AudioFileClip(args.audio)
    total_time = vo_clip.duration
    remaining_time = max(total_time - INTRO_DURATION - OUTRO_DURATION, 0)
    image_duration = remaining_time / num_images
else:  # fall back to explicit --duration
    total_time = INTRO_DURATION + OUTRO_DURATION + args.duration
    image_duration = args.duration / num_images
    vo_clip = None  # may be added later

# ─────────────────────────── Build video track ───────────────────
clips = []

if args.intro:
    clips.append(ImageClip(args.intro).with_duration(INTRO_DURATION))

for img in args.images:
    clips.append(ImageClip(img).with_duration(image_duration))

if args.outro:
    clips.append(ImageClip(args.outro).with_duration(OUTRO_DURATION))

video = concatenate_videoclips(clips, method="compose")
video = video.with_fps(args.fps)

# ─────────────────────────── Audio mixing ────────────────────────
audio_tracks = []

# voice‑over always full level
if vo_clip:
    audio_tracks.append(vo_clip.with_duration(video.duration))

# background music at user‑controlled gain
if args.music:
    bgm = AudioFileClip(args.music) * args.music_volume
    bgm = bgm.with_duration(video.duration)
    audio_tracks.append(bgm)

if audio_tracks:
    final_audio = CompositeAudioClip(audio_tracks)
    video = video.with_audio(final_audio)

# ─────────────────────────── Render ──────────────────────────────
video.write_videofile(
    args.output,
    codec="libx264",
    audio_codec="aac",
    fps=args.fps,
    bitrate="4000k",
    threads=4,
)
