import math
from moviepy import ColorClip, CompositeVideoClip, ImageClip, TextClip


def create_image_grid(images_list, video_width, video_height, duration):
    """
    Create a modern, mobile-friendly grid layout that adapts to any number of images
    with rounded corners, proper spacing, and clean aesthetics
    """

    num_images = len(images_list)

    # Calculate optimal grid dimensions
    if num_images == 1:
        cols, rows = 1, 1
    elif num_images == 2:
        cols, rows = 1, 2  # Stack vertically for mobile-like layout
    elif num_images == 3:
        cols, rows = 1, 3  # Single column for 3 images
    elif num_images == 4:
        cols, rows = 2, 2
    elif num_images <= 6:
        cols, rows = 2, 3
    elif num_images <= 9:
        cols, rows = 3, 3
    elif num_images <= 12:
        cols, rows = 3, 4
    elif num_images <= 16:
        cols, rows = 4, 4
    else:
        # For larger numbers, create a roughly square grid
        cols = math.ceil(math.sqrt(num_images))
        rows = math.ceil(num_images / cols)

    # Modern color palette - soft pink background like in the image
    bg_color = (248, 226, 226)  # Soft pink/rose background
    card_color = (255, 255, 255)  # White cards

    # Background with gradient-like effect
    bg = ColorClip(size=(video_width, video_height), color=bg_color).with_duration(
        duration
    )

    # Calculate responsive padding and margins
    base_padding = min(video_width, video_height) * 0.05  # 5% base padding
    card_margin = min(video_width, video_height) * 0.02  # 2% margin between cards

    # Calculate available space
    total_horizontal_margin = base_padding * 2 + card_margin * (cols - 1)
    total_vertical_margin = base_padding * 2 + card_margin * (rows - 1)

    available_width = video_width - total_horizontal_margin
    available_height = video_height - total_vertical_margin

    # Calculate card dimensions
    card_width = int(available_width / cols)
    card_height = int(available_height / rows)

    # Ensure minimum card size
    min_card_size = min(video_width, video_height) * 0.15
    card_width = max(card_width, int(min_card_size))
    card_height = max(card_height, int(min_card_size))

    clips = [bg]

    for i, image_path in enumerate(images_list):
        if i >= rows * cols:
            break

        # Calculate grid position
        row = i // cols
        col = i % cols

        # Calculate card position with proper centering
        start_x = (video_width - (cols * card_width + (cols - 1) * card_margin)) // 2
        start_y = (video_height - (rows * card_height + (rows - 1) * card_margin)) // 2

        x = start_x + col * (card_width + card_margin)
        y = start_y + row * (card_height + card_margin)

        # Create card background with rounded corners effect
        card_bg = (
            ColorClip(size=(card_width, card_height), color=card_color)
            .with_position((x, y))
            .with_duration(duration)
        )

        # Create shadow effect (optional)
        shadow_offset = 4
        shadow_bg = (
            ColorClip(
                size=(card_width, card_height),
                color=(200, 200, 200),  # Light gray shadow
            )
            .with_position((x + shadow_offset, y + shadow_offset))
            .with_duration(duration)
            .with_opacity(0.3)
        )

        # Image content area with padding
        image_padding = min(card_width, card_height) * 0.08  # 8% padding inside card
        image_width = card_width - (image_padding * 2)
        image_height = card_height - (image_padding * 2)

        # Create and resize image to fit within card
        try:
            img_clip = ImageClip(image_path)

            # Calculate scaling to fit within the image area while maintaining aspect ratio
            img_w, img_h = img_clip.size
            scale_w = image_width / img_w
            scale_h = image_height / img_h
            scale = min(scale_w, scale_h)

            # Resize image
            img_clip = img_clip.resized(scale)

            # Center the image within the card
            img_x = x + (card_width - img_clip.size[0]) // 2
            img_y = y + (card_height - img_clip.size[1]) // 2

            img_clip = img_clip.with_position((img_x, img_y)).with_duration(duration)

            # Add clips in order: shadow, card background, image
            clips.extend([shadow_bg, card_bg, img_clip])

        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            # Create placeholder if image fails to load
            placeholder = (
                ColorClip(size=(image_width, image_height), color=(240, 240, 240))
                .with_position((x + image_padding, y + image_padding))
                .with_duration(duration)
            )

            clips.extend([shadow_bg, card_bg, placeholder])

    return CompositeVideoClip(clips)


