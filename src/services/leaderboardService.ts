import { supabase } from '../supabaseClient';
import type { DatabaseLeaderboardRow, Leader } from '../types';

export const leaderboardService = {
  async getTopFive(): Promise<Leader[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_name, score')
      .order('score', { ascending: false })
      .limit(5);

    if (error) throw error;
    if (!data) return [];

    const rows = data as DatabaseLeaderboardRow[];
    return rows.map((item) => ({
      player_name: item.player_name,
      score: item.score.toFixed(2),
    }));
  },

  async upsertScore(playerName: string, scoreNum: number): Promise<void> {
    const { error } = await supabase
      .from('leaderboard')
      .upsert({ player_name: playerName, score: scoreNum }, { onConflict: 'player_name' });

    if (error) throw error;
  },
};
