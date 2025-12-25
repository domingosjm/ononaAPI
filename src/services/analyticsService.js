import bloggerService from './bloggerService';

class AnalyticsService {
  async getBlogStats() {
    try {
      const posts = await bloggerService.getAllPosts();
      const blog = await bloggerService.getBlog();

      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.status === 'LIVE').length;
      const draftPosts = posts.filter(p => p.status === 'DRAFT').length;

      // Contagem de tags
      const tagMap = new Map();
      posts.forEach(post => {
        if (post.labels) {
          post.labels.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        }
      });

      const tagStats = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      return {
        blogName: blog.name,
        totalPosts,
        publishedPosts,
        draftPosts,
        topTags: tagStats.slice(0, 10)
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