# Alternative version with text labels (like "Minimal", "Futuristic" in your image)
def create_image_grid_with_labels(
    images_list, labels_list, video_width, video_height, duration
):
    """
    Create image grid with text labels below each image
    """

    num_images = len(images_list)

    # Calculate grid dimensions (same as above)
    if num_images == 1:
        cols, rows = 1, 1
    elif num_images == 2:
        cols, rows = 1, 2
    elif num_images == 3:
        cols, rows = 1, 3
    elif num_images == 4:
        cols, rows = 2, 2
    elif num_images <= 6:
        cols, rows = 2, 3
    elif num_images <= 9:
        cols, rows = 3, 3
    else:
        cols = math.ceil(math.sqrt(num_images))
        rows = math.ceil(num_images / cols)

    # Colors
    bg_color = (248, 226, 226)  # Soft pink
    card_color = (255, 255, 255)  # White
    text_color = "black"

    bg = ColorClip(size=(video_width, video_height), color=bg_color).with_duration(
        duration
    )

    # Calculate dimensions with space for labels
    base_padding = min(video_width, video_height) * 0.05
    card_margin = min(video_width, video_height) * 0.02
    label_height = 30  # Height reserved for text labels

    total_horizontal_margin = base_padding * 2 + card_margin * (cols - 1)
    total_vertical_margin = base_padding * 2 + card_margin * (rows - 1)

    available_width = video_width - total_horizontal_margin
    available_height = video_height - total_vertical_margin

    card_width = int(available_width / cols)
    card_height = int(available_height / rows)

    # Adjust for label space
    image_height = card_height - label_height - 10  # 10px spacing

    clips = [bg]

    for i, image_path in enumerate(images_list):
        if i >= rows * cols:
            break

        row = i // cols
        col = i % cols

        # Calculate positions
        start_x = (video_width - (cols * card_width + (cols - 1) * card_margin)) // 2
        start_y = (video_height - (rows * card_height + (rows - 1) * card_margin)) // 2

        x = start_x + col * (card_width + card_margin)
        y = start_y + row * (card_height + card_margin)

        # Card background
        card_bg = (
            ColorClip(size=(card_width, card_height), color=card_color)
            .with_position((x, y))
            .with_duration(duration)
        )

        # Shadow
        shadow_bg = (
            ColorClip(size=(card_width, card_height), color=(200, 200, 200))
            .with_position((x + 4, y + 4))
            .with_duration(duration)
            .with_opacity(0.3)
        )

        # Image
        image_padding = 10
        try:
            img_clip = ImageClip(image_path)

            # Scale to fit
            img_w, img_h = img_clip.size
            scale_w = (card_width - image_padding * 2) / img_w
            scale_h = (image_height - image_padding * 2) / img_h
            scale = min(scale_w, scale_h)

            img_clip = img_clip.resized(scale)

            # Center horizontally, position at top of card
            img_x = x + (card_width - img_clip.size[0]) // 2
            img_y = y + image_padding

            img_clip = img_clip.with_position((img_x, img_y)).with_duration(duration)

            clips.extend([shadow_bg, card_bg, img_clip])

        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            clips.extend([shadow_bg, card_bg])

        # Add text label if provided
        if i < len(labels_list) and labels_list[i]:
            try:
                text_clip = TextClip(
                    labels_list[i],
                    fontsize=min(card_width // 8, 20),  # Responsive font size
                    color=text_color,
                    font="Arial",
                ).with_duration(duration)

                # Position text at bottom of card
                text_x = x + (card_width - text_clip.size[0]) // 2
                text_y = y + image_height + 15  # 15px below image

                text_clip = text_clip.with_position((text_x, text_y))
                clips.append(text_clip)

            except Exception as e:
                print(f"Error creating text label: {e}")

    return CompositeVideoClip(clips)
