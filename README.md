
# TuneSpotlight Starter

Welcome to your music discovery app!

## How to add your own music

1. **Create a `public` folder**: Click the "New Folder" icon at the top of the sidebar (the folder icon with a `+` sign) and name it `public`.
2. **Upload your MP3**: Drag and drop your `.mp3` file from your computer directly into that new `public` folder in the sidebar. **IMPORTANT**: Keep the filename simple, like `song.mp3`.
3. **Set the Spotlight**:
   - Open your app in the preview window.
   - Click the **"Manage"** button in the top right of the page.
   - In the **Audio URL** field, type `/your-filename.mp3` (for example: if your file is named `vibe.mp3`, type `/vibe.mp3`).
   - **CRITICAL**: Do NOT include "public" in the URL. If your file is in `public/vibe.mp3`, the URL is just `/vibe.mp3`.

## App Structure

- `src/app/page.tsx`: The main landing page showing the featured song.
- `src/components/AudioPlayer.tsx`: The custom music player.
- `firestore.rules`: Security settings for your database.
