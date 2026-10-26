# Deployment guide — GitHub + Cloudflare Pages

A step-by-step guide assuming no prior Cloudflare experience. Everything here
is on Cloudflare's **free** plan; nothing in this project needs a paid service,
a database, or an API key.

**The two settings that matter**, if you only read one thing:

| Setting                | Value           |
| ---------------------- | --------------- |
| **Build command**      | `npm run build` |
| **Build output directory** | `dist`      |

---

## Part 0 — What you end up with

- Your code lives on GitHub at `github.com/terrense/shenxin-website`.
- Cloudflare watches that repository. Every time you push to `main`, it
  rebuilds and redeploys the site automatically — usually in under a minute.
- The site is served free at `https://<project-name>.pages.dev`.
- A custom domain can be added later without rebuilding anything (Part 5).

---

## Part 1 — Push the code to GitHub

If this was already done for you, skip to Part 2. To verify, open
<https://github.com/terrense/shenxin-website> — you should see the project
files.

Otherwise, from the project folder:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/terrense/shenxin-website.git
git push -u origin main
```

> If `git push` asks for a password, GitHub no longer accepts your account
> password here. Either install the [GitHub CLI](https://cli.github.com) and
> run `gh auth login` once, or create a
> [personal access token](https://github.com/settings/tokens) and paste that
> in place of the password.

---

## Part 2 — Create the Cloudflare Pages project

1. Go to <https://dash.cloudflare.com> and sign in.
2. In the left sidebar choose **Compute (Workers & Pages)**.
3. Click **Create** → open the **Pages** tab → **Connect to Git**.
4. Click **Connect GitHub** and authorise Cloudflare.
   - On GitHub's permission screen you can choose **Only select
     repositories** and pick just `shenxin-website`. Cloudflare does not need
     access to your other repositories.
5. Back in Cloudflare, select **shenxin-website** from the list and click
   **Begin setup**.

---

## Part 3 — Build settings

This is the screen that decides whether the deploy works. Fill it in exactly:

| Field                        | Value                                     |
| ---------------------------- | ----------------------------------------- |
| **Project name**             | `shenxin-website`                         |
| **Production branch**        | `main`                                    |
| **Framework preset**         | `Vite` (or `None` — the fields below are what count) |
| **Build command**            | `npm run build`                           |
| **Build output directory**   | `dist`                                    |
| **Root directory**           | *(leave empty)*                           |

**Project name matters**: it becomes your free URL. Naming the project
`shenxin-website` gives you `https://shenxin-website.pages.dev`, which is what
this repository is already configured for (see Part 6 if you choose a
different name).

### Set the Node version — do not skip this

Still on the setup screen, expand **Environment variables (advanced)** and add:

| Variable name  | Value |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

Cloudflare's default Node version is older than this project needs, and the
build fails with a confusing error if you leave it unset. This one variable
prevents that.

> These are build-time variables, not secrets. This project has no secrets.

Click **Save and Deploy**.

---

## Part 4 — Watch the first build

Cloudflare streams the build log. A healthy build ends with something like:

```
[assets] OK — no cover art wired up yet; projects use their generated motifs.
vite v6.x building for production...
✓ built in 2.4s
[seo] sitemap.xml written — 8 URLs (6 projects)
Success: Assets published!
```

When it finishes you get a link like `https://shenxin-website.pages.dev`.

### Check these after the first deploy

- The home page loads and the hero animation runs.
- Click into a project, then **press F5 / reload**. The page must still load,
  not 404. (This is what `public/_redirects` is for — see Part 7.)
- Switch the language with the **EN / 中文** toggle in the header.
- Open the site on your phone.

### If the build fails

| Error in the log                         | Fix                                                        |
| ---------------------------------------- | ---------------------------------------------------------- |
| `Unsupported engine` / odd syntax errors | `NODE_VERSION` is unset or too low. Set it to `22` (Part 3). |
| `Output directory "build" not found`     | The output directory must be `dist`, not `build`.           |
| `[assets] ... not found under public/`   | `src/content/assets.ts` points at an image you have not added. Add the file or remove the entry. |
| `npm ERR! ... package-lock.json`         | Commit `package-lock.json` — it must be in the repository.  |

