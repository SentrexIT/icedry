IceDry Website — GitHub Pages Setup Guide
Modern, AI-first website for icedry.co.uk  
A division of Sentrex Services UK Ltd
---
🚀 Deploy to GitHub Pages (Step-by-Step)
Step 1 — Create a GitHub Repository
Go to github.com and sign in (or create a free account)
Click "New repository" (green button, top right)
Name it: `icedry-website` (or `icedry.co.uk`)
Set to Public
Click "Create repository"
---
Step 2 — Upload Your Files
Option A — Upload via browser (easiest):
In your new repository, click "uploading an existing file"
Drag and drop `index.html` and `README.md`
Click "Commit changes"
Option B — Using Git (for ongoing updates):
```bash
git clone https://github.com/YOUR-USERNAME/icedry-website.git
cd icedry-website
# Copy your files in, then:
git add .
git commit -m "Initial website upload"
git push origin main
```
---
Step 3 — Enable GitHub Pages
In your repository, go to Settings (top menu)
Scroll down to "Pages" (left sidebar)
Under "Source", select "Deploy from a branch"
Branch: `main` | Folder: `/ (root)`
Click Save
Wait 1–2 minutes, then your site is live at:  
`https://YOUR-USERNAME.github.io/icedry-website/`
---
Step 4 — Connect Your Custom Domain (icedry.co.uk)
In GitHub:
Settings → Pages → Custom domain
Enter: `icedry.co.uk`
Click Save — GitHub will create a `CNAME` file automatically
In your domain registrar (e.g. GoDaddy, Namecheap, 123-reg):
Add these DNS records:
Type	Name	Value
A	@	185.199.108.153
A	@	185.199.109.153
A	@	185.199.110.153
A	@	185.199.111.153
CNAME	www	YOUR-USERNAME.github.io
Enable HTTPS (free, automatic):
Wait ~10 minutes for DNS to propagate
In GitHub Pages settings, tick "Enforce HTTPS" ✅
Your site will then be live and secure at https://icedry.co.uk
---
🤖 Setting Up the AI Chat Assistant
The AI assistant uses the Anthropic Claude API. There are two ways to set it up:
---
Option A — Quick Demo Setup (GitHub Pages, internal use)
> ⚠️ **Only use this for internal demos or testing.** This puts your API key in client-side code which is visible to anyone who views the page source.
Get an API key from console.anthropic.com
Open `index.html` and find this section near the bottom:
```javascript
const CONFIG = {
  ANTHROPIC_API_KEY: '',   // ← Paste your key here
  API_ENDPOINT: '',
  USE_DIRECT_API: true,
};
```
Replace the empty string with your key:
```javascript
ANTHROPIC_API_KEY: 'sk-ant-api03-...',
```
Save and push to GitHub — the AI chat will work immediately.
---
Option B — Production Setup (Recommended for public site)
Use a serverless function to keep your API key secure on the server side.
Using Netlify Functions:
Create file: `netlify/functions/ask.js`
```javascript
const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { question, history = [] } = JSON.parse(event.body);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages = history.length > 0 ? history : [{ role: 'user', content: question }];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `You are the IceDry AI assistant — specialist in dry ice blasting and CO₂ cleaning...`,
    messages,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer: response.content[0].text }),
  };
};
```
In `index.html`, update CONFIG:
```javascript
const CONFIG = {
  ANTHROPIC_API_KEY: '',
  API_ENDPOINT: '/.netlify/functions/ask',
  USE_DIRECT_API: false,
};
```
Add your API key in Netlify: Site Settings → Environment Variables  
Key: `ANTHROPIC_API_KEY`  
Value: `sk-ant-api03-...`
---
📁 File Structure
```
icedry-website/
├── index.html          ← Main website (everything in one file)
├── README.md           ← This setup guide
└── CNAME               ← Auto-created by GitHub Pages (don't edit)
```
---
✏️ Customising the Website
Update contact details:
Search for `0800 XXX XXXX` and replace with your real phone number.  
Search for `info@icedry.co.uk` — update if needed.
Add real photography:
The gallery currently uses placeholder icons. To add real before/after photos:
Upload images to your repository (e.g. `images/mould-before.jpg`)
Replace `<div class="gallery-item">` blocks with `<img>` tags
Update the address:
Search for `Manchester, North West England` and update with your full address.
---
🔒 Security Checklist
[x] HTTPS enforced via GitHub Pages (free SSL certificate)
[x] No sensitive data in client-side code (if using Option B for API)
[x] Form submissions — connect to Netlify Forms or Formspree for real delivery
[ ] Add real phone number
[ ] Add Google Analytics or similar if needed
---
📧 Making the Contact Form Work
Currently the form shows a success message but doesn't send emails. To wire it up:
Easiest option — Formspree (free tier available):
Go to formspree.io and create an account
Create a new form — get your form endpoint URL
In `index.html`, change `<form id="contact-form" onsubmit="handleFormSubmit(event)">` to:
```html
<form id="contact-form" action="https://formspree.io/f/YOUR-FORM-ID" method="POST">
```
Remove the `onsubmit` handler and the JS form function
---
🆘 Need Help?
Contact your web developer or raise a GitHub issue in this repository.
For IceDry service enquiries: info@icedry.co.uk
