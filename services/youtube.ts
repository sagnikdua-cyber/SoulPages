const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";

export const youtubeService = {
  async searchMusic(query: string) {
    if (!API_KEY) {
      console.warn("YouTube API Key missing");
      return [];
    }
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
    } catch (error) {
      console.error("YouTube search failed:", error);
      return [];
    }
  }
};
