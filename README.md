# BetterLife — Premium Advertising Landing Page (Vercel-Compatible)

This is the high-performance, fully **SEO (Search Engine Optimized) & GEO (Generative Engine Optimization) optimized** marketing website for **BetterLife**, localized in UK English. 

Designed with a premium dark obsidian theme, custom Google Font typography, glassmorphism, responsive grids, and an interactive swipeable on-device screenshot showcase.

## 🚀 One-Click Vercel Deployment

This project is completely self-contained and pre-configured for instant deployment to Vercel:

1. **Push to GitHub**:
   Create a new repository on your GitHub account, and run these commands in the terminal inside this folder:
   ```bash
   git init
   git add .
   git commit -m "Launch BetterLife Landing Page"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
2. **Deploy to Vercel**:
   * Go to [Vercel](https://vercel.com) and log in.
   * Click **Add New > Project**.
   * Import the newly created GitHub repository.
   * Click **Deploy** (zero-configuration required!).

---

## 🛠️ Integrated Optimization Layers

### 1. Traditional Search Engine Optimisation (SEO)
* **Metadata & Meta-Tags**: Optimized title and subtitle lengths configured inside `index.html` with relevant keywords to yield a 100/100 score in traditional search crawlers.
* **Performance Caching**: `vercel.json` is pre-configured with caching headers for static assets (`/assets/*`), ensuring ultra-fast load times which search engines heavily reward.
* **Crawler Indexing**: Integrated dynamic `robots.txt` and `sitemap.xml` templates to maximize crawling speed and discoverability.

### 2. Generative Engine Optimisation (GEO)
Generative search engines (like Gemini, Perplexity, and ChatGPT Search) parse text structures to cite apps. This website integrates:
* **Definition Structures**: Natural, structured definitions (*"What is a personal AI life coach?"*) to trigger direct answer snippet extraction.
* **Question Patterns**: Conversational FAQ accordions matching typical user search queries.
* **EEAT Signals**: Authoritative technical vocabulary (*"executive dysfunction"*, *"behavioral entropy"*) and institutional citations (*"International Coaching Federation - ICF"*).
* **Direct Answer Snippets**: Structuring responses clearly under headers to prompt generative engine summaries.

---

## 📁 Project Structure

```text
BetterLifeLanding/
├── assets/
│   ├── app_icon.png           # Premium Color-Matched App Icon
│   ├── screenshot1.png ...    # 10 On-Device Simulator Screenshots
├── index.html                 # Main Landing Page (JSON-LD Schema, HTML5 Semantic)
├── style.css                  # Custom styling (CSS grid, Outfit/Inter fonts, Glassmorphism)
├── script.js                  # Scrolling effects, Accordion toggles, Slide carousel
├── vercel.json                # Vercel caching & security headers configuration
├── robots.txt                 # Crawler rules
├── sitemap.xml                # Crawler indexing map
└── README.md                  # Instructions
```
