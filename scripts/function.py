import math
import os
from PIL import Image, ImageDraw
import numpy as np

from moviepy import (
    AudioFileClip,
    ColorClip,
    CompositeAudioClip,
    CompositeVideoClip,
    ImageClip,
    afx,
    TextClip,
)
from moviepy.video.fx import Resize, FadeIn, FadeOut


def create_image_grid(images_list, video_width, video_height, duration):
    """
    Create the exact Decory app layout:
    - 1 large image at the top (main image)
    - 4 smaller images in a 2x2 grid below
    - Exactly 5 images total
    """

    if len(images_list) != 5:
        raise ValueError("This layout requires exactly 5 images")

    # Colors matching the Decory app
    bg_color = (248, 226, 226)  # Soft pink background
    card_color = (255, 255, 255)  # White cards

    # Create background
    bg = ColorClip(size=(video_width, video_height), color=bg_color).with_duration(
        duration
    )

    # Layout parameters
    padding = int(min(video_width, video_height) * 0.04)  # 4% padding from edges
    card_margin = int(min(video_width, video_height) * 0.02)  # 2% margin between cards

    # Calculate dimensions
    # Main image (top) - takes about 50% of height
    main_card_width = video_width - (padding * 2)
    main_card_height = int(video_height * 0.45)  # 45% of total height

    # Small images (bottom 2x2 grid) - remaining space
    remaining_height = video_height - main_card_height - (padding * 3) - card_margin
    small_card_height = remaining_height // 2
    small_card_width = (main_card_width - card_margin) // 2

    clips = [bg]

    # 1. Main image (top, large)
    main_x = padding
    main_y = padding

    # Main card background with shadow
    main_shadow = (
        ColorClip(size=(main_card_width, main_card_height), color=(200, 200, 200))
        .with_position((main_x + 6, main_y + 6))
        .with_duration(duration)
        .with_opacity(0.3)
    )

    main_card_bg = (
        ColorClip(size=(main_card_width, main_card_height), color=card_color)
        .with_position((main_x, main_y))
        .with_duration(duration)
    )

    # Main image
    try:
        main_img = ImageClip(images_list[0])

        # Scale to fit main card with padding
        img_padding = 15
        target_width = main_card_width - (img_padding * 2)
        target_height = main_card_height - (img_padding * 2)

        # Calculate scale to fit
        img_w, img_h = main_img.size
        scale_w = target_width / img_w
        scale_h = target_height / img_h
        scale = min(scale_w, scale_h)

        main_img = main_img.Resized(scale)

        # Center the image
        img_x = main_x + (main_card_width - main_img.size[0]) // 2
        img_y = main_y + (main_card_height - main_img.size[1]) // 2

        main_img = main_img.with_position((img_x, img_y)).with_duration(duration)

        clips.extend([main_shadow, main_card_bg, main_img])

    except Exception as e:
        print(f"Error processing main image: {e}")
        clips.extend([main_shadow, main_card_bg])

    # 2. Four small images in 2x2 grid
    grid_start_y = main_y + main_card_height + card_margin

    # Positions for 2x2 grid
    positions = [
        (0, 0),  # Top-left
        (1, 0),  # Top-right
        (0, 1),  # Bottom-left
        (1, 1),  # Bottom-right
    ]

    for i, (col, row) in enumerate(positions):
        if i + 1 >= len(images_list):  # Skip if we don't have enough images
            break

        # Calculate position
        small_x = padding + col * (small_card_width + card_margin)
        small_y = grid_start_y + row * (small_card_height + card_margin)

        # Small card shadow
        small_shadow = (
            ColorClip(size=(small_card_width, small_card_height), color=(200, 200, 200))
            .with_position((small_x + 4, small_y + 4))
            .with_duration(duration)
            .with_opacity(0.3)
        )

        # Small card background
        small_card_bg = (
            ColorClip(size=(small_card_width, small_card_height), color=card_color)
            .with_position((small_x, small_y))
            .with_duration(duration)
        )

        # Small image
        try:
            small_img = ImageClip(
                images_list[i + 1]
            )  # +1 because index 0 is the main image

            # Scale to fit small card
            img_padding = 10
            target_width = small_card_width - (img_padding * 2)
            target_height = small_card_height - (img_padding * 2)

            img_w, img_h = small_img.size
            scale_w = target_width / img_w
            scale_h = target_height / img_h
            scale = min(scale_w, scale_h)

            small_img = small_img.Resized(scale)

            # Center the image
            img_x = small_x + (small_card_width - small_img.size[0]) // 2
            img_y = small_y + (small_card_height - small_img.size[1]) // 2

            small_img = small_img.with_position((img_x, img_y)).with_duration(duration)

            clips.extend([small_shadow, small_card_bg, small_img])

        except Exception as e:
            print(f"Error processing small image {i+1}: {e}")
            clips.extend([small_shadow, small_card_bg])

    return CompositeVideoClip(clips)


