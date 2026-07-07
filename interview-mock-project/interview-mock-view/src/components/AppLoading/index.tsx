import "./index.css";

type AppLoadingProps = {
  text?: string;
  fullscreen?: boolean;
};

export function AppLoading({ text = "正在准备中", fullscreen = true }: AppLoadingProps) {
  return (
    <div className={fullscreen ? "app-loading app-loading--fullscreen" : "app-loading"}>
      <div className="app-loading__orb" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="app-loading__card">
        <div className="app-loading__typing">
          <span />
          <span />
          <span />
        </div>

        <h2>{text}</h2>
        <p>正在加载菜单、权限与页面组件，请稍等片刻。</p>

        <div className="app-loading__progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  );
}