To retry after changing a setting: **Deployments** → **…** on the failed
deployment → **Retry deployment**.

---

## Part 5 — Updating the site from now on

There is no deploy button to press. Push to `main` and Cloudflare does the rest:

```bash
git add .
git commit -m "Update project summary"
git push
```

Watch progress under **Deployments**. Every deploy keeps its own permanent
preview URL, and **Rollback to this deployment** on any previous entry restores
it instantly — a bad change is always one click from being undone.

Pushing to any **other** branch creates a *preview* deployment at its own URL
without touching the live site. That is the safe way to try a big change.

---

## Part 6 — Changing the site URL

Whether you rename the Pages project or add a custom domain later, the site
URL appears in **three** places that must agree. They are plain text files the
bundler cannot reach into, so they are edited by hand:

1. `src/content/site.ts` → `SITE_URL`
2. `index.html` → `canonical`, `og:url`, `og:image`, `twitter:image`, and the
   `url` / `image` fields in the JSON-LD block
3. `public/robots.txt` → the `Sitemap:` line

Then commit and push. Getting this wrong does not break the site; it makes
social-media link previews and search-engine indexing point at the wrong host.

### Adding a custom domain (optional, costs the price of a domain)

You do **not** need this — `pages.dev` is permanent and free. When you want one:

1. Buy the domain. Cloudflare Registrar sells at cost, which is usually the
   cheapest option, but any registrar works.
2. **If you bought it elsewhere**, first add the domain to Cloudflare:
   dashboard → **Add a site** → enter the domain → choose the **Free** plan →
   Cloudflare shows you two nameservers → set those as the domain's
   nameservers at your registrar. Propagation takes anywhere from minutes to
   24 hours.
3. Open your Pages project → **Custom domains** → **Set up a custom domain**.
4. Enter the domain (e.g. `shenxin.dev`) and confirm. Cloudflare creates the
   DNS record itself; there is nothing to copy-paste.
5. Repeat for `www.shenxin.dev` if you want it. Cloudflare redirects one to
   the other automatically.
6. HTTPS is issued automatically and free. Give it a few minutes.
7. Do Part 6's three-file edit with the new domain, then push.

---

## Part 7 — Files in this repo that Cloudflare reads

These are already written and need no changes. Knowing what they do helps when
something looks wrong:

- **`public/_redirects`** — one line: `/*  /index.html  200`. This site is a
  single-page app, so the server has no file at `/projects/vla-lab`. This tells
  Cloudflare to serve the app shell for any unmatched path and let the app
  handle routing. **Without it, reloading any page except the home page
  returns 404.**

- **`public/_headers`** — security headers (a Content-Security-Policy, frame
  and MIME-type protections) plus cache rules: hashed assets in `/assets/*` are
  cached for a year, `index.html` is never cached so a new deploy is visible
  immediately.

- **`public/robots.txt`** and the generated **`dist/sitemap.xml`** — let search
  engines find every case study. The sitemap is rebuilt from the project files
  on every build, so adding a project cannot silently omit it.

---

## Part 8 — Running it on your own machine

```bash
npm install     # once
npm run dev     # http://localhost:5173
```

Other commands:

| Command                  | What it does                                               |
| ------------------------ | ---------------------------------------------------------- |
| `npm run build`          | Production build into `dist/` — same as Cloudflare runs     |
| `npm run preview`        | Serve the built `dist/` locally to check it before pushing |
| `npm run check`          | Everything: assets, types, contrast, build, CSS audit      |
| `npm run check:contrast` | Verifies every text colour meets its WCAG target            |
| `npm run format`         | Prettier across the project                                 |
| `npm run og`             | Regenerates the social preview image (needs `sharp`)        |

Running `npm run check` before pushing catches essentially everything
Cloudflare would catch, but in seconds and without using a build minute.
