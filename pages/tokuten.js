export default function Tokuten() {
  const gifts = [
    {
      title: "英語学習ロードマップ診断",
      thumb: "/thumb1.png",
      url: "https://whatistoeic.my.canva.site/",
    },
    {
      title: "絶対覚えたい英語文法5選",
      thumb: "/thumb2.png",
      url: "https://www.loom.com/share/d43e846efcf54961a1a1deac3fce2ef6",
    },
    {
      title: "単語マスター",
      thumb: "/thumb3.png",
      url: "https://beamish-sawine-f25dbd.netlify.app/",
    },
    {
      title: "フレーズカード",
      thumb: "/thumb4.png",
      url: "https://htmlpreview.github.io/?https://gist.githubusercontent.com/snooo310/820df2a767091e3cf468a8c5564f91a3/raw/paraphrase_app.html",
    },
    {
      title: "お悩みチェックアップ",
      thumb: "/thumb5.png",
      url: "https://htmlpreview.github.io/?https://gist.githubusercontent.com/snooo310/418638604c97021c16527e2f971d46f2/raw/diagnosis_tool.html",
    },
    {
      title: "TOEICとは？",
      thumb: "/thumb6.png",
      url: "https://www.loom.com/share/006296e36dfc4b85a555a86e623337da",
    },
    {
      title: "Englishターゲットプランナー",
      thumb: "/thumb7.png",
      url: "https://htmlpreview.github.io/?https://gist.githubusercontent.com/snooo310/b6a0cc882c47dc3e55e55142985f4bae/raw/roadmap_tool.html",
    },
  ];

  return (
    <div className="page">
      <header>
        <img src="/logo.png" alt="LeaPASS" className="logo" />
      </header>

      <main>
        <p className="intro">
          ご登録ありがとうございます！<br />
          下記より特典をお受け取りください🐨
        </p>

        <div className="gift-list">
          {gifts.map((g, i) => (
            <a key={i} href={g.url} className="gift-card" target="_blank" rel="noopener noreferrer">
              <img src={g.thumb} alt={g.title} className="thumb" />
            </a>
          ))}
        </div>

        <p className="footer-msg">
          質問や面談予約はLINEトーク画面下部から👇🏻
        </p>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          max-width: 480px;
          margin: 0 auto;
          font-family: -apple-system, "Hiragino Sans", "Yu Gothic", sans-serif;
          background: linear-gradient(160deg, #d6ecf8 0%, #f0e6f6 50%, #fde8ef 100%);
        }

        header {
          padding: 28px 20px 16px;
          text-align: center;
        }
        .logo {
          width: 160px;
          object-fit: contain;
        }

        main {
          padding: 0 16px 48px;
        }

        .intro {
          text-align: center;
          font-size: 14px;
          line-height: 1.8;
          color: #5a8899;
          margin-bottom: 24px;
          letter-spacing: 0.03em;
        }

        .gift-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .gift-card {
          display: block;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 3px 14px rgba(90, 136, 160, 0.18);
          transition: transform 0.15s, box-shadow 0.15s;
          background: white;
        }
        .gift-card:active {
          transform: scale(0.97);
        }
        .gift-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(90, 136, 160, 0.28);
        }

        .thumb {
          width: 100%;
          display: block;
          border-radius: 16px;
        }

        .footer-msg {
          margin-top: 32px;
          text-align: center;
          font-size: 13px;
          color: #7a9fad;
          line-height: 1.7;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
