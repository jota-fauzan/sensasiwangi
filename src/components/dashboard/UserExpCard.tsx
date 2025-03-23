import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserStats {
  exp: number;
  threadCount: number;
  replyCount: number;
  cendolGiven: number;
  bataGiven: number;
  cendolReceived: number;
  bataReceived: number;
}

export default function UserExpCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get user EXP
        const { data: userData } = await supabase
          .from("users")
          .select("exp")
          .eq("id", user.id)
          .single();

        // Get thread count
        const { data: threads, count: threadCount } = await supabase
          .from("forum_threads")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        // Get reply count
        const { data: replies, count: replyCount } = await supabase
          .from("forum_replies")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        // Get votes given
        const { data: votesGiven } = await supabase
          .from("forum_votes")
          .select("vote_type")
          .eq("user_id", user.id);

        // Get votes received on threads
        const { data: threadVotesReceived } = await supabase
          .from("forum_votes")
          .select("vote_type, thread_id")
          .in(
            "thread_id",
            (threads || []).map((t) => t.id),
          );

        // Get votes received on replies
        const { data: replyVotesReceived } = await supabase
          .from("forum_votes")
          .select("vote_type, reply_id")
          .in(
            "reply_id",
            (replies || []).map((r) => r.id),
          );

        // Count votes by type
        const cendolGiven = (votesGiven || []).filter(
          (v) => v.vote_type === "cendol",
        ).length;
        const bataGiven = (votesGiven || []).filter(
          (v) => v.vote_type === "bata",
        ).length;

        const cendolReceived =
          (threadVotesReceived || []).filter((v) => v.vote_type === "cendol")
            .length +
          (replyVotesReceived || []).filter((v) => v.vote_type === "cendol")
            .length;

        const bataReceived =
          (threadVotesReceived || []).filter((v) => v.vote_type === "bata")
            .length +
          (replyVotesReceived || []).filter((v) => v.vote_type === "bata")
            .length;

        setStats({
          exp: userData?.exp || 0,
          threadCount: threadCount || 0,
          replyCount: replyCount || 0,
          cendolGiven,
          bataGiven,
          cendolReceived,
          bataReceived,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Calculate level based on EXP
  const calculateLevel = (exp: number) => {
    return Math.floor(Math.sqrt(exp / 10)) + 1;
  };

  // Calculate EXP needed for next level
  const calculateNextLevelExp = (level: number) => {
    return Math.pow(level, 2) * 10;
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-medium text-gray-900">
            Experience Points
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner text="Loading stats..." />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const level = calculateLevel(stats.exp);
  const nextLevelExp = calculateNextLevelExp(level);
  const prevLevelExp = calculateNextLevelExp(level - 1);
  const expInCurrentLevel = stats.exp - prevLevelExp;
  const expNeededForNextLevel = nextLevelExp - prevLevelExp;
  const progressPercentage = (expInCurrentLevel / expNeededForNextLevel) * 100;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-900 flex items-center">
          <Award className="h-5 w-5 mr-2 text-purple-500" />
          Experience Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              Level {level}
            </Badge>
            <span className="text-sm font-medium text-gray-700">
              {stats.exp} EXP Total
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-500">
                Progress to Level {level + 1}
              </span>
              <span className="text-gray-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-gray-100 rounded-full"
              style={
                {
                  backgroundColor: "rgb(243, 244, 246)",
                } as React.CSSProperties
              }
            />
            <div className="text-xs text-gray-500 text-right">
              {expInCurrentLevel} / {expNeededForNextLevel} EXP
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">
                  Threads
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.threadCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Replies
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.replyCount}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <ThumbsUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs font-medium text-gray-500">
                    Cendol
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  +{stats.cendolReceived} / -{stats.cendolGiven}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ThumbsDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs font-medium text-gray-500">
                    Bata
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  +{stats.bataReceived} / -{stats.bataGiven}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>EXP diberikan untuk aktivitas forum:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>+1 EXP untuk membuat thread baru</li>
              <li>+5 EXP untuk setiap Cendol yang diterima</li>
              <li>-3 EXP untuk setiap Bata yang diterima</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
