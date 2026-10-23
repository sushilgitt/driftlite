import { redirect } from "react-router";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // No shop-domain form: App Store apps must be installed and opened from
  // Shopify (App Store / admin), never by typing a myshopify.com URL here.
  return null;
};

const FEATURES = [
  {
    title: "Image Optimizer",
    text: "Converts product photos to WebP and replaces them on the product. Image order and variant images stay the same.",
  },
  {
    title: "Alt Text AI",
    text: "Writes accurate alt text from what is in each image, so you meet accessibility guidelines and help SEO.",
  },
  {
    title: "Speed Report",
    text: "Runs Google Lighthouse on any product page and shows the file size you saved.",
  },
];

export default function App() {
  return (
    <main className={styles.page}>
      <section className={styles.band}>
        <div className={styles.shell}>
          <header className={styles.brand}>
            <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
              <rect width="24" height="24" rx="6" fill="#22D3EE" />
              <path d="M4.5 10.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0" fill="none" stroke="#0B1B33" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M4.5 15.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0" fill="none" stroke="#0B1B33" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="18.6" cy="5.6" r="1.7" fill="#F2665A" />
            </svg>
            DriftLite
          </header>
          <h1 className={styles.heading}>
            Every product photo, <span>lighter.</span>
          </h1>
          <p className={styles.text}>
            DriftLite shrinks your Shopify product images, writes alt text with AI and measures
            how much faster your product pages load.
          </p>
          <p className={styles.note}>
            Install DriftLite from the Shopify App Store, then open it from <strong>Apps</strong> in
            your Shopify admin.
          </p>
        </div>
      </section>

      <section className={styles.shell}>
        <ol className={styles.list}>
          {FEATURES.map((f, i) => (
            <li key={f.title}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
