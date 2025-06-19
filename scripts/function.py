import math
import os
from moviepy import ColorClip, CompositeVideoClip, ImageClip, TextClip
from moviepy.video.fx import FadeIn, FadeOut


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

        main_img = main_img.resized(scale)

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

            small_img = small_img.resized(scale)

            # Center the image
            img_x = small_x + (small_card_width - small_img.size[0]) // 2
            img_y = small_y + (small_card_height - small_img.size[1]) // 2

            small_img = small_img.with_position((img_x, img_y)).with_duration(duration)

            clips.extend([small_shadow, small_card_bg, small_img])

        except Exception as e:
            print(f"Error processing small image {i+1}: {e}")
            clips.extend([small_shadow, small_card_bg])

    return CompositeVideoClip(clips)


def create_decory_slideshow(
    slideshow_images,
    static_images,
    labels_list,
    video_width,
    video_height,
    total_duration,
    transition_duration=0.5,
):
    """
    Create Decory layout with slideshow in the main (white) area

    Args:
        slideshow_images: List of images to slideshow in the main white area
        static_images: List of 4 images for the bottom 2x2 grid (static)
        labels_list: List of 4 labels for the bottom images
        video_width: Width of the video
        video_height: Height of the video
        total_duration: Total duration of the video
        transition_duration: Duration of fade transition between slides
    """

    if len(static_images) != 4:
        raise ValueError("Need exactly 4 static images for the bottom grid")

    if len(labels_list) != 4:
        raise ValueError("Need exactly 4 labels for the bottom images")

    # Colors
    bg_color = (248, 226, 226)  # Soft pink background
    card_color = (255, 255, 255)  # White cards
    text_color = "black"

    # Create background
    bg = ColorClip(size=(video_width, video_height), color=bg_color).with_duration(
        total_duration
    )

    # Layout parameters
    padding = int(min(video_width, video_height) * 0.04)
    card_margin = int(min(video_width, video_height) * 0.02)
    label_height = 30

    # Main slideshow area dimensions
    main_card_width = video_width - (padding * 2)
    main_card_height = int(video_height * 0.4)

    # Small images dimensions
    remaining_height = video_height - main_card_height - (padding * 3) - card_margin
    small_card_height = (remaining_height - label_height) // 2
    small_card_width = (main_card_width - card_margin) // 2

    # Main slideshow area position
    main_x = padding
    main_y = padding

    # Create main card background and shadow (static)
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

    # Create slideshow in main area
    slideshow_clips = []
    if slideshow_images:
        # Calculate timing for each slide
        num_slides = len(slideshow_images)
        slide_duration = total_duration / num_slides

        img_padding = 20
        target_width = main_card_width - (img_padding * 2)
        target_height = main_card_height - (img_padding * 2)

        for i, img_path in enumerate(slideshow_images):
            try:
                # Ensure the image file exists and is accessible
                if not os.path.exists(img_path):
                    print(f"Image file not found: {img_path}")
                    continue

                # Load image with explicit duration
                slide_img = ImageClip(img_path, duration=slide_duration)

                # Validate image loaded properly
                if slide_img.size == (0, 0):
                    print(f"Invalid image dimensions for: {img_path}")
                    continue

                # Scale to fit
                img_w, img_h = slide_img.size
                scale = min(target_width / img_w, target_height / img_h)
                slide_img = slide_img.resized((int(img_w * scale), int(img_h * scale)))

                # Center the image
                img_x = main_x + (main_card_width - slide_img.size[0]) // 2
                img_y = main_y + (main_card_height - slide_img.size[1]) // 2

                # Set timing
                start_time = i * slide_duration

                # Position and timing
                slide_img = slide_img.with_position((img_x, img_y)).with_start(
                    start_time
                )

                # Add fade transitions
                if i == 0:
                    # First image: fade in
                    slide_img = FadeIn(transition_duration).apply(slide_img)

                elif i == len(slideshow_images) - 1:
                    # Last image: fade out
                    slide_img = FadeOut(transition_duration).apply(slide_img)
                else:
                    # Middle images: fade in and out
                    slide_img = FadeIn(transition_duration).apply(slide_img)
                    slide_img = FadeOut(transition_duration).apply(slide_img)
                slideshow_clips.append(slide_img)

            except Exception as e:
                print(f"Error processing slideshow image {i} ({img_path}): {e}")
                continue

    # Debug print
    print(f"Created {len(slideshow_clips)} slideshow clips")

    # Create static bottom grid (4 images with labels)
    static_clips = []
    grid_start_y = main_y + main_card_height + card_margin
    positions = [(0, 0), (1, 0), (0, 1), (1, 1)]

    for i, (col, row) in enumerate(positions):
        small_x = padding + col * (small_card_width + card_margin)
        small_y = grid_start_y + row * (small_card_height + card_margin + label_height)

        # Card shadow and background
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

        # Static image
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
            static_img = static_img.resized((int(img_w * scale), int(img_h * scale)))

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
                    slide_img = slide_img.resized(
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
            static_img = static_img.resized((int(img_w * scale), int(img_h * scale)))

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
