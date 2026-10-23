import { Icon } from "@shopify/polaris";

// Slim header shown at the top of each feature page: navy icon tile, small
// uppercase eyebrow, title and subtitle, with a wave rule underneath.
export default function PageHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <header className="dl-page-head">
      <span className="dl-page-head-icon">
        <Icon source={icon} />
      </span>
      <div className="dl-page-head-text">
        {eyebrow && <p className="dl-page-head-eyebrow">{eyebrow}</p>}
        <p className="dl-page-head-title">{title}</p>
        {subtitle && <p className="dl-page-head-sub">{subtitle}</p>}
      </div>
    </header>
  );
}
