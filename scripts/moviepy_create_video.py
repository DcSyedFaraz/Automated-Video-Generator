#!/usr/bin/env python
"""
Create a slideshow‑style video from still images, with optional intro/outro
cards, a voice‑over track, and (quieter) background music.
"""
import argparse
import math
import os
import sys
from moviepy.video.tools.subtitles import SubtitlesClip

from moviepy import (
    ImageClip,
    TextClip,
    VideoFileClip,
    afx,
    AudioFileClip,
    concatenate_videoclips,
    CompositeAudioClip,
)
import multiprocessing
from moviepy.video.fx.CrossFadeIn import CrossFadeIn
from moviepy.video.fx.Crop import Crop
from moviepy.video.VideoClip import ColorClip
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.function import create_decory_slideshow, create_decory_slideshow_with_crossfade, create_image_grid

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
parser.add_argument("--width", type=int, default=900, help="output video width")
parser.add_argument("--height", type=int, default=1600, help="output video height")
parser.add_argument(
    "--subtitles",
    help="Subtitles file (e.g. .srt) to overlay as captions",
)
parser.add_argument(
    "--transition-duration",
    type=float,
    default=1.0,
    help="crossfade duration between consecutive clips in seconds",
)
parser.add_argument(
    "--audio-volume",
    type=float,
    default=1.0,
    help="gain to apply to the voice-over audio (e.g. 1.5 = +50%)",
)
args = parser.parse_args()

# ────────────────────────────── Constants ────────────────────────
INTRO_DURATION = 3.0
OUTRO_DURATION = 2.0
num_images = len(args.images)
if num_images == 0:
    raise ValueError("You must provide at least one main image.")

# ──────────────────────────── Timing logic ───────────────────────
if args.audio:  # use voice‑over length
    vo_clip = AudioFileClip(args.audio)
    total_time = 5.0
    # total_time = vo_clip.duration
    remaining_time = max(total_time - INTRO_DURATION - OUTRO_DURATION, 0)
    image_duration = remaining_time / num_images
else:  # fall back to explicit --duration
    total_time = INTRO_DURATION + OUTRO_DURATION + args.duration
    image_duration = args.duration / num_images
    vo_clip = None  # may be added later

# ─────────────────────────── Build video track ───────────────────
clips = []

# if args.intro:
#     clips.append(VideoFileClip(args.intro).with_duration(INTRO_DURATION))
    # clips.append(ImageClip(args.intro).with_duration(INTRO_DURATION))

# for img in args.images:
#     clip = ImageClip(img, duration=image_duration).resized(height=args.height)
#     clips.append(clip)


# Create clips for each image, resized to fit the video dimensions
# grid_clip = create_image_grid(
#     images_list=args.images,  # Can be 5, 10, 15, or any number of images
#     video_width=args.width,
#     video_height=args.height,
#     duration=remaining_time,
# )
grid_clip = create_decory_slideshow(
    slideshow_images=args.images,
    static_images=[
        "D:\\projects\\video-gen\\public\\output\\img_1750339337274_1.png",
        "D:\\projects\\video-gen\\public\\output\\img_1750339337342_2.png",
        "D:\\projects\\video-gen\\public\\output\\img_1750339337350_3.png",
        "D:\\projects\\video-gen\\public\\output\\img_1750339337369_4.png",
    ],
    labels_list=["Minimal", "Futuristic", "Luxury", "Modern"],
    video_width=args.width,
    video_height=args.height,
    total_duration=5,
    # transition_duration=0.5,
)

clips.append(grid_clip)

# if args.outro:
#     clips.append(ImageClip(args.outro).with_duration(OUTRO_DURATION))

# if args.transition_duration > 0:
#     from moviepy import CompositeVideoClip

#     transition = args.transition_duration
#     xf_clips = []
#     current = 0.0
#     for idx, clip in enumerate(clips):
#         # schedule each clip at its start time
#         clip = clip.with_start(current)
#         # fade in for every clip except the very first
#         if 0 < idx < len(clips) - 1:
#             clip = CrossFadeIn(transition).apply(clip)
#         xf_clips.append(clip)
#         # advance time by clip duration minus overlap
#         overlap = transition if idx < len(clips) - 1 else 0.0
#         current += clip.duration - overlap

#     video = CompositeVideoClip(xf_clips).with_duration(current)
# else:
video = concatenate_videoclips(clips, method="compose")

video = video.with_fps(args.fps)
# video = video.resized(args.height, args.width)
# ──────────────── Overlay subtitles if provided ────────────────
if args.subtitles:
    # Function to style each subtitle line
    def make_text_clip(txt):
        return TextClip(
            text=txt,
            font_size=25,
            color="white",
            stroke_color="black",
            bg_color="black",
            stroke_width=2,
            method="caption",
            text_align="center",
            size=(args.width, None),  # Auto height based on width
            # margin=(10, 0),  # Add some margin around the text
            # ← no font=, no method=
        )

    # small bottom margin

    # Load and generate the subtitles clip
    subs = SubtitlesClip(args.subtitles, make_textclip=make_text_clip)

    # Position subtitles at the bottom of the frame
    subs = subs.with_position("center")

    # Composite subtitles over the main video
    video = CompositeVideoClip([video, subs.with_duration(video.duration)])

# ─────────────────────────── Audio mixing ────────────────────────
audio_tracks = []

# voice‑over always full level
if vo_clip:
    audio_tracks.append(vo_clip.with_duration(video.duration))

# background music at user‑controlled gain
if args.music:
    bgm = (
        AudioFileClip(args.music)
        .with_effects([afx.MultiplyVolume(args.music_volume)])
        .with_duration(video.duration)
    )
    audio_tracks.append(bgm)

if audio_tracks:
    final_audio = CompositeAudioClip(audio_tracks)
    video = video.with_audio(final_audio)

# ─────────────────────────── Render ──────────────────────────────
# video.write_videofile(
#     args.output,
#     codec="libx264",
#     preset="ultrafast",
#     audio_codec="aac",
#     fps=args.fps,
#     bitrate="4000k",
#     temp_audiofile="temp-audio.m4a",
#     remove_temp=True,
# )
video.write_videofile(
    args.output,
    codec="libx264",
    preset="ultrafast",
    audio_codec="aac",
    fps=args.fps,
    bitrate="1000k",  # Very low bitrate
    threads=0,
    temp_audiofile="temp-audio.m4v",  # Different temp format
    remove_temp=True,
    ffmpeg_params=[
        "-crf",
        "35",  # Much higher CRF
        "-g",
        "60",  # Larger GOP size
        "-bf",
        "0",  # No B-frames
        "-refs",
        "1",  # Single reference frame
        "-me_method",
        "dia",  # Diamond motion estimation (fastest)
        "-subq",
        "1",  # Lowest subpixel refinement
        "-trellis",
        "0",  # Disable trellis quantization
        "-movflags",
        "+faststart",
    ],
)
