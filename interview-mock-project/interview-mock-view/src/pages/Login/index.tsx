import { WechatOutlined } from "@ant-design/icons";
import "./index.css";

const Login = () => {
  return (
    <main className="login-page">
      <section className="login-intro" aria-label="产品介绍">
        <a className="login-brand" href="/login" aria-label="AI 面试官首页">
          <span className="login-brand__mark">AI</span>
          <span>INTERVIEW</span>
        </a>

        <div className="login-intro__content">
          <p className="login-intro__eyebrow">YOUR NEXT OPPORTUNITY</p>
          <h1>
            让每一次练习，
            <br />
            都更接近理想 Offer
          </h1>
          <p className="login-intro__description">沉浸式模拟真实面试场景，记录成长，也看见更好的自己。</p>
        </div>

        <p className="login-intro__footer">AI 模拟面试 · 专注每一次表达</p>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel__content">
          <header className="login-heading">
            <p className="login-heading__eyebrow">WELCOME BACK</p>
            <h2 id="login-title">欢迎回来</h2>
            <p>登录你的账号，继续今天的面试练习。</p>
          </header>

          <button className="social-login" type="button">
            <WechatOutlined aria-hidden="true" />
            使用微信登录
          </button>

          <div className="login-divider" aria-hidden="true">
            <span>或使用账号登录</span>
          </div>

          <form className="login-form">
            <label className="login-field">
              <span>账号</span>
              <input name="username" type="text" placeholder="请输入邮箱或用户名" autoComplete="username" />
            </label>

            <label className="login-field">
              <span>密码</span>
              <input name="password" type="password" placeholder="请输入密码" autoComplete="current-password" />
            </label>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>记住我</span>
              </label>
              <button className="text-button" type="button">
                忘记密码？
              </button>
            </div>

            <button className="login-submit" type="button">
              登录
            </button>
          </form>

          <p className="login-register">
            还没有账号？
            <button className="text-button text-button--strong" type="button">
              创建账号
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
