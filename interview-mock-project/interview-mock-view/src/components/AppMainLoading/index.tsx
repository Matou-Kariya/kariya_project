import "./index.css";

type AppMainLoadingProps = {
  text?: string;
};

export function AppMainLoading({ text = "正在加载页面..." }: AppMainLoadingProps) {
  return (
    <div className="app-main-loading" role="status" aria-live="polite">
      <div className="app-main-loading__panel">
        <div className="app-main-loading__orb">
          <span />
          <span />
          <span />
        </div>

        <div className="app-main-loading__content">
          <h2>{text}</h2>
          <p>正在准备页面资源，请稍候</p>
        </div>

        <div className="app-main-loading__progress">
          <i />
        </div>
      </div>
    </div>
  );
}
