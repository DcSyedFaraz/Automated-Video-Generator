import argparse
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

parser = argparse.ArgumentParser(description="Create video from images and audio using moviepy")
parser.add_argument('--audio', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('images', nargs='+')
args = parser.parse_args()

image_duration = 3
clips = [ImageClip(img).set_duration(image_duration) for img in args.images]
video = concatenate_videoclips(clips, method='compose')

if args.audio:
    audio = AudioFileClip(args.audio)
    video = video.set_audio(audio)

video.write_videofile(args.output, codec='libx264', audio_codec='aac')
