
# AISlopHits v1.0.0

Welcome to the ultimate AI Music Discovery platform!

## Version 1.0.0 Features
- **Featured Spotlight**: Highlight the absolute best slop of the week.
- **Community Submissions**: Anyone can add their tracks via the "Submit Track" button.
- **Multi-Source Support**: Paste links from Google Drive, YouTube, or direct MP3 URLs.

## How to add your own music (Developer)
1. **Local Files**: Create a `public` folder and drop your `.mp3` files there. Reference them as `/filename.mp3`.
2. **External Links**: Use the "Submit" or "Manage" buttons to paste links from Google Drive or other hosting services.

## Google Drive Tip
When sharing from Google Drive:
1. Right-click the file -> Share -> Anyone with the link can view.
2. Copy the link.
3. Paste it into AISlopHits. The app will automatically try to handle the "view" vs "preview" conversion for you.

## App Structure
- `src/app/page.tsx`: The main hub showing the spotlight and the full track list.
- `src/components/AudioPlayer.tsx`: The custom music player.
- `src/components/TrackCard.tsx`: Small preview cards for the gallery.
