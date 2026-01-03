import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { StatusVideoBackground } from '@/components/layout/StatusVideoBackground';
import { TierListCard } from '@/components/tierlist/TierListCard';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { usePublicTierLists } from '@/hooks/useTierLists';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Playlist, usePlaylistItems } from '@/hooks/usePlaylist';
import { getProxiedImageUrl } from '@/lib/api';
import { 
  Users, Layers, Music2, Search, TrendingUp, Clock, 
  Heart, ChevronRight, Sparkles, Globe, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Hook to fetch public playlists from all users
function usePublicPlaylists() {
  return useQuery({
    queryKey: ['community_public_playlists'],
    queryFn: async () => {
      // First get public playlists
      const { data: playlists, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (playlistError) throw playlistError;
      if (!playlists || playlists.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(playlists.map(p => p.user_id))];
      
      // Fetch profiles for those users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Map profiles by user_id
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine playlists with profiles
      return playlists.map(playlist => ({
        ...playlist,
        profiles: profileMap.get(playlist.user_id) || { 
          username: 'unknown', 
          display_name: 'Unknown User', 
          avatar_url: null 
        }
      })) as (Playlist & { profiles: { username: string; display_name: string; avatar_url: string | null } })[];
    },
  });
}

// Community playlist card with user info
function CommunityPlaylistCard({ playlist }: { playlist: Playlist & { profiles: { username: string; display_name: string; avatar_url: string | null } } }) {
  const { data: items = [] } = usePlaylistItems(playlist.id);
  const navigate = useNavigate();
  const coverImages = items.slice(0, 4).map(item => item.anime_poster).filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div 
        className="cursor-pointer"
        onClick={() => navigate(`/playlist/${playlist.id}`)}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3 transition-all group-hover:ring-2 group-hover:ring-primary/50">
          {coverImages.length > 0 ? (
            <div className={cn(
              "grid w-full h-full",
              coverImages.length === 1 && "grid-cols-1",
              coverImages.length === 2 && "grid-cols-2",
              coverImages.length >= 3 && "grid-cols-2 grid-rows-2"
            )}>
              {coverImages.map((img, idx) => (
                <img
                  key={idx}
                  src={getProxiedImageUrl(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ))}
              {coverImages.length === 3 && (
                <div className="bg-muted/50 flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Music2 className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>

        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {playlist.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {playlist.items_count} anime
        </p>
      </div>
      
      {/* User info */}
      <Link 
        to={`/@${playlist.profiles.username}`}
        className="flex items-center gap-2 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={playlist.profiles.avatar_url || '/placeholder.svg'} 
          alt=""
          className="w-5 h-5 rounded-full object-cover"
        />
        <span>@{playlist.profiles.username}</span>
      </Link>
    </motion.div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: tierLists = [], isLoading: loadingTierLists } = usePublicTierLists();
  const { data: playlists = [], isLoading: loadingPlaylists } = usePublicPlaylists();

  // Filter based on search
  const filteredTierLists = tierLists.filter(tl => 
    tl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tl.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlaylists = playlists.filter(pl =>
    pl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pl.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = loadingTierLists || loadingPlaylists;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StatusVideoBackground />
      <Sidebar />
      
      <main className="relative z-10 pl-0 md:pl-20 lg:pl-24 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black flex items-center gap-3 mb-2">
              <Users className="w-10 h-10 text-primary" />
              Community
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover tier lists and playlists shared by the community
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tier lists and playlists..."
              className="pl-12 h-12 bg-muted/30 border-white/5"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-muted/30 border border-white/5">
              <TabsTrigger value="all" className="gap-2">
                <Sparkles className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="tierlists" className="gap-2">
                <Layers className="w-4 h-4" />
                Tier Lists
              </TabsTrigger>
              <TabsTrigger value="playlists" className="gap-2">
                <Music2 className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            {/* All Content */}
            <TabsContent value="all" className="space-y-12">
              {/* Tier Lists Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                    Popular Tier Lists
                  </h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveTab('tierlists')}
                    className="gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {loadingTierLists ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredTierLists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTierLists.slice(0, 6).map((tierList, index) => (
                      <motion.div
                        key={tierList.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TierListCard tierList={tierList} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <GlassPanel className="p-8 text-center">
                    <Layers className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No tier lists found</p>
                  </GlassPanel>
                )}
              </section>

              {/* Playlists Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Music2 className="w-6 h-6 text-primary" />
                    Community Playlists
                  </h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveTab('playlists')}
                    className="gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {loadingPlaylists ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-square bg-muted rounded-xl animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredPlaylists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPlaylists.slice(0, 10).map((playlist, index) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <CommunityPlaylistCard playlist={playlist} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <GlassPanel className="p-8 text-center">
                    <Music2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No public playlists found</p>
                  </GlassPanel>
                )}
              </section>
            </TabsContent>

            {/* Tier Lists Only */}
            <TabsContent value="tierlists">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Layers className="w-6 h-6 text-primary" />
                  All Tier Lists
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredTierLists.length})
                  </span>
                </h2>
                <Button onClick={() => navigate('/tierlists')} className="gap-2">
                  <Layers className="w-4 h-4" />
                  Create Tier List
                </Button>
              </div>
              
              {loadingTierLists ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredTierLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTierLists.map((tierList, index) => (
                    <motion.div
                      key={tierList.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <TierListCard tierList={tierList} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassPanel className="p-12 text-center">
                  <Layers className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No tier lists found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try a different search term' : 'Be the first to create a tier list!'}
                  </p>
                  <Button onClick={() => navigate('/tierlists')}>Create Tier List</Button>
                </GlassPanel>
              )}
            </TabsContent>

            {/* Playlists Only */}
            <TabsContent value="playlists">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Music2 className="w-6 h-6 text-primary" />
                  All Playlists
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredPlaylists.length})
                  </span>
                </h2>
                <Button onClick={() => navigate('/playlists')} className="gap-2">
                  <Music2 className="w-4 h-4" />
                  Create Playlist
                </Button>
              </div>
              
              {loadingPlaylists ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-square bg-muted rounded-xl animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredPlaylists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <CommunityPlaylistCard playlist={playlist} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassPanel className="p-12 text-center">
                  <Music2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No playlists found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try a different search term' : 'Be the first to share a playlist!'}
                  </p>
                  <Button onClick={() => navigate('/playlists')}>Create Playlist</Button>
                </GlassPanel>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
