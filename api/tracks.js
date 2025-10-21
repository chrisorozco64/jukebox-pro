import express from "express";
const router = express.Router();
export default router;

import { getTracks, getTrackById } from "#db/queries/tracks";
import { getPlaylistsByUserIdAndTrackId } from "#db/queries/playlists_tracks";
import requireUser from "#middleware/requireUser";

router.use(requireUser);

router.route("/").get(async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

// Add router.param to load track and make it available as req.track
router.param("id", async (req, res, next, id) => {
  const track = await getTrackById(id);
  if (!track) return res.status(404).send("Track not found.");
  req.track = track;
  next();
});

router.route("/:id").get(async (req, res) => {
  // Now use req.track instead of querying again
  res.send(req.track);
});

router
  .route("/:id/playlists")
  .get(async (req, res) => {
    console.log('=== GET /tracks/:id/playlists DEBUG ===');
    console.log('req.user.id:', req.user.id);
    console.log('req.track.id:', req.track.id);
    
    try {
      // Now req.track.id is available from the param middleware
      const playlists = await getPlaylistsByUserIdAndTrackId(req.user.id, req.track.id);
      console.log('Playlists found:', playlists.length);
      res.send(playlists);
    } catch (error) {
      console.error('Error in GET /tracks/:id/playlists:', error);
      res.status(500).send('Server error');
    }
  });