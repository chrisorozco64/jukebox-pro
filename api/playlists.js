import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  getPlaylistsByUserId,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import requireUser from "#middleware/requireUser";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    console.log("=== GET /playlists DEBUG ===");
    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user?.id);

    try {
      const playlists = await getPlaylistsByUserId(req.user.id);
      console.log("Playlists found:", playlists.length);
      console.log("Playlists:", playlists);
      res.status(200).send(playlists);
    } catch (error) {
      console.error("Error in GET /playlists:", error);
      res.status(500).send("Server error");
    }
  })
  .post(async (req, res) => {
    console.log("=== POST /playlists DEBUG ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    if (!req.body) return res.status(400).send("Request body is required.");

    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).send("Request body requires: name, description");

    try {
      // FIX: Add req.user.id as the third parameter
      const playlist = await createPlaylist(name, description, req.user.id);
      console.log("Created playlist:", playlist);
      res.status(201).send(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).send("Failed to create playlist");
    }
  });

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  req.playlist = playlist;
  next();
});

router.route("/:id").get((req, res) => {
  console.log("=== GET /playlists/:id DEBUG ===");
  console.log("req.user.id:", req.user.id);
  console.log("req.playlist.owner_id:", req.playlist.owner_id);

  // Add ownership check for 403 error
  if (req.playlist.owner_id !== req.user.id) {
    console.log("Access denied: User does not own this playlist");
    return res.status(403).send("You do not own this playlist.");
  }

  console.log("Access granted: User owns this playlist");
  res.status(200).send(req.playlist);
});

router
  .route("/:id/tracks")
  .get(async (req, res) => {
    // Add ownership check for 403 error
    if (req.playlist.owner_id !== req.user.id) {
      return res.status(403).send("You do not own this playlist.");
    }
    
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  })
  .post(async (req, res) => {
    // Add ownership check for 403 error
    if (req.playlist.owner_id !== req.user.id) {
      return res.status(403).send("You do not own this playlist.");
    }
    
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    try {
      const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
      res.status(201).send(playlistTrack);
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      res.status(500).send("Failed to add track to playlist");
    }
  });