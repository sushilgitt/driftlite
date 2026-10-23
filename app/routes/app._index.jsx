import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import { Page, Button, Badge, Icon } from "@shopify/polaris";
import {
  ImageMagicIcon,
  MagicIcon,
  AutomationIcon,
  GaugeIcon,
  PlanIcon,
  ImagesIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";
import { LogoMark, Meter } from "../components/Brand";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Independent lookups, run concurrently. Usage/settings fall back to defaults
  // if their tables aren't ready.
  const [plan, usage, autoOptimize] = await Promise.all([
    getBillingStateCached(admin, session.shop)
      .then((state) => state.plan)
      .catch((e) => {
        if (e instanceof Response) throw e; // let re-auth propagate
        return null;
      }),
    getUsage(session.shop).catch(() => ({ imagesUsed: 0 })),
    db.shopSettings.findUnique({ where: { shop: session.shop } })
      .then((settings) => settings?.autoOptimize ?? false)
      .catch(() => false),
  ]);

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};


// First day of next month (UTC), when the image quota resets.
function resetLabel() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const remaining = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();

  const autoStatus = !plan.autoOptimizeAllowed
    ? { label: "Growth plan", tone: "attention" }
    : autoOptimize
      ? { label: "On", tone: "success" }
      : { label: "Off", tone: undefined };

  const tools = [
    {
      icon: ImageMagicIcon,
      title: "Image Optimizer",
      desc: "Convert heavy JPEG and PNG product photos to WebP and replace them on the product, keeping image order, variant images and the featured photo.",
      cta: "Optimize images",
      onClick: () => navigate("/app/optimize"),
      available: true,
    },
    {
      icon: MagicIcon,
      title: "Alt Text AI",
      desc: "Describes each product photo for shoppers and search engines. Review the text, then apply it in one click.",
      cta: plan.altText ? "Write alt text" : "See plans",
      onClick: () => navigate(plan.altText ? "/app/alt-text" : "/app/plan"),
      available: plan.altText,
      badge: plan.altText ? undefined : { label: "Starter+", tone: "attention" },
    },
    {
      icon: AutomationIcon,
      title: "Auto-Optimize",
      desc: "Every new product is optimized in the background as soon as it is created.",
      cta: plan.autoOptimizeAllowed ? "Manage" : "See plans",
      onClick: () => navigate(plan.autoOptimizeAllowed ? "/app/optimize" : "/app/plan"),
      available: plan.autoOptimizeAllowed,
      badge: autoStatus,
    },
    {
      icon: GaugeIcon,
      title: "Speed Report",
      desc: "Run Google Lighthouse on any product page and see the page weight you removed, page by page.",
      cta: plan.pageSpeed ? "Open report" : "See plans",
      onClick: () => navigate(plan.pageSpeed ? "/app/speed" : "/app/plan"),
      available: plan.pageSpeed,
      badge: plan.pageSpeed ? undefined : { label: "Growth+", tone: "attention" },
    },
  ];

  const stats = [
    { icon: PlanIcon, label: "Current plan", value: plan.name },
    { icon: ImagesIcon, label: "Optimized this month", value: fmt(used) },
    { icon: CheckCircleIcon, label: "Images remaining", value: fmt(remaining) },
    { icon: AutomationIcon, label: "Auto-Optimize", value: autoStatus.label },
  ];

  return (
    <Page>
      <section className="dl-banner">
        <div className="dl-banner-copy">
          <span className="dl-chip"><LogoMark size={18} />DriftLite</span>
          <h1>
            Every product photo, <span className="dl-accent">lighter.</span>
          </h1>
          <p className="dl-banner-sub">
            Shrink product images, write AI alt text and check page speed without leaving your
            Shopify admin.
          </p>
          <div className="dl-actions">
            <button type="button" className="dl-btn dl-btn-bright" onClick={() => navigate("/app/optimize")}>
              Optimize images
            </button>
            <button type="button" className="dl-btn dl-btn-ghost" onClick={() => navigate("/app/plan")}>
              Plans &amp; usage
            </button>
          </div>
        </div>

        <div className="dl-banner-usage">
          <p className="dl-banner-usage-label">This month</p>
          <p className="dl-banner-usage-num">
            {fmt(used)}<span>{` / ${fmt(quota)} images`}</span>
          </p>
          <Meter pct={pct} dark size="lg" label={`${pct}% of this month's images used`} />
          <p className="dl-banner-usage-note">{`${pct}% used · resets ${resetLabel()}`}</p>
        </div>
      </section>

      <div className="dl-home">
        <div className="dl-home-main">
          <div className="dl-section-head">
            <p className="dl-section-title">Tools</p>
            <p className="dl-section-note">{`${tools.filter((t) => t.available).length} of ${tools.length} included in ${plan.name}`}</p>
          </div>
          <div className="dl-toollist">
            {tools.map((t) => (
              <div key={t.title} className={`dl-tool${t.available ? "" : " dl-tool-locked"}`}>
                <span className="dl-tool-icon"><Icon source={t.icon} /></span>
                <div className="dl-tool-body">
                  <div className="dl-tool-title-row">
                    <p className="dl-tool-title">{t.title}</p>
                    {t.badge && <Badge tone={t.badge.tone}>{t.badge.label}</Badge>}
                  </div>
                  <p className="dl-tool-desc">{t.desc}</p>
                </div>
                <div className="dl-tool-cta">
                  <Button variant={t.available ? "primary" : "secondary"} onClick={t.onClick}>
                    {t.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="dl-home-aside">
          <div className="dl-card">
            <p className="dl-card-title">At a glance</p>
            <ul className="dl-glance">
              {stats.map((s) => (
                <li key={s.label}>
                  <span className="dl-glance-icon"><Icon source={s.icon} /></span>
                  <span className="dl-glance-label">{s.label}</span>
                  <span className="dl-glance-value">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
          {plan.tier !== "pro" && (
            <div className="dl-card dl-upsell">
              <p className="dl-card-title">Need more images?</p>
              <p className="dl-card-sub">Higher plans raise your monthly limit and unlock Auto-Optimize and the Speed Report.</p>
              <button type="button" className="dl-btn dl-btn-outline dl-upsell-btn" onClick={() => navigate("/app/plan")}>
                Compare plans
              </button>
            </div>
          )}
        </aside>
      </div>
      <div style={{ height: 24 }} />
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