def create_decory_slideshow_with_crossfade(
    slideshow_images,
    static_images,
    labels_list,
    video_width,
    video_height,
    total_duration,
    slide_duration=2.0,
    crossfade_duration=0.5,
):
    """
    Create Decory slideshow with smooth crossfade transitions

    Args:
        slideshow_images: List of images to slideshow
        static_images: List of 4 static images for bottom grid
        labels_list: List of 4 labels
        video_width: Width of video
        video_height: Height of video
        total_duration: Total duration
        slide_duration: How long each slide is visible
        crossfade_duration: Duration of crossfade between slides
    """

    if len(static_images) != 4 or len(labels_list) != 4:
        raise ValueError("Need exactly 4 static images and 4 labels")

    # Colors and layout (same as above)
    bg_color = (248, 226, 226)
    card_color = (255, 255, 255)
    text_color = "black"

    bg = ColorClip(size=(video_width, video_height), color=bg_color).with_duration(
        total_duration
    )

    padding = int(min(video_width, video_height) * 0.04)
    card_margin = int(min(video_width, video_height) * 0.02)
    label_height = 30

    main_card_width = video_width - (padding * 2)
    main_card_height = int(video_height * 0.4)

    remaining_height = video_height - main_card_height - (padding * 3) - card_margin
    small_card_height = (remaining_height - label_height) // 2
    small_card_width = (main_card_width - card_margin) // 2

    main_x = padding
    main_y = padding

    # Main card background
    main_shadow = (
        ColorClip(size=(main_card_width, main_card_height), color=(200, 200, 200))
        .with_position((main_x + 6, main_y + 6))
        .with_duration(total_duration)
        .with_opacity(0.3)
    )

    main_card_bg = (
        ColorClip(size=(main_card_width, main_card_height), color=card_color)
        .with_position((main_x, main_y))
        .with_duration(total_duration)
    )

    # Create slideshow with crossfade
    slideshow_clips = []
    if slideshow_images:
        img_padding = 20
        target_width = main_card_width - (img_padding * 2)
        target_height = main_card_height - (img_padding * 2)

        # Calculate how many full cycles we can fit
        cycle_duration = len(slideshow_images) * slide_duration
        num_cycles = max(1, int(total_duration / cycle_duration))

        for cycle in range(num_cycles):
            cycle_start = cycle * cycle_duration

            for i, img_path in enumerate(slideshow_images):
                try:
                    # Check if image exists
                    if not os.path.exists(img_path):
                        print(f"Image file not found: {img_path}")
                        continue

                    slide_img = ImageClip(img_path)

                    # Validate image
                    if slide_img.size == (0, 0):
                        print(f"Invalid image: {img_path}")
                        continue

                    # Scale to fit
                    img_w, img_h = slide_img.size
                    scale = min(target_width / img_w, target_height / img_h)
                    slide_img = slide_img.Resized(
                        (int(img_w * scale), int(img_h * scale))
                    )

                    # Center position
                    img_x = main_x + (main_card_width - slide_img.size[0]) // 2
                    img_y = main_y + (main_card_height - slide_img.size[1]) // 2

                    # Timing
                    start_time = cycle_start + i * slide_duration
                    clip_duration = min(
                        slide_duration + crossfade_duration, total_duration - start_time
                    )

                    if start_time >= total_duration:
                        break

                    # Set proper duration and timing
                    slide_img = (
                        slide_img.with_position((img_x, img_y))
                        .with_duration(clip_duration)
                        .with_start(start_time)
                    )

                    # Apply crossfade
                    if i == 0 and cycle == 0:
                        # First image ever: just fade in
                        slide_img = FadeIn(crossfade_duration).apply(slide_img)

                    elif start_time + slide_duration >= total_duration:
                        # Last image: fade out
                        slide_img = FadeOut(crossfade_duration).apply(slide_img)
                    else:
                        # Regular crossfade
                        slide_img = FadeIn(crossfade_duration).apply(slide_img)
                        slide_img = FadeOut(crossfade_duration).apply(slide_img)

                    slideshow_clips.append(slide_img)

                except Exception as e:
                    print(
                        f"Error processing slideshow image {i} in cycle {cycle} ({img_path}): {e}"
                    )
                    continue

    # Debug print
    print(f"Created {len(slideshow_clips)} slideshow clips with crossfade")

    # Static bottom grid (same as previous function)
    static_clips = []
    grid_start_y = main_y + main_card_height + card_margin
    positions = [(0, 0), (1, 0), (0, 1), (1, 1)]

    for i, (col, row) in enumerate(positions):
        small_x = padding + col * (small_card_width + card_margin)
        small_y = grid_start_y + row * (small_card_height + card_margin + label_height)

        small_shadow = (
            ColorClip(size=(small_card_width, small_card_height), color=(200, 200, 200))
            .with_position((small_x + 4, small_y + 4))
            .with_duration(total_duration)
            .with_opacity(0.3)
        )

        small_card_bg = (
            ColorClip(size=(small_card_width, small_card_height), color=card_color)
            .with_position((small_x, small_y))
            .with_duration(total_duration)
        )

        try:
            if not os.path.exists(static_images[i]):
                print(f"Static image file not found: {static_images[i]}")
                static_clips.extend([small_shadow, small_card_bg])
                continue

            static_img = ImageClip(static_images[i], duration=total_duration)

            if static_img.size == (0, 0):
                print(f"Invalid static image: {static_images[i]}")
                static_clips.extend([small_shadow, small_card_bg])
                continue

            img_padding = 10
            target_width = small_card_width - (img_padding * 2)
            target_height = small_card_height - (img_padding * 2)

            img_w, img_h = static_img.size
            scale = min(target_width / img_w, target_height / img_h)
            static_img = static_img.Resized((int(img_w * scale), int(img_h * scale)))

            img_x = small_x + (small_card_width - static_img.size[0]) // 2
            img_y = small_y + (small_card_height - static_img.size[1]) // 2
            static_img = static_img.with_position((img_x, img_y))

            static_clips.extend([small_shadow, small_card_bg, static_img])

        except Exception as e:
            print(f"Error processing static image {i}: {e}")
            static_clips.extend([small_shadow, small_card_bg])

        # Label
        try:
            text_clip = TextClip(
                labels_list[i],
                font_size=min(small_card_width // 10, 16),
                color=text_color,
            ).with_duration(total_duration)

            text_x = small_x + (small_card_width - text_clip.size[0]) // 2
            text_y = small_y + small_card_height + 8
            text_clip = text_clip.with_position((text_x, text_y))
            static_clips.append(text_clip)

        except Exception as e:
            print(f"Error creating label {i}: {e}")

    # Combine all clips
    all_clips = [bg, main_shadow, main_card_bg] + slideshow_clips + static_clips

    return CompositeVideoClip(all_clips)


def ease(t):
    """Smoothstep easing: ease-in-out"""
    return 3 * (t**2) - 2 * (t**3)


def build_cursor_clips(
    cursor_icon_path,
    positions,
    total_duration,
    slide_duration,
    click_sound,
    cursor_size=(60, 60),
):
    cw, ch = cursor_size
    half_w, half_h = cw // 2, ch // 2

    diameter = min(cursor_size)

    # draw with PIL
    img = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse((0, 0, diameter, diameter), fill=(255, 255, 255, 255))

    # Load cursor icon
    icon = ImageClip(np.array(img)).resized(cursor_size).with_duration(total_duration)
    # icon = (
    #     ImageClip(cursor_icon_path).resized(cursor_size).with_duration(total_duration)
    # )
    # Optional glow outline
    try:
        outline = (
            ColorClip(size=cursor_size, color=(255, 255, 255))
            .resized(1.2)
            .with_opacity(0.2)
            .with_duration(total_duration)
            .with_mask(icon.mask)
        )
    except Exception:
        outline = icon

    def make_move(prev, curr):
        def pos(t):
            t_clamped = max(0, min(t, slide_duration))
            p = ease(t_clamped / slide_duration)
            x = prev[0] + (curr[0] - prev[0]) * p
            y = prev[1] + (curr[1] - prev[1]) * p
            return x - half_w, y - half_h

        return pos

    video_clips = []
    audio_clips = []  # Separate list for audio clips
    print("Click sound path:", click_sound)
    print("File exists?", os.path.exists(click_sound))

    click_audio = (
        AudioFileClip(click_sound).with_effects([afx.MultiplyVolume(2.0)])
        if os.path.exists(click_sound)
        else None
    )

    print("Click audio loaded?", click_audio is not None)

    num = len(positions)

    for i in range(num):
        start = i * slide_duration
        prev_pos = positions[(i - 1) % num]
        curr_pos = positions[i]

        # Movement clip
        move = (
            CompositeVideoClip([outline, icon])
            .with_start(start)
            .with_duration(slide_duration)
            .with_position(make_move(prev_pos, curr_pos))
        )
        video_clips.append(move)

        # Click press animation (scale down/up)
        press = (
            CompositeVideoClip([outline, icon])
            .with_start(start)
            .with_duration(0.2)
            .resized(lambda t: 1 - 0.1 * ease(t / 0.2))
            .with_position((curr_pos[0] - half_w, curr_pos[1] - half_h))
        )
        if click_audio:
            # make sure this slice is only 0.2s long
            press = press.with_audio(click_audio.subclipped(0, 0.2))
        video_clips.append(press)

        # Click sound - add to separate audio list
        if click_audio:
            audio_clips.append(click_audio.with_start(start))

    return video_clips, audio_clips  # Return both lists separately


def create_decory_slideshow(
    slideshow_images,
    static_images,
    labels_list,
    video_width,
    video_height,
    total_duration,
    transition_duration=0.5,
    click_sound_path="public/Mouse.mp3",
    cursor_icon_path="public/cursor.png",
):
    # Validate inputs
    if len(static_images) != 4 or len(labels_list) != 4:
        raise ValueError("Require exactly 4 static images and 4 labels")

    # Colors
    bg_color = (248, 226, 226)
    card_color = (255, 255, 255)
    text_color = "black"

    # Layout metrics
    padding = int(min(video_width, video_height) * 0.04)
    margin = int(min(video_width, video_height) * 0.02)
    label_h = 30

    main_w = video_width - 2 * padding
    main_h = int(video_height * 0.4)
    rem_h = video_height - main_h - 3 * padding - margin
    small_h = (rem_h - label_h) // 2
    small_w = (main_w - margin) // 2

    main_x, main_y = padding, padding
    grid_y = main_y + main_h + margin

    # Background and main card
    bg = ColorClip((video_width, video_height), color=bg_color).with_duration(
        total_duration
    )
    shadow_main = (
        ColorClip((main_w, main_h), color=(200, 200, 200))
        .with_position((main_x + 6, main_y + 6))
        .with_duration(total_duration)
        .with_opacity(0.3)
    )
    main_bg = (
        ColorClip((main_w, main_h), color=card_color)
        .with_position((main_x, main_y))
        .with_duration(total_duration)
    )

    # Slideshow clips
    num_slides = len(slideshow_images)
    slide_dur = total_duration / max(num_slides, 1)
    slides = []

    for i, img_path in enumerate(slideshow_images):
        if not os.path.exists(img_path):
            continue
        clip = ImageClip(img_path, duration=slide_dur)
        # Resize to fit
        tw, th = main_w - 40, main_h - 40
        scale = min(tw / clip.w, th / clip.h)
        clip = clip.resized(scale)
        # Center
        x = main_x + (main_w - clip.w) // 2
        y = main_y + (main_h - clip.h) // 2
        clip = clip.with_position((x, y)).with_start(i * slide_dur)
        # Fade in/out
        clip = FadeIn(transition_duration).apply(clip)
        if i == num_slides - 1:
            clip = FadeOut(transition_duration).apply(clip)
        slides.append(clip)

    # Static bottom grid
    static_clips = []
    positions = []
    for idx, (col, row) in enumerate([(0, 0), (1, 0), (0, 1), (1, 1)]):
        x = padding + col * (small_w + margin)
        y = grid_y + row * (small_h + margin + label_h)
        positions.append((x + small_w // 2, y + small_h // 2))

        # Shadow + card
        sh = (
            ColorClip((small_w, small_h), color=(200, 200, 200))
            .with_position((x + 4, y + 4))
            .with_duration(total_duration)
            .with_opacity(0.3)
        )
        cb = (
            ColorClip((small_w, small_h), color=card_color)
            .with_position((x, y))
            .with_duration(total_duration)
        )
        static_clips += [sh, cb]

        # Image
        img_file = static_images[idx]
        if os.path.exists(img_file):
            sti = ImageClip(img_file, duration=total_duration)
            s = min((small_w - 20) / sti.w, (small_h - 20) / sti.h)
            sti = sti.resized(s)
            ix = x + (small_w - sti.w) // 2
            iy = y + (small_h - sti.h) // 2
            static_clips.append(sti.with_position((ix, iy)))

        # Label
        txt = TextClip(
            text=labels_list[idx], font_size=min(small_w // 10, 16), color=text_color
        )
        txt = txt.with_duration(total_duration)
        tx = x + (small_w - txt.w) // 2
        ty = y + small_h + 8
        static_clips.append(txt.with_position((tx, ty)))

    # Cursor sequence
    cursor_video_clips, cursor_audio_clips = build_cursor_clips(
        cursor_icon_path,
        positions,
        total_duration,
        slide_dur,
        click_sound_path,
    )

    # And update the CompositeVideoClip line:
    final = CompositeVideoClip(
        [bg, shadow_main, main_bg] + slides + static_clips + cursor_video_clips
    )

    # Then add the audio:
    if cursor_audio_clips:

        final_audio = CompositeAudioClip(cursor_audio_clips)
        final = final.with_audio(final_audio)
    return final
