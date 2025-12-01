import { supabase } from '../lib/supabase';

// ForePoints reward values
export const REWARD_VALUES = {
  // Round-based rewards
  POST_ROUND: 10,
  FIRST_ROUND_OF_WEEK: 50,
  BEAT_PERSONAL_BEST: 100,
  BIRDIE: 5,
  EAGLE: 25,
  ALBATROSS: 100,
  HOLE_IN_ONE: 500,

  // Social rewards
  LIKE_RECEIVED: 1,
  COMMENT_RECEIVED: 2,
  NEW_FOLLOWER: 5,
  POST_CREATED: 5,
  COMMENT_CREATED: 2,

  // Milestone rewards
  FIRST_POST: 25,
  TEN_ROUNDS: 100,
  FIFTY_ROUNDS: 500,
  HUNDRED_ROUNDS: 1000,
  FIVE_COURSES: 75,
  TEN_COURSES: 150,
  TEN_FRIENDS: 50,
  HUNDRED_LIKES: 100,
};

export type TransactionType = 'earn' | 'spend' | 'transfer_in' | 'transfer_out' | 'claim';

export interface RewardTransaction {
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  reference_type?: string;
  reference_id?: string;
}

class RewardsService {
  // Award ForePoints to a user
  async awardPoints(
    userId: string,
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<void> {
    // Insert transaction record
    const { error: txError } = await supabase
      .from('forepoints_transactions')
      .insert({
        user_id: userId,
        amount,
        transaction_type: 'earn',
        description,
        reference_type: referenceType,
        reference_id: referenceId,
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
      throw new Error('Failed to record reward');
    }

    // Update user's balance
    const { error: updateError } = await supabase.rpc('increment_forepoints', {
      user_id: userId,
      amount,
    });

    // If RPC doesn't exist, do it manually
    if (updateError) {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('forepoints_balance')
        .eq('user_id', userId)
        .single();

      await supabase
        .from('user_stats')
        .update({ forepoints_balance: (stats?.forepoints_balance || 0) + amount })
        .eq('user_id', userId);
    }
  }

  // Spend ForePoints
  async spendPoints(
    userId: string,
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<void> {
    // Check balance first
    const balance = await this.getBalance(userId);
    if (balance < amount) {
      throw new Error('Insufficient ForePoints balance');
    }

    // Insert transaction record
    const { error: txError } = await supabase
      .from('forepoints_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'spend',
        description,
        reference_type: referenceType,
        reference_id: referenceId,
      });

    if (txError) {
      throw new Error('Failed to record transaction');
    }

    // Update user's balance
    await supabase
      .from('user_stats')
      .update({
        forepoints_balance: balance - amount,
      })
      .eq('user_id', userId);
  }

  // Get user's ForePoints balance
  async getBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('forepoints_balance')
      .eq('user_id', userId)
      .single();

    if (error) {
      return 0;
    }

    return data?.forepoints_balance || 0;
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('forepoints_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  }

  // Award points for completing a round
  async awardRoundPoints(
    userId: string,
    roundId: string,
    holeScores: { par: number; strokes: number }[]
  ): Promise<number> {
    let totalPoints = REWARD_VALUES.POST_ROUND;

    // Calculate score-based bonuses
    for (const hole of holeScores) {
      const diff = hole.strokes - hole.par;
      if (hole.strokes === 1) {
        totalPoints += REWARD_VALUES.HOLE_IN_ONE;
      } else if (diff === -3) {
        totalPoints += REWARD_VALUES.ALBATROSS;
      } else if (diff === -2) {
        totalPoints += REWARD_VALUES.EAGLE;
      } else if (diff === -1) {
        totalPoints += REWARD_VALUES.BIRDIE;
      }
    }

    // Check for first round of the week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { data: weekRounds } = await supabase
      .from('rounds')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString())
      .neq('id', roundId);

    if (!weekRounds || weekRounds.length === 0) {
      totalPoints += REWARD_VALUES.FIRST_ROUND_OF_WEEK;
    }

    // Check for personal best
    const totalScore = holeScores.reduce((sum, h) => sum + h.strokes, 0);
    const { data: stats } = await supabase
      .from('user_stats')
      .select('best_score')
      .eq('user_id', userId)
      .single();

    if (stats && (stats.best_score === 0 || totalScore < stats.best_score)) {
      totalPoints += REWARD_VALUES.BEAT_PERSONAL_BEST;

      // Update best score
      await supabase
        .from('user_stats')
        .update({ best_score: totalScore })
        .eq('user_id', userId);
    }

    // Award the points
    await this.awardPoints(
      userId,
      totalPoints,
      `Completed round with ${totalScore} strokes`,
      'round',
      roundId
    );

    return totalPoints;
  }

  // Award points for social actions
  async awardSocialPoints(
    userId: string,
    action: 'like_received' | 'comment_received' | 'new_follower' | 'post_created' | 'comment_created',
    referenceId?: string
  ): Promise<void> {
    const actionMap: Record<string, { amount: number; description: string }> = {
      like_received: { amount: REWARD_VALUES.LIKE_RECEIVED, description: 'Received a like' },
      comment_received: { amount: REWARD_VALUES.COMMENT_RECEIVED, description: 'Received a comment' },
      new_follower: { amount: REWARD_VALUES.NEW_FOLLOWER, description: 'Gained a new follower' },
      post_created: { amount: REWARD_VALUES.POST_CREATED, description: 'Created a post' },
      comment_created: { amount: REWARD_VALUES.COMMENT_CREATED, description: 'Posted a comment' },
    };

    const reward = actionMap[action];
    if (reward) {
      await this.awardPoints(userId, reward.amount, reward.description, action, referenceId);
    }
  }

  // Check and award milestone achievements
  async checkMilestones(userId: string): Promise<string[]> {
    const earnedMilestones: string[] = [];

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) return earnedMilestones;

    // Check rounds milestones
    if (stats.games_played >= 10) {
      const awarded = await this.tryAwardMilestone(userId, 'Weekend Warrior', REWARD_VALUES.TEN_ROUNDS);
      if (awarded) earnedMilestones.push('Weekend Warrior');
    }

    if (stats.games_played >= 50) {
      const awarded = await this.tryAwardMilestone(userId, 'Dedicated Golfer', REWARD_VALUES.FIFTY_ROUNDS);
      if (awarded) earnedMilestones.push('Dedicated Golfer');
    }

    // Check courses milestone
    if (stats.courses_played >= 5) {
      const awarded = await this.tryAwardMilestone(userId, 'Course Explorer', REWARD_VALUES.FIVE_COURSES);
      if (awarded) earnedMilestones.push('Course Explorer');
    }

    // Check social milestones
    if (stats.followers_count >= 10) {
      const awarded = await this.tryAwardMilestone(userId, 'Social Butterfly', REWARD_VALUES.TEN_FRIENDS);
      if (awarded) earnedMilestones.push('Social Butterfly');
    }

    return earnedMilestones;
  }

  private async tryAwardMilestone(userId: string, achievementName: string, points: number): Promise<boolean> {
    // Check if already earned
    const { data: achievement } = await supabase
      .from('achievements')
      .select('id')
      .eq('name', achievementName)
      .single();

    if (!achievement) return false;

    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single();

    if (existing) return false;

    // Award the achievement
    await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievement.id,
    });

    // Award points
    await this.awardPoints(userId, points, `Achievement unlocked: ${achievementName}`, 'achievement', achievement.id);

    return true;
  }

  // Record a token claim (when user claims on-chain tokens)
  async recordTokenClaim(
    userId: string,
    amount: number,
    txHash: string
  ): Promise<void> {
    // Deduct from database balance
    const balance = await this.getBalance(userId);
    if (balance < amount) {
      throw new Error('Insufficient ForePoints to claim');
    }

    // Insert claim transaction with blockchain reference
    const { error } = await supabase.from('forepoints_transactions').insert({
      user_id: userId,
      amount: -amount,
      transaction_type: 'claim',
      description: `Claimed ${amount} ForePoints as on-chain tokens`,
      blockchain_tx_hash: txHash,
    });

    if (error) {
      throw new Error('Failed to record claim');
    }

    // Update balance
    await supabase
      .from('user_stats')
      .update({ forepoints_balance: balance - amount })
      .eq('user_id', userId);
  }
}

export const rewardsService = new RewardsService();
