import { ManhwaSeries, Chapter, Episode } from '../types';

export const DEFAULT_SERIES: ManhwaSeries = {
  id: 'shadow-monarch',
  title: 'Solo Leveling: The Shadow Sovereign',
  koreanTitle: '나 혼자만 레벨업: 그림자의 군주',
  synopsis: 'In a world where hunters with supernatural powers battle deadly monsters to protect the human race from extinction, Sung Jin-Woo—notoriously dubbed the "Weakest Hunter of All Humanity"—finds himself in a treacherous double dungeon. On the brink of death, a mysterious quest window appears before him, granting him the unique ability to level up indefinitely. As he uncovers ancient secrets and commands an army of shadows, Jin-Woo embarks on a solitary journey to rise from the bottom to the pinnacle of power.',
  coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
  author: 'Chugong',
  artist: 'DUBU (REDICE Studio)',
  genres: ['Action', 'Dark Fantasy', 'Supernatural', 'System', 'Adventure'],
  status: 'Ongoing',
  rating: 9.88,
  totalChapters: 10,
  totalEpisodes: 60,
  updatedAt: new Date().toISOString(),
};

// Generate 100 high-performance panel URLs for an episode
// Uses curated Unsplash anime/manga aesthetic imagery & Picsum fallback
export function generateEpisodePanels(chapterNum: number, episodeNum: number, count: number = 100): string[] {
  // Deterministic seed ensures consistent panels per episode while caching smoothly
  const curatedThemes = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', // Abstract dark neon
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119', // Dark dramatic
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', // Epic mist
    'https://images.unsplash.com/photo-1563089145-599997674d42', // Neon cyber glow
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', // Night sword blade
    'https://images.unsplash.com/photo-1514539079130-25950c84af65', // Dark gothic realm
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853', // Blue magic sparks
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675', // Shadow portal
  ];

  const panels: string[] = [];
  const baseSeed = chapterNum * 100 + episodeNum * 10;

  for (let i = 1; i <= count; i++) {
    const themeIndex = (baseSeed + i) % curatedThemes.length;
    const themeBase = curatedThemes[themeIndex];
    // Dynamic height ratio common in vertical manhwas: 800w x 1100h or 1250h
    const height = 1000 + ((i * 37) % 300);
    // Combine reliable Unsplash webtoon-aesthetic seed with picsum fallback
    const url = i % 2 === 0
      ? `${themeBase}?w=800&h=${height}&auto=format&fit=crop&q=80&sig=${baseSeed + i}`
      : `https://picsum.photos/seed/manhwa-c${chapterNum}-e${episodeNum}-p${i}/800/${height}`;
    panels.push(url);
  }

  return panels;
}

// Pre-populate 10 Chapters
export const DEFAULT_CHAPTERS: Chapter[] = Array.from({ length: 10 }, (_, idx) => {
  const chapterNumber = idx + 1;
  const episodeIds = Array.from({ length: 6 }, (_, epIdx) => `ep-c${chapterNumber}-e${epIdx + 1}`);

  const chapterTitles = [
    'The Double Dungeon Awakens',
    'Daily Quest of the Weakest Hunter',
    'Subway Dungeon of the Undead',
    'The First S-Rank Encounter',
    'Raid on the Red Gate',
    'Shadow Army Rise',
    'Demon Castle Infiltration',
    'The Monarchs Convene',
    'War of the Heavenly Gates',
    'The Final Sovereign Domain',
  ];

  const descriptions = [
    'Sung Jin-Woo enters the catastrophic D-rank gate with the raid team, only to stumble upon a hidden temple of massive stone statues.',
    'Recovering in the hospital, Jin-Woo confronts the mysterious quest log system and initiates his grueling strength training.',
    'Entering an isolated instant dungeon inside an abandoned subway station to test his newly acquired bloodlust skill.',
    'Encountering dangerous hunters and confronting the reality of life-and-death stakes in private dungeon zones.',
    'A training exercise turns into a nightmare when an ordinary C-rank gate unexpectedly morphs into a freezing Red Gate.',
    'Jin-Woo unlocks the Necromancy job change, commanding fallen enemies to arise into an indestructible shadow battalion.',
    'Climbing the hundred burning floors of the Demon King Baran tower to forge the Elixir of Life.',
    'Whispers of ancient cosmic deities echo across the hunter associations worldwide as spatial rifts widen.',
    'Global monarchs stage an unprecedented invasion across Seoul, Tokyo, and San Francisco simultaneously.',
    'The sovereign of shadows unleashes the full might of his cosmic legion in an all-out battle for Earth.',
  ];

  return {
    id: `ch-${chapterNumber}`,
    chapterNumber,
    title: `Chapter ${chapterNumber}: ${chapterTitles[idx] || `Arc ${chapterNumber}`}`,
    description: descriptions[idx] || 'A pivotal arc in Sung Jin-Woo’s journey.',
    episodeCount: 6,
    episodeIds,
  };
});

// Pre-populate 60 Episodes (10 chapters * 6 episodes)
export const DEFAULT_EPISODES: Episode[] = DEFAULT_CHAPTERS.flatMap((chap) => {
  return Array.from({ length: 6 }, (_, epIdx) => {
    const episodeNumber = epIdx + 1;
    const absoluteNumber = (chap.chapterNumber - 1) * 6 + episodeNumber;
    const episodeId = `ep-c${chap.chapterNumber}-e${episodeNumber}`;

    const episodeNames = [
      'The Unforgiving Statues',
      'The Blood Sacrifice',
      'Awakening of the Player',
      'First Step Into the Abyss',
      'Trial by Iron Blood',
      'The Shadow Beckons',
    ];

    return {
      id: episodeId,
      chapterId: chap.id,
      chapterNumber: chap.chapterNumber,
      episodeNumber,
      absoluteNumber,
      title: `Ep. ${absoluteNumber} - ${episodeNames[epIdx] || `Phase ${episodeNumber}`}`,
      thumbnailUrl: `https://picsum.photos/seed/thumb-${episodeId}/400/250`,
      panelUrls: generateEpisodePanels(chap.chapterNumber, episodeNumber, 100),
      panelCount: 100,
      releaseDate: new Date(Date.now() - (60 - absoluteNumber) * 86400000 * 3).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      likesCount: 12400 + absoluteNumber * 142,
      viewsCount: 84000 + absoluteNumber * 1150,
    };
  });
});
