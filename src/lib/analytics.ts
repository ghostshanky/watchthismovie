import { SupabaseClient } from '@supabase/supabase-js';

export interface AnalyticsData {
    sentiment: {
        likes: number;
        dislikes: number;
        total: number;
    };
    activity: {
        month: string;
        count: number;
    }[];
}

export async function getUserAnalytics(userId: string, supabase: SupabaseClient): Promise<AnalyticsData> {
    // 1. Fetch relevant fields for all interactions
    const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('liked, created_at, has_watched')
        .eq('user_id', userId);

    if (error || !interactions) {
        console.error("Analytics fetch error:", error);
        return {
            sentiment: { likes: 0, dislikes: 0, total: 0 },
            activity: []
        };
    }

    // 2. Sentiment Analysis
    const likes = interactions.filter(i => i.liked === true).length;
    const dislikes = interactions.filter(i => i.liked === false).length;

    // 3. Activity Analysis (Last 6 Months)
    const activityMap = new Map<string, number>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Init last 6 months with 0
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${months[d.getMonth()]}`;
        activityMap.set(key, 0);
    }

    // Populate counts
    interactions.forEach(i => {
        if (!i.created_at) return;
        const d = new Date(i.created_at);
        // Only count if it falls within our window (approx check)
        const diffTime = Math.abs(today.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 180) { // Approx 6 months
            const key = `${months[d.getMonth()]}`;
            if (activityMap.has(key)) {
                activityMap.set(key, (activityMap.get(key) || 0) + 1);
            }
        }
    });

    const activity = Array.from(activityMap.entries()).map(([month, count]) => ({ month, count }));

    return {
        sentiment: {
            likes,
            dislikes,
            total: likes + dislikes
        },
        activity
    };
}
