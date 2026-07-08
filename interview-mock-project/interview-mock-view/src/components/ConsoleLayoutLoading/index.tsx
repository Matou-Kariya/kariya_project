// src/components/ConsoleLayoutLoading/index.tsx
import "./index.css";

export function ConsoleLayoutLoading() {
  return (
    <div className="console-loading">
      <aside className="console-loading__sidebar">
        <div className="console-loading__brand" />
        <div className="console-loading__menu active" />
        <div className="console-loading__menu" />
        <div className="console-loading__menu" />
        <div className="console-loading__group" />
        <div className="console-loading__menu short" />
        <div className="console-loading__menu" />
      </aside>

      <section className="console-loading__main">
        <header className="console-loading__header">
          <div className="console-loading__breadcrumb" />
          <div className="console-loading__user" />
        </header>

        <div className="console-loading__tags">
          <div />
          <div />
          <div />
        </div>

        <main className="console-loading__content">
          <section className="console-loading__hero">
            <div>
              <div className="console-loading__title" />
              <div className="console-loading__text" />
            </div>
            <div className="console-loading__spinner">
              <span />
              <span />
              <span />
            </div>
          </section>

          <section className="console-loading__grid">
            <div />
            <div />
            <div />
            <div />
          </section>
        </main>
      </section>
    </div>
  );
}
