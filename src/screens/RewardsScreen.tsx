import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { rewardsService, REWARD_VALUES } from '../services/rewards';
import { usePrivyAuth } from '../lib/privy';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  blockchain_tx_hash?: string;
}

export default function RewardsScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthStore();
  const { walletAddress, forepointsTokenBalance, isLoading: walletLoading, refreshBalances } = usePrivyAuth();

  const [databaseBalance, setDatabaseBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [balance, txHistory] = await Promise.all([
        rewardsService.getBalance(user.id),
        rewardsService.getTransactionHistory(user.id),
      ]);

      setDatabaseBalance(balance);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshBalances?.()]);
    setRefreshing(false);
  };

  const handleClaimTokens = async () => {
    const amount = parseInt(claimAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to claim');
      return;
    }

    if (amount > databaseBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough ForePoints to claim');
      return;
    }

    if (!walletAddress) {
      Alert.alert('Wallet Required', 'Please connect your wallet first');
      return;
    }

    setIsClaiming(true);
    try {
      // In production, this would call a backend API that:
      // 1. Verifies the user's balance
      // 2. Transfers tokens from treasury to user's wallet
      // 3. Records the transaction
      Alert.alert(
        'Coming Soon',
        'Token claiming will be available once the ForePoints token is created on Pump.fun. Stay tuned!'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to claim tokens. Please try again.');
    } finally {
      setIsClaiming(false);
      setClaimAmount('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return { name: 'add-circle', color: '#10B981' };
      case 'spend':
        return { name: 'remove-circle', color: '#EF4444' };
      case 'claim':
        return { name: 'wallet', color: '#8B5CF6' };
      case 'transfer_in':
        return { name: 'arrow-down-circle', color: '#3B82F6' };
      case 'transfer_out':
        return { name: 'arrow-up-circle', color: '#F59E0B' };
      default:
        return { name: 'ellipse', color: '#6B7280' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#10288F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">ForePoints</Text>
        </View>

        {/* Balance Cards */}
        <View className="px-4 mb-6">
          {/* Database Balance */}
          <View className="bg-gradient-to-r from-golf-700 to-golf-600 rounded-2xl p-6 mb-4 shadow-lg">
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={24} color="#FCD34D" />
              <Text className="text-white text-lg ml-2">Available Balance</Text>
            </View>
            <Text className="text-white text-4xl font-bold">
              {databaseBalance.toLocaleString()} FP
            </Text>
            <Text className="text-white/70 text-sm mt-2">
              Earn more by playing rounds and engaging with the community
            </Text>
          </View>

          {/* On-chain Balance (if wallet connected) */}
          {walletAddress && (
            <View className="bg-purple-600 rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center mb-2">
                <Ionicons name="wallet" size={24} color="#C4B5FD" />
                <Text className="text-white text-lg ml-2">On-Chain Tokens</Text>
              </View>
              <Text className="text-white text-4xl font-bold">
                {forepointsTokenBalance.toLocaleString()} FP
              </Text>
              <Text className="text-white/70 text-sm mt-2">
                Tradeable tokens in your wallet
              </Text>
            </View>
          )}
        </View>

        {/* Claim Tokens Section */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Claim Tokens
            </Text>
            <Text className="text-gray-600 text-sm mb-4">
              Convert your ForePoints to tradeable tokens on Solana. Tokens can be
              traded on any DEX or transferred to other wallets.
            </Text>

            {!walletAddress ? (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text className="text-yellow-800 ml-2 flex-1">
                    Connect your wallet to claim tokens
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <View className="flex-row items-center mb-3">
                  <View className="flex-1 bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 text-xs mb-1">Amount to claim</Text>
                    <Text className="text-gray-800 text-lg">
                      {claimAmount || '0'} FP
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setClaimAmount(databaseBalance.toString())}
                    className="ml-3 px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    <Text className="text-gray-700 font-medium">Max</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleClaimTokens}
                  disabled={isClaiming || databaseBalance === 0}
                  className={`py-4 rounded-xl items-center ${
                    databaseBalance > 0 ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  {isClaiming ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">
                      Claim Tokens
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* How to Earn */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            How to Earn ForePoints
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <EarnItem
              icon="golf"
              title="Complete a Round"
              points={REWARD_VALUES.POST_ROUND}
            />
            <EarnItem
              icon="star"
              title="Score a Birdie"
              points={REWARD_VALUES.BIRDIE}
            />
            <EarnItem
              icon="trophy"
              title="Score an Eagle"
              points={REWARD_VALUES.EAGLE}
            />
            <EarnItem
              icon="flame"
              title="Hole in One!"
              points={REWARD_VALUES.HOLE_IN_ONE}
            />
            <EarnItem
              icon="trending-up"
              title="Beat Personal Best"
              points={REWARD_VALUES.BEAT_PERSONAL_BEST}
            />
            <EarnItem
              icon="calendar"
              title="First Round of the Week"
              points={REWARD_VALUES.FIRST_ROUND_OF_WEEK}
            />
            <EarnItem
              icon="heart"
              title="Receive a Like"
              points={REWARD_VALUES.LIKE_RECEIVED}
            />
            <EarnItem
              icon="chatbubble"
              title="Receive a Comment"
              points={REWARD_VALUES.COMMENT_RECEIVED}
              isLast
            />
          </View>
        </View>

        {/* Transaction History */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Transaction History
          </Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-2">No transactions yet</Text>
              </View>
            ) : (
              transactions.map((tx, index) => {
                const icon = getTransactionIcon(tx.transaction_type);
                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center p-4 ${
                      index < transactions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${icon.color}20` }}
                    >
                      <Ionicons
                        name={icon.name as any}
                        size={24}
                        color={icon.color}
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-gray-800 font-medium">
                        {tx.description}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {formatDate(tx.created_at)}
                      </Text>
                    </View>
                    <Text
                      className={`font-bold ${
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {tx.amount >= 0 ? '+' : ''}
                      {tx.amount} FP
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function EarnItem({
  icon,
  title,
  points,
  isLast = false,
}: {
  icon: string;
  title: string;
  points: number;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-3 ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <View className="w-8 h-8 bg-golf-100 rounded-full items-center justify-center">
        <Ionicons name={icon as any} size={16} color="#10288F" />
      </View>
      <Text className="flex-1 text-gray-700 ml-3">{title}</Text>
      <Text className="text-golf-700 font-semibold">+{points} FP</Text>
    </View>
  );
}
