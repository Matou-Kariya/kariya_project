import "./index.css";

type LayoutLoadingProps = {
  text?: string;
  variant?: "page" | "content";
};

export function LayoutLoading({ text = "正在加载工作台", variant = "content" }: LayoutLoadingProps) {
  if (variant === "page") {
    return (
      <div className="layout-loading layout-loading--page" role="status" aria-live="polite">
        <aside className="layout-loading__sidebar" aria-hidden="true">
          <div className="layout-loading__brand" />
          <div className="layout-loading__nav active" />
          <div className="layout-loading__nav" />
          <div className="layout-loading__nav short" />
        </aside>

        <section className="layout-loading__main">
          <header className="layout-loading__header" aria-hidden="true">
            <div className="layout-loading__crumb" />
            <div className="layout-loading__avatar" />
          </header>

          <div className="layout-loading__body">
            <ContentLoading text={text} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="layout-loading layout-loading--content" role="status" aria-live="polite">
      <ContentLoading text={text} />
    </div>
  );
}

function ContentLoading({ text }: { text: string }) {
  return (
    <>
      <div className="layout-loading__content-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="layout-loading__card">
        <div className="layout-loading__robot" aria-hidden="true">
          <i />
          <i />
        </div>

        <div className="layout-loading__content">
          <h2>{text}</h2>
          <p>正在同步菜单、权限与页面资源。</p>

          <div className="layout-loading__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </>
  );
}
