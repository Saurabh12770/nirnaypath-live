'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const BlogPost = require('../models/BlogPost');

const publicPath = path.join(__dirname, '../public');

/**
 * GET /robots.txt
 * Serves search engine crawl directives.
 */
router.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

/**
 * GET /sitemap.xml
 * Dynamic XML sitemap generation aggregating blog articles, exam landing pages, and core pages.
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const domain = `${req.protocol}://${req.get('host')}`;
        const lastMod = new Date().toISOString().split('T')[0];

        // 1. Core pages
        const pages = [
            { loc: '/', changefreq: 'daily', priority: '1.0' },
            { loc: '/about', changefreq: 'monthly', priority: '0.6' },
            { loc: '/blog', changefreq: 'daily', priority: '0.8' }
        ];

        // 2. Exam landing pages
        const exams = ['upsc', 'ssc', 'banking', 'railway'];
        exams.forEach(ex => {
            pages.push({ loc: `/exams/${ex}`, changefreq: 'weekly', priority: '0.8' });
        });

        // 3. Blog articles
        const posts = await BlogPost.find({ isPublished: true }).select('slug updatedAt').lean();
        posts.forEach(post => {
            const postDate = new Date(post.updatedAt).toISOString().split('T')[0];
            pages.push({ loc: `/blog/${post.slug}`, lastmod: postDate, changefreq: 'weekly', priority: '0.7' });
        });

        // Construct XML string
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        pages.forEach(p => {
            xml += `  <url>\n`;
            xml += `    <loc>${domain}${p.loc}</loc>\n`;
            if (p.lastmod || lastMod) {
                xml += `    <lastmod>${p.lastmod || lastMod}</lastmod>\n`;
            }
            xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
            xml += `    <priority>${p.priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('[SEO] Sitemap generation failed:', err);
        res.status(500).send('Error generating sitemap');
    }
});

/**
 * GET /api/seo/schema
 * Get dynamic structured schema markup (JSON-LD) for landing pages.
 */
router.get('/api/seo/schema', (req, res) => {
    const { type, name, description, url } = req.query;

    const baseSchema = {
        "@context": "https://schema.org",
        "@type": type || "WebSite",
        "name": name || "NirnayPath",
        "description": description || "Intelligent learning companion and test preparation platform for Indian competitive exams.",
        "url": url || `${req.protocol}://${req.get('host')}/`
    };

    if (type === 'Course') {
        baseSchema.provider = {
            "@type": "Organization",
            "name": "NirnayPath",
            "sameAs": `${req.protocol}://${req.get('host')}`
        };
    }

    res.json(baseSchema);
});

/**
 * GET /exams/:examId
 * Serves optimized SEO exam landing pages.
 * Replaces meta tags inside index.html dynamically to supply proper OpenGraph / Twitter Cards details.
 */
router.get('/exams/:examId', async (req, res) => {
    try {
        const examId = req.params.examId.toLowerCase();
        const examNames = {
            upsc: 'UPSC Civil Services',
            ssc: 'SSC CGL & CHSL',
            banking: 'SBI & IBPS PO/Clerk',
            railway: 'RRB NTPC & Group D'
        };

        const examName = examNames[examId] || 'Indian Competitive Exam';
        const title = `${examName} Exam Preparation | Live Mocks & AI Tutor | NirnayPath`;
        const desc = `Access free syllabus-aligned mock tests, adaptive topic drills, and instant bilingual AI explanations for the ${examName} exam.`;

        const templatePath = path.join(publicPath, 'index.html');
        if (!fs.existsSync(templatePath)) {
            return res.status(404).send('Template index.html not found');
        }

        let html = fs.readFileSync(templatePath, 'utf8');

        // Inject dynamic headers
        html = html
            .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
            .replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${desc}" />`)
            // OpenGraph tags
            .replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${title}" />`)
            .replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${desc}" />`)
            .replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${req.protocol}://${req.get('host')}/exams/${examId}" />`)
            // Twitter Cards
            .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`)
            .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${desc}" />`);

        res.send(html);
    } catch (err) {
        console.error('[SEO] Exam page render error:', err);
        res.status(500).sendFile(path.join(publicPath, 'index.html'));
    }
});

/* ─── BLOG ENGINE ENDPOINTS ────────────────────────────────────────── */

/**
 * GET /api/seo/blog
 * List published blog articles.
 */
router.get('/api/seo/blog', async (req, res) => {
    try {
        const posts = await BlogPost.find({ isPublished: true })
            .sort({ publishedAt: -1 })
            .lean();
        res.json(posts);
    } catch (err) {
        console.error('[SEO] Fetch blog list error:', err.message);
        res.status(500).json({ error: 'Failed to fetch blog list.' });
    }
});

/**
 * POST /api/seo/blog
 * Admin only: Create a blog post.
 */
router.post('/api/seo/blog', async (req, res) => {
    try {
        const { title, slug, content, tags, metaTitle, metaDescription, schemaType } = req.body;
        if (!title || !slug || !content) {
            return res.status(400).json({ error: 'Title, unique slug, and content are required.' });
        }

        const post = new BlogPost({
            title,
            slug: slug.toLowerCase(),
            content,
            tags: tags || [],
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || 'A helpful article from NirnayPath',
            schemaType: schemaType || 'BlogPosting'
        });

        await post.save();
        res.json({ message: 'Blog post created successfully', post });
    } catch (err) {
        console.error('[SEO] Create blog error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /blog/:slug
 * Serve blog post page with precise dynamic meta tags.
 */
router.get('/blog/:slug', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
        if (!post) {
            return res.status(404).send('Blog article not found');
        }

        const templatePath = path.join(publicPath, 'index.html');
        if (!fs.existsSync(templatePath)) {
            return res.status(404).send('Template index.html not found');
        }

        let html = fs.readFileSync(templatePath, 'utf8');

        const title = `${post.metaTitle || post.title} | NirnayPath Blog`;
        const desc = post.metaDescription || post.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';

        // Structured Article schema injection
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": post.schemaType || "BlogPosting",
            "headline": post.title,
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt,
            "author": {
                "@type": "Person",
                "name": post.author
            },
            "publisher": {
                "@type": "Organization",
                "name": "NirnayPath",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${req.protocol}://${req.get('host')}/logo.png`
                }
            },
            "description": desc
        };

        const schemaHtml = `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;

        html = html
            .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
            .replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${desc}" />`)
            .replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${title}" />`)
            .replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${desc}" />`)
            .replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${req.protocol}://${req.get('host')}/blog/${post.slug}" />`)
            .replace(/<\/head>/i, `${schemaHtml}\n</head>`);

        res.send(html);
    } catch (err) {
        console.error('[SEO] Blog render error:', err);
        res.status(500).sendFile(path.join(publicPath, 'index.html'));
    }
});

module.exports = router;
