fetch('http://localhost:5000/blog/category/article/?category=vedic-astrology&slug=vedic-astrology-a-complete-guide-to-india-s-ancient-science-of-life&nocache=' + Date.now(), { headers: { 'User-Agent': 'Googlebot/2.1' } })
    .then(r => r.text())
    .then(t => {
        console.log('\n--- EXACT TAGS SENT TO GOOGLE ---');
        console.log(t.substring(t.indexOf('<title>'), t.indexOf('</title>') + 8));
        console.log(t.substring(t.indexOf('<meta property="og:description"'), t.indexOf('/>', t.indexOf('<meta property="og:description"')) + 2));
        console.log(t.substring(t.indexOf('<meta property="og:title"'), t.indexOf('/>', t.indexOf('<meta property="og:title"')) + 2));
    });
