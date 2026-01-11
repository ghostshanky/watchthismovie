import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/', // Don't let Google index private dashboards
    },
    sitemap: 'https://watchthismovie.online/sitemap.xml',
  }
}