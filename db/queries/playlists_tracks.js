import db from "#db/client";

export async function createPlaylistTrack(playlistId, trackId) {
  const sql = `
  INSERT INTO playlists_tracks
    (playlist_id, track_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [playlistTrack],
  } = await db.query(sql, [playlistId, trackId]);
  return playlistTrack;
}

export const getPlaylistsByUserIdAndTrackId = async (userId, trackId) => {
    const sql = `
    SELECT p.* FROM playlists p
    JOIN playlists_tracks pt ON p.id = pt.playlist_id
    WHERE p.owner_id = $1 AND pt.track_id = $2
    ORDER BY p.id
    `;
    const { rows: playlists } = await db.query(sql, [userId, trackId]);
    return playlists;
}