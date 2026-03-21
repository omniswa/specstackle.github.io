document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("generatorForm");
  const jsonPreview = document.getElementById("jsonPreview");
  const inputs = form.querySelectorAll("input, textarea, select");

  // Attempt to intelligently default origin if run on a real server
  const currentOrigin = window.location.origin;
  if (currentOrigin && currentOrigin !== "null" && !currentOrigin.startsWith("file")) {
    document.getElementById("origin").value = currentOrigin;
  }

  // Utils
  const createSlug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  };

  const getFormattedDate = (dateString, format = 'long') => {
    if (!dateString) return { formatted: "", iso: "" };
    const dateObj = new Date(dateString);
    return {
      formatted: dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      iso: dateString // Assuming input type="date" gives YYYY-MM-DD
    };
  };

  // Smart Quotes Text Node Walker
  const replaceQuotes = (node) => {
    if (node.nodeType === 3) { // Text Node
      let text = node.nodeValue;
      // Apostrophes in words
      text = text.replace(/([a-zA-Z])'([a-zA-Z])/g, '$1’$2');
      // Standard double & single quotes
      text = text.replace(/(^|\s|\[|\(|>|-)"(.*?)"(?=$|\s|\]|\)|<|-|!|\.|,|\?|:)/g, '$1“$2”');
      text = text.replace(/(^|\s|\[|\(|>|-)'(.*?)'(?=$|\s|\]|\)|<|-|!|\.|,|\?|:)/g, '$1‘$2’');
      // Fallbacks
      text = text.replace(/"([^"]+)"/g, '“$1”');
      text = text.replace(/'([^']+)'/g, '‘$1’');
      node.nodeValue = text;
    } else if (node.nodeType === 1 && node.nodeName !== 'CODE' && node.nodeName !== 'PRE') {
      node.childNodes.forEach(replaceQuotes);
    }
  };

  const formatPrice = (value) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return "";
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Real-time JSON update
  const updatePreview = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const formattedPrice = formatPrice(data.price);

    const jsonStr = `{
  id: "${createSlug(data.model || '')}",
  brand: "${data.brand || ''}",
  model: "${data.model || ''}",
  year: "${data.yearSelect || '2026'}",
  price: "~$${formattedPrice}",
  battery: "${data.battery || ''} mAh",
  processor: "${data.processor || ''}",
  url: "reviews/${data.yearSelect || '2026'}/${createSlug(data.title || '')}.html"
}`;
    jsonPreview.textContent = jsonStr;
    return jsonStr;
  };

  // Listen to changes for preview
  inputs.forEach(input => input.addEventListener("input", updatePreview));

  // Copy JSON
  document.getElementById("copyJsonBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(jsonPreview.textContent)
      .then(() => showToast("JSON Copied!"))
      .catch(err => console.error('Failed to copy', err));
  });

  // Clear Form
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the form?")) {
      form.reset();
      updatePreview();
    }
  });

  // HTML Generation and Download Logic
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const urlSlug = createSlug(data.title);
    const idSlug = createSlug(data.model);

    // Generate today's date for the publication date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Formats as YYYY-MM-DD
    const publishDates = getFormattedDate(todayString);

    const numericPrice = data.price.replace(/[^0-9.]/g, '') || "0";

    // 1. Parse Markdown
    const rawHtml = marked.parse(data.content);

    // 2. Load into DOM for manipulation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    // 3. Apply Smart Quotes
    replaceQuotes(tempDiv);

    // 4. Wrap Tables
    tempDiv.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'specs-table';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // 5. Process External Links
    tempDiv.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && /^https?:\/\//i.test(href) && !href.startsWith(data.origin)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'nofollow noopener');
        // Wrap inner HTML in brackets with arrow
        if (!a.innerHTML.startsWith('[')) {
          a.innerHTML = `[${a.innerHTML}↗]`;
        }
      }
    });

    const finalContentHtml = tempDiv.innerHTML;

    // 6. Construct Final HTML Payload matching review.html template
    const finalTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO: Basic -->
  <title>${data.title} | SpecsTackle</title>
  <meta name="description" content="${data.metaDesc}">
  <meta name="author" content="SpecsTackle">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${data.origin}/reviews/${data.yearSelect}/${urlSlug}.html">
  <link rel="stylesheet" href="../../styles/review.css">
  <link rel="preload" href="../../fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="icon" href="../../apple-touch-icon.png" type="image/png">
  
  <!-- SEO: Open Graph (Facebook, LinkedIn, WhatsApp) -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.metaDesc}">
  <meta property="og:url" content="${data.origin}/reviews/${data.yearSelect}/${urlSlug}.html">
  <meta property="og:site_name" content="SpecsTackle">
  <meta property="og:image" content="${data.origin}/images/${idSlug}.webp">

  <!-- SEO: Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.metaDesc}">
  <meta name="twitter:image" content="${data.origin}/images/${idSlug}.webp">

  <!-- SEO: Structured Data (Schema.org) -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph":[
        {
          "@type": "TechArticle",
          "headline": "${data.title}",
          "datePublished": "${publishDates.iso}",
          "author": {
            "@type": "Organization",
            "name": "SpecsTackle"
          },
          "description": "${data.metaDesc}"
      },
        {
          "@type": "Product",
          "name": "${data.model}",
          "image": "${data.origin}/images/${idSlug}.webp",
          "description": "${data.metaDesc}",
          "brand": {
            "@type": "Brand",
            "name": "${data.brand}"
          },
          "offers": {
            "@type": "Offer",
            "url": "${data.origin}/reviews/${data.yearSelect}/${urlSlug}.html",
            "priceCurrency": "USD",
            "price": "${numericPrice}",
            "availability": "https://schema.org/InStock"
          }
      }
    ]
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
      <a href="../../index.html" class="logo">SPECSTACKLE</a>
      <div class="nav-links">
        <a href="../../blogs/index.html">Blogs</a>
        <a href="#" id="surprise">Surprise</a>
      </div>
    </nav>
  </header>
  
  <main>
    <article class="container">
      <h1>${data.title}</h1>
      <!-- Semantic Time Tag -->
      <p class="date" style="font-size: 0.85rem; color: var(--text-muted); margin-top:-10px; margin-bottom: 20px;">
        Published on <time datetime="${publishDates.iso}">${publishDates.formatted}</time>
      </p>
  
      ${finalContentHtml}
    </article>
    <section id="affiliate-section"></section>
  </main>
  
  <!-- Floating Share Button -->
  <button id="shareBtn" class="share-float" aria-label="Share this article">
    <!-- Share Icon SVG -->
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  </button>

  <!-- Toast Notification -->
  <aside id="toast" class="toast">Link Copied!</aside>

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

  <aside class="code-block"></aside>
  <script src="../../scripts/review.js" defer><\/script>
</body>

</html>`;

    // Trigger Download
    const blob = new Blob([finalTemplate], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${urlSlug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("HTML Generated!");
  });

  // Init preview on load
  updatePreview();
});