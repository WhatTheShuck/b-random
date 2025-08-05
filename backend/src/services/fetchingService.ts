// services/fetchingService.ts
import Parser from "rss-parser";
import { db } from "../db";
import { posts, sources, type FilterRules } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

const parser = new Parser({
  customFields: {
    item: [
      ["media:group", "mediaGroup"],
      ["yt:videoId", "videoId"],
      ["media:community", "mediaCommunity"],
    ],
  },
});

export class FetchingService {
  async fetchAllSources(): Promise<void> {
    console.log("Starting scheduled fetch of all sources...");

    const activeSources = await db
      .select()
      .from(sources)
      .where(eq(sources.active, true));

    for (const source of activeSources) {
      try {
        await this.fetchSource(source);
      } catch (error) {
        console.error(`Failed to fetch source ${source.name}:`, error);
      }
    }

    console.log(`Completed fetch for ${activeSources.length} sources`);
  }

  async fetchSource(source: any): Promise<number> {
    console.log(`Fetching source: ${source.name} (${source.type})`);

    switch (source.type) {
      case "youtube":
        return await this.fetchYouTubeChannel(source);
      case "rss":
        return await this.fetchRSSFeed(source);
      case "hackernews":
        return await this.fetchHackerNews(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async fetchYouTubeChannel(source: any): Promise<number> {
    // YouTube RSS URL format: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${source.identifier}`;

    try {
      const feed = await parser.parseURL(rssUrl);
      let newPostsCount = 0;

      for (const item of feed.items) {
        // Check if we already have this video
        const existingPost = await db
          .select()
          .from(posts)
          .where(
            and(
              eq(posts.url, item.link || ""),
              eq(posts.sourceId, source.id.toString()),
            ),
          )
          .limit(1);

        if (existingPost.length > 0) {
          continue; // Skip if already exists
        }

        // Apply filtering if needed
        if (!source.fetchAll) {
          const filterRules: FilterRules = source.filterRules
            ? JSON.parse(source.filterRules)
            : {};

          if (!this.passesFilters(item, filterRules)) {
            continue;
          }
        }

        // Extract video duration if available (you might need to make additional API call)
        const duration = this.extractDuration(item);

        // Calculate initial score (we can make this more sophisticated later)
        const score = this.calculateInitialScore(item, source);

        await db.insert(posts).values({
          title: item.title || "Untitled",
          url: item.link,
          source: source.name,
          sourceType: "youtube",
          sourceId: source.id.toString(),
          content: item.contentSnippet || item.content,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          duration: duration,
          score: score,
          filtered: !source.fetchAll,
        });

        newPostsCount++;
      }

      // Update source's last fetch info
      await db
        .update(sources)
        .set({
          lastFetched: new Date(),
          lastFetchCount: newPostsCount,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, source.id));

      console.log(`Fetched ${newPostsCount} new videos from ${source.name}`);
      return newPostsCount;
    } catch (error) {
      console.error(`Error fetching YouTube channel ${source.name}:`, error);
      throw error;
    }
  }

  private async fetchRSSFeed(source: any): Promise<number> {
    try {
      const feed = await parser.parseURL(source.identifier);
      let newPostsCount = 0;

      for (const item of feed.items) {
        // Check if we already have this item
        const existingPost = await db
          .select()
          .from(posts)
          .where(
            and(
              eq(posts.url, item.link || ""),
              eq(posts.sourceId, source.id.toString()),
            ),
          )
          .limit(1);

        if (existingPost.length > 0) {
          continue;
        }

        // Apply filtering if needed
        if (!source.fetchAll) {
          const filterRules: FilterRules = source.filterRules
            ? JSON.parse(source.filterRules)
            : {};

          if (!this.passesFilters(item, filterRules)) {
            continue;
          }
        }

        const score = this.calculateInitialScore(item, source);

        await db.insert(posts).values({
          title: item.title || "Untitled",
          url: item.link,
          source: source.name,
          sourceType: "rss",
          sourceId: source.id.toString(),
          content: item.contentSnippet || item.content,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          score: score,
          filtered: !source.fetchAll,
        });

        newPostsCount++;
      }

      // Update source's last fetch info
      await db
        .update(sources)
        .set({
          lastFetched: new Date(),
          lastFetchCount: newPostsCount,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, source.id));

      console.log(`Fetched ${newPostsCount} new items from ${source.name}`);
      return newPostsCount;
    } catch (error) {
      console.error(`Error fetching RSS feed ${source.name}:`, error);
      throw error;
    }
  }

  private async fetchHackerNews(source: any): Promise<number> {
    // Placeholder for Hacker News implementation
    // You might want to use their API: https://github.com/HackerNews/API
    console.log("Hacker News fetching not implemented yet");
    return 0;
  }

  private passesFilters(item: any, rules: FilterRules): boolean {
    const title = (item.title || "").toLowerCase();
    const content = (item.contentSnippet || item.content || "").toLowerCase();

    // Check title includes
    if (rules.titleIncludes?.length) {
      const hasRequiredKeywords = rules.titleIncludes.some((keyword) =>
        title.includes(keyword.toLowerCase()),
      );
      if (!hasRequiredKeywords) return false;
    }

    // Check title excludes
    if (rules.titleExcludes?.length) {
      const hasExcludedKeywords = rules.titleExcludes.some((keyword) =>
        title.includes(keyword.toLowerCase()),
      );
      if (hasExcludedKeywords) return false;
    }

    // Check description includes
    if (rules.descriptionIncludes?.length) {
      const hasRequiredInDescription = rules.descriptionIncludes.some(
        (keyword) => content.includes(keyword.toLowerCase()),
      );
      if (!hasRequiredInDescription) return false;
    }

    // Check published date
    if (rules.publishedAfter && item.pubDate) {
      const publishedDate = new Date(item.pubDate);
      const afterDate = new Date(rules.publishedAfter);
      if (publishedDate < afterDate) return false;
    }

    // Duration checks would need additional API calls for YouTube
    // We'll implement this later if needed

    return true;
  }

  private extractDuration(item: any): number | null {
    // For now, return null. We'd need to make additional YouTube API calls
    // or parse the duration from the RSS if available
    return null;
  }

  private calculateInitialScore(item: any, source: any): number {
    // Simple initial scoring - we can make this much more sophisticated
    let score = 50; // base score

    // Newer content gets higher score
    if (item.pubDate) {
      const hoursAgo =
        (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) score += 20;
      else if (hoursAgo < 168) score += 10; // within a week
    }

    // You could add more scoring logic here based on:
    // - Keywords in title
    // - Source reputation
    // - Historical performance

    return Math.min(100, Math.max(0, score));
  }
}

export const fetchingService = new FetchingService();
