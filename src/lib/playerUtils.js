import { base44 } from "@/api/base44Client";

// Stable identity from NIAT id + campus. Not displayed publicly.
export function makeIdentity(niatId, campus) {
  return `${(campus || "").trim()}||${(niatId || "").trim().toLowerCase()}`;
}

// Simple non-crypto hash for the NIAT id (never displayed, not reversible).
export function hashNiatId(niatId) {
  const s = String(niatId || "").trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

// Find an existing player by identity, or create a new one.
// Reuses the same record on Play Again. Updates name/campus if edited.
export async function findOrCreatePlayer(niatId, playerName, campus) {
  const identity = makeIdentity(niatId, campus);
  const existing = await base44.entities.Player.filter(
    { internal_player_identity: identity },
    "-created_date",
    5
  );
  if (existing && existing.length > 0) {
    const p = existing[0];
    if (p.player_name !== playerName || p.campus !== campus) {
      const updated = await base44.entities.Player.update(p.id, {
        player_name: playerName,
        campus,
      });
      return updated;
    }
    return p;
  }
  const created = await base44.entities.Player.create({
    internal_player_identity: identity,
    player_name: playerName,
    campus,
    best_score: 0,
    best_combo: 0,
    best_accuracy: 0,
    niat_id_hash: hashNiatId(niatId),
  });
  return created;
}

// Update an existing player's profile by id (preserves best scores).
// Used by the Profile / Edit Player screen.
export async function updatePlayerProfile(player, niatId, playerName, campus) {
  const identity = makeIdentity(niatId, campus);
  const updated = await base44.entities.Player.update(player.id, {
    internal_player_identity: identity,
    player_name: playerName,
    campus,
    niat_id_hash: hashNiatId(niatId),
  });
  return updated;
}

// Save a completed game result and update the player's bests.
export async function saveGameResult(player, score, bestCombo, accuracy, livesRemaining) {
  const resultPayload = {
    player_id: player.id,
    player_name: player.player_name,
    campus: player.campus,
    score,
    best_combo: bestCombo,
    accuracy,
    lives_remaining: livesRemaining,
    played_at: new Date().toISOString(),
  };
  await base44.entities.GameResult.create(resultPayload);

  const patch = {};
  if (score > (player.best_score || 0)) patch.best_score = score;
  if (bestCombo > (player.best_combo || 0)) patch.best_combo = bestCombo;
  if (accuracy > (player.best_accuracy || 0)) patch.best_accuracy = accuracy;
  let updated = player;
  if (Object.keys(patch).length > 0) {
    updated = await base44.entities.Player.update(player.id, patch);
  }
  return updated;
}

// Fetch leaderboard: top 10 real players overall + top 10 from a campus.
export async function fetchLeaderboard(campus) {
  const all = await base44.entities.Player.list("-best_score", 100);
  const allScored = (all || []).filter((p) => (p.best_score || 0) > 0).slice(0, 10);
  let myCampus = [];
  if (campus) {
    const campusPlayers = await base44.entities.Player.filter(
      { campus },
      "-best_score",
      100
    );
    myCampus = (campusPlayers || []).filter((p) => (p.best_score || 0) > 0).slice(0, 10);
  }
  return { all: allScored, myCampus };
}