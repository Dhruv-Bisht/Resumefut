<div align="center">

# ResumeFUT

### GET SCOUTED. ⚽

**Your resume, turned into a football-style player card rated out of 99.**

<a href="https://resumefut.vercel.app"><strong>Live Demo ↗</strong></a> ·
<a href="https://github.com/Dhruv-Bisht/Resumefut"><strong>GitHub ↗</strong></a>

<br />

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 🃏 What is ResumeFUT?

ResumeFUT turns a resume into a football-style scouting card.

```text
RESUME
  ↓
SCOUT
  ↓
PLAYER CARD
  ↓
DOWNLOAD / SHARE / ⚔️ DERBY
```

<div align="center">
<img src="./docs/assets/resumefut-hero.png" width="12.5%" alt="ResumeFUT" />
</div>

---

## ✨ What it does

- 📄 Upload a resume PDF or paste resume text.
- 🃏 Generates a football-style card with an overall rating and six scouting stats.
- 📷 Customize the card with a photo and nationality.
- ⬇️ Download the finished card as a PNG.
- ⚔️ Compare your card against another resume in Derby Mode.

---

## 📊 Scouting stats

ResumeFUT scores six areas:

| Stat | Measures |
|---|---|
| **EXP** | Experience |
| **SKL** | Skills |
| **LED** | Leadership |
| **IMP** | Impact |
| **EDU** | Education |
| **VER** | Versatility |


---

## 🚀 Run locally

### 1. Clone

```bash
git clone https://github.com/Dhruv-Bisht/Resumefut.git
cd Resumefut
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

---

## 🛠️ Tech stack

- **Next.js 14**
- **React 18**
- **Tailwind CSS**
- **pdfjs-dist** for PDF text extraction
- **html-to-image** for PNG card export
- **Lightweight ridge-regression model** for rating calibration

---

## 🤝 Contributing

ResumeFUT is open source. Contributions are welcome for scoring, resume parsing, card design, animations, and new features.

```bash
git checkout -b feature/my-change
git add .
git commit -m "feat: improve scouting experience"
git push origin feature/my-change
```

Then open a pull request.

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE).

---

<div align="center">

### Resume in. Card out. 🃏

**Get scouted.**

</div>

<div align="right">

**Inspired by** [GitFut](https://gitfut.com/) · [LeetFut](https://leetfut-one.vercel.app/)

</div>
