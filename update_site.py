import re

# Update HTML
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add boxicons script
if 'boxicons' not in content:
    content = content.replace('</head>', '  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">\n</head>')

# Replace nav logo with img (ensure we match properly)
content = re.sub(
    r'<svg class="nav-logo-bug".*?</svg>',
    r'<img src="wildbugs-logo.png" alt="Wild Bugs" class="nav-logo-bug" />',
    content,
    flags=re.DOTALL
)

# Replace footer logo with img
content = re.sub(
    r'<div class="footer-logo">\s*<svg.*?</svg>',
    r'<div class="footer-logo">\n            <img src="wildbugs-logo.png" alt="Wild Bugs Logo" class="footer-logo-img" />',
    content,
    flags=re.DOTALL
)

# Replaces emojis
replacements = {
    '🐞': '<i class="bx bxs-bug"></i>',
    '🚀': '<i class="bx bx-rocket"></i>',
    '⚙️': '<i class="bx bxs-cog"></i>',
    '👨‍💻': '<i class="bx bxs-group"></i>',
    '☕': '<i class="bx bxs-coffee"></i>',
    '🎨': '<i class="bx bxs-palette"></i>',
    '🔧': '<i class="bx bxs-wrench"></i>',
    '🔄': '<i class="bx bx-repost"></i>',
    '✉️': '<i class="bx bxs-envelope"></i>',
    '📧': '<i class="bx bxs-paper-plane"></i>',
    '📍': '<i class="bx bxs-map"></i>',
    '⏱️': '<i class="bx bxs-time"></i>',
    '⚡': '<i class="bx bxs-zap"></i>',
    '🟨': '<i class="bx bxl-javascript" style="color:#f7df1e"></i>',
    '🟦': '<i class="bx bxl-typescript" style="color:#3178c6"></i>',
    '🟢': '<i class="bx bxl-nodejs" style="color:#339933"></i>',
    '🐘': '<i class="bx bxl-postgresql" style="color:#4169e1"></i>',
    '🗄️': '<i class="bx bxl-mongodb" style="color:#47a248"></i>',
    '☁️': '<i class="bx bxl-aws" style="color:#ff9900"></i>',
    '🎭': '<i class="bx bxl-figma" style="color:#f24e1e"></i>',
    '🐳': '<i class="bx bxl-docker" style="color:#2496ed"></i>',
    '🔥': '<i class="bx bxl-firebase" style="color:#ffca28"></i>'
}

for emoji, boxicon in replacements.items():
    content = content.replace(emoji, boxicon)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html!")

# Update CSS
with open('style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Make the bug logo images consistent
if '.nav-logo-bug {' in css_content:
    css_content = css_content.replace(
        '.nav-logo-bug {\n  width: 36px; height: 36px;\n  transition: transform var(--transition);\n}',
        '.nav-logo-bug {\n  width: 36px; height: 36px; object-fit: contain;\n  transition: transform var(--transition);\n}'
    )

if '.footer-logo-img {' not in css_content:
    css_content += '''
/* Footer Logo */
.footer-logo-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
}
.bx, .bxs, .bxl {
    font-size: 1.2em;
    vertical-align: middle;
}
.runaway-bug {
    cursor: crosshair;
}
.runaway-bug:hover {
    transform: scale(1.2) !important;
}
'''
with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updated style.css!")

# Update JS
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

new_js = '''
/* ─────────────────────────────────────────────
   21. FUNNY INTERACTIVE EASTER EGGS
───────────────────────────────────────────── */
(function initFunnyInteractions() {
  // Easter egg: squish effect when clicking on empty parts of the page
  let squishCount = 0;
  document.body.addEventListener('mousedown', (e) => {
    // Only squish if clicking on general background, not on buttons or links
    if(e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    
    squishCount++;
    if (squishCount > 3) {
      const squish = document.createElement('i');
      squish.className = 'bx bxs-dizzy'; // Dizzy face like a squished bug
      squish.style.position = 'fixed';
      squish.style.left = e.clientX + 'px';
      squish.style.top = e.clientY + 'px';
      squish.style.transform = 'translate(-50%, -50%)';
      squish.style.fontSize = '3rem';
      squish.style.color = '#4CAF50';
      squish.style.pointerEvents = 'none';
      squish.style.zIndex = '10000';
      squish.style.opacity = '1';
      squish.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.appendChild(squish);
      
      requestAnimationFrame(() => {
        squish.style.transform = 'translate(-50%, -150%) scale(0.5)';
        squish.style.opacity = '0';
      });
      
      setTimeout(() => squish.remove(), 500);
      squishCount = 0; // Reset
    }
  });

  // Random bugs crawling across the screen every few seconds
  setInterval(() => {
    if (Math.random() > 0.4) return; // 40% chance every 4s
    if (document.hidden) return;
    
    const bug = document.createElement('i');
    bug.className = 'bx bxs-bug runaway-bug';
    bug.style.position = 'fixed';
    bug.style.zIndex = '9995';
    bug.style.fontSize = Math.floor(Math.random() * 15 + 15) + 'px'; // 15-30px
    bug.style.color = Math.random() > 0.5 ? '#111' : '#4CAF50';
    
    // Start side
    const side = Math.floor(Math.random() * 4);
    let startX, startY;
    if (side === 0) { startX = -50; startY = Math.random() * window.innerHeight; } // left
    else if (side === 1) { startX = window.innerWidth + 50; startY = Math.random() * window.innerHeight; } // right
    else if (side === 2) { startX = Math.random() * window.innerWidth; startY = -50; } // top
    else { startX = Math.random() * window.innerWidth; startY = window.innerHeight + 50; } // bottom
    
    bug.style.left = startX + 'px';
    bug.style.top = startY + 'px';
    
    // Target
    const targetX = Math.random() * window.innerWidth;
    const targetY = Math.random() * window.innerHeight;
    
    const angle = Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI) + 90;
    bug.style.transform = `rotate(${angle}deg)`;
    bug.style.transition = 'all ' + (Math.random() * 4 + 4) + 's linear';
    
    document.body.appendChild(bug);
    
    // Move slightly after append to trigger transition
    setTimeout(() => {
      // Extend target way past screen
      const extendX = startX + (targetX - startX) * 5;
      const extendY = startY + (targetY - startY) * 5;
      bug.style.left = extendX + 'px';
      bug.style.top = extendY + 'px';
    }, 50);
    
    // Cleanup
    setTimeout(() => bug.remove(), 10000);
    
    // Interactivity: Squish bug if clicked
    bug.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const currentRect = bug.getBoundingClientRect();
      bug.style.transition = 'none'; // Stop moving immediately
      bug.style.left = currentRect.left + 'px';
      bug.style.top = currentRect.top + 'px';
      
      bug.className = 'bx bxs-dizzy'; // Dead bug
      bug.style.color = '#E53935'; // Red indicating squished
      
      requestAnimationFrame(() => {
        bug.style.transition = 'all 0.5s ease-out';
        bug.style.transform = `rotate(${angle}deg) scale(1.8)`;
        bug.style.opacity = '0';
      });
      setTimeout(() => bug.remove(), 500);
    });

  }, 4000);
})();
'''

if 'FUNNY INTERACTIVE EASTER EGGS' not in js_content:
    with open('script.js', 'a', encoding='utf-8') as f:
        f.write('\n' + new_js)
    print("Updated script.js!")
