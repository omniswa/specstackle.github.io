document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("generatorForm");
  const btnClear = document.getElementById("btnClear");
  const btnCopyJson = document.getElementById("btnCopyJson");
  const outputSection = document.getElementById("outputSection");
  const jsonPreview = document.getElementById("jsonPreview");

  // Set Display Date
  const today = new Date();
  const isoDate = today.toISOString();
  const displayDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Apply Smart Quotes ONLY to text nodes
  function applySmartQuotes(node) {
    if (node.nodeType === 3) { // Text node
      let text = node.nodeValue;
      // Opening/Closing double quotes
      text = text.replace(/(^|[\s(\[{<])"/g, "$1\u201c");
      text = text.replace(/"/g, "\u201d");
      // Opening/Closing single quotes (apostrophes)
      text = text.replace(/(^|[\s(\[{<])'/g, "$1\u2018");
      text = text.replace(/'/g, "\u2019");
      node.nodeValue = text;
    } else if (node.nodeType === 1) { // Element node
      // Skip applying smart quotes inside preformatted blocks
      if (!['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(node.nodeName)) {
        for (let child of node.childNodes) {
          applySmartQuotes(child);
        }
      }
    }
  }

  function processHtmlContent(markdownText) {
    // 1. Render Markdown to Raw HTML
    const rawHtml = marked.parse(markdownText);

    // 2. Parse into DOM to manipulate safely
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawHtml;

    // 3. Auto-Wrap Tables
    tempDiv.querySelectorAll("table").forEach(table => {
      const wrapper = document.createElement("div");
      wrapper.className = "table-responsive";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // 4. Handle External Links
    const currentOrigin = window.location.origin !== "null" ? window.location.origin : "https://specstackle.top";
    tempDiv.querySelectorAll("a").forEach(a => {
      if (a.href.startsWith("http") && !a.href.startsWith(currentOrigin)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "nofollow noopener");
        // Enclose the text content in brackets
        a.textContent = `[${a.textContent}]`;
      }
    });

    // 5. Apply Smart Quotes
    applySmartQuotes(tempDiv);

    return tempDiv.innerHTML;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect inputs
    const title = document.getElementById("postTitle").value.trim();
    const year = document.getElementById("postYear").value;
    const meta = document.getElementById("postMeta").value.trim();
    const markdown = document.getElementById("postContent").value.trim();

    // Generate Slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const currentOrigin = window.location.origin !== "null" ? window.location.origin : "https://specstackle.top";

    // Process Content
    const processedContentHtml = processHtmlContent(markdown);

    // Calculate Reading Time (rough estimate based on word count)
    const wordCount = markdown.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Generate Final HTML Structure based on Blog.html template
    let finalHtml = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">

  <title>${title} | SpecsTackle Blogs</title>
  <meta name="description" content="${meta}">

  <!-- Canonical URL (Prevents duplicate content issues) -->
  <link rel="canonical" href="${currentOrigin}/blogs/${year}/${slug}.html">

  <!-- Open Graph / Facebook (For rich social sharing) -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${currentOrigin}/blogs/${year}/${slug}.html">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${meta}">
  <meta property="og:image" content="${currentOrigin}/images/${slug}.webp">
  <meta property="og:site_name" content="SpecsTackle">
  <meta property="article:published_time" content="${isoDate}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${currentOrigin}/blogs/${year}/${slug}.html">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${meta}">
  <meta name="twitter:image" content="${currentOrigin}/images/${slug}.webp">

  <link rel="icon" href="../../apple-touch-icon.png" type="image/png">
  <link rel="preload" href="../../fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../../styles/blog-index.css">
  <link rel="stylesheet" href="../../styles/blog.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${currentOrigin}/blogs/${year}/${slug}.html"
      },
      "headline": "${title}",
      "description": "${meta}",
      "image": "${currentOrigin}/images/${slug}.webp",
      "author": {
        "@type": "Organization",
        "name": "SpecsTackle",
        "url": "${currentOrigin}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SpecsTackle",
        "logo": {
          "@type": "ImageObject",
          "url": "${currentOrigin}/apple-touch-icon.png"
        }
      },
      "datePublished": "${isoDate}",
      "dateModified": "${isoDate}"
    }
  <\/script>

  <script>
    const savedTheme = localStorage.getItem('specstackle_theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
      document.documentElement.classList.add('light-theme');
    }
  <\/script>
</head>

<body>
  <header>
    <nav>
      <a href="../index.html" class="logo">SPECSTACKLE</a>
      <div class="nav-links">
        <a href="../index.html">Phones</a>
        <a href="#">Surprise</a>
      </div>
    </nav>
  </header>

  <main class="blog-container">
    <article class="blog-content">
      <section class="blog-header">
        <span class="blog-category">Softwares & Tools</span>
        <h1>${title}</h1>
        <div class="blog-meta">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${displayDate}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${readingTime}-Minute Read
          </span>
        </div>
      </section>

      <article class="article-content">
        ${processedContentHtml}
      </article>
    </article>
  </main>

  <footer>
    <div class="f-links">
      <a href="../../pages/about.html">About</a>
      <a href="../../pages/contact.html">Contact</a>
      <a href="../../pages/privacy.html">Privacy</a>
      <a href="../../pages/terms.html">Terms</a>
    </div>
    <p class="copy">&copy; <span id="year"></span> SPECSTACKLE. ALL RIGHTS RESERVED.</p>
    <div class="theme-toggle-wrapper">
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle Theme"></button>
    </div>
  </footer>

  <!-- Bottom Pills & ToC Modal Code -->
  <div id="tocModal" class="toc-modal">
    <div class="toc-modal-content">
      <div class="toc-header">
        <h3>Table of Contents</h3>
        <button id="closeToc" aria-label="Close Modal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <ul id="tocList" class="toc-list"></ul>
    </div>
  </div>

  <nav class="bottom-pill-nav">
    <button id="btnBackToTop" aria-label="Back to Top"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
    <div class="pill-divider"></div>
    <button id="btnShowToc" aria-label="Table of Contents"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
    <div class="pill-divider"></div>
    <button id="btnShare" aria-label="Share Article"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></button>
  </nav>

  <aside class="code-block"></aside>
  <script src="../../scripts/blog.js" defer><\/script>
</body>
</html>`;

    // Create and trigger Download Blob
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    // Render JSON String exactly as requested
    const jsonOutput = `{
          title: "${title}",
          published: "${displayDate}",
          excerpt: "${meta}",
          link: "blogs/${year}/${slug}.html"
        }`;
    jsonPreview.textContent = jsonOutput;
    outputSection.classList.add("active");
  });

  // Clear Form functionality
  btnClear.addEventListener("click", () => {
    form.reset();
    outputSection.classList.remove("active");
    jsonPreview.textContent = "";
  });

  // Copy JSON functionality
  btnCopyJson.addEventListener("click", () => {
    const jsonText = jsonPreview.textContent;
    navigator.clipboard.writeText(jsonText).then(() => {
      const originalText = btnCopyJson.textContent;
      btnCopyJson.textContent = "Copied!";
      setTimeout(() => {
        btnCopyJson.textContent = originalText;
      }, 2000);
    });
  });

});