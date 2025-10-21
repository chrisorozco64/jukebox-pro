import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import db from "#db/client";
import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // 1. Create 2 users FIRST and store them
  const users = [];
  for (let i = 1; i <= 2; i++) {
    const username = faker.internet.username();
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10); // Hash it here
    const user = await createUser({ username, hashedPassword }); // Pass hashedPassword
    users.push(user);
  }


  // 2. Create tracks
  for (let i = 1; i <= 20; i++) {
    await createTrack("Track " + i, i * 50000);
  }

  // 3. Create playlists for each user (each user gets multiple playlists)
  const playlists = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Create 3 playlists per user
    for (let j = 1; j <= 3; j++) {
      const playlistName = `${user.username}'s Playlist ${j}`;
      const playlist = await createPlaylist(
        playlistName,
        "lorem ipsum playlist description",
        user.id // Use actual user ID
      );
      playlists.push(playlist);
    }
  }

  // 4. Add tracks to playlists (ensure each playlist has at least 5 tracks)
  for (let i = 0; i < playlists.length; i++) {
    const playlist = playlists[i];
    
    // Add 5 tracks to each playlist
    for (let j = 1; j <= 5; j++) {
      const trackId = ((i * 5 + j - 1) % 20) + 1; // Distribute tracks across playlists
      await createPlaylistTrack(playlist.id, trackId);
    }
  }
}