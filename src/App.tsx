import { useEffect, useRef, useState } from 'react'
import {
  about,
  faq,
  finalCta,
  footer,
  forWhom,
  hero,
  howMockWorks,
  services,
  site,
} from './content'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    el.querySelectorAll('.reveal').forEach((node) => io.observe(node))
    return () => io.disconnect()
  }, [])

  return ref
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-item${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="faq-q"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{q}</span>
        <span className="faq-icon" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      <div className="faq-a" hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function App() {
  const pageRef = useReveal()

  return (
    <div className="page" ref={pageRef}>
      <div className="noise" aria-hidden />

      <header className="hero">
        <div className="hero-bg" aria-hidden>
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-grid" />
          <div className="hero-wave" />
        </div>

        <nav className="nav">
          <a className="nav-brand" href="#top">
            {site.brand}
          </a>
          <a className="nav-tg" href={site.telegramUrl} target="_blank" rel="noreferrer">
            {site.telegramHandle}
          </a>
        </nav>

        <div className="hero-inner" id="top">
          <p className="hero-brand reveal">{site.brand}</p>
          <h1 className="hero-title reveal reveal-delay-1">{hero.headline}</h1>
          <p className="hero-support reveal reveal-delay-2">{hero.support}</p>
          <div className="hero-cta reveal reveal-delay-3">
            <a className="btn btn-primary" href="#services">
              {hero.primaryCta}
            </a>
            <a
              className="btn btn-ghost"
              href={site.telegramUrl}
              target="_blank"
              rel="noreferrer"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="section for-whom" id="for-whom">
          <h2 className="section-title reveal">{forWhom.title}</h2>
          <div className="split">
            <div className="split-col yes reveal">
              <h3>{forWhom.yesTitle}</h3>
              <ul>
                {forWhom.yes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="split-col no reveal reveal-delay-1">
              <h3>{forWhom.noTitle}</h3>
              <ul>
                {forWhom.no.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section services" id="services">
          <h2 className="section-title reveal">{services.title}</h2>
          <p className="section-sub reveal">{services.subtitle}</p>
          <div className="service-list">
            {services.items.map((item, i) => (
              <article
                key={item.id}
                className={`service${item.featured ? ' is-featured' : ''} reveal reveal-delay-${i % 3}`}
              >
                <div className="service-top">
                  <div>
                    <h3>{item.name}</h3>
                    <p className="service-meta">{item.duration}</p>
                  </div>
                  <div className="service-price">
                    <span className="price">{item.price}</span>
                    {item.priceNote ? <span className="price-note">{item.priceNote}</span> : null}
                  </div>
                </div>
                <p className="service-desc">{item.description}</p>
                <a className="service-cta" href={site.telegramUrl} target="_blank" rel="noreferrer">
                  {item.cta}
                </a>
              </article>
            ))}
          </div>
          <aside className="service-secondary reveal">
            <span className="badge">{services.secondary.badge}</span>
            <h3>{services.secondary.name}</h3>
            <p>{services.secondary.description}</p>
          </aside>
        </section>

        <section className="section how" id="how">
          <h2 className="section-title reveal">{howMockWorks.title}</h2>
          <ol className="steps">
            {howMockWorks.steps.map((step, i) => (
              <li key={step.n} className={`step reveal reveal-delay-${i % 4}`}>
                <span className="step-n">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section about" id="about">
          <h2 className="section-title reveal">{about.title}</h2>
          <p className="about-text reveal">{about.text}</p>
        </section>

        <section className="section faq" id="faq">
          <h2 className="section-title reveal">{faq.title}</h2>
          <div className="faq-list reveal">
            {faq.items.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        <section className="section final-cta" id="contact">
          <div className="final-inner reveal">
            <h2>{finalCta.title}</h2>
            <p>{finalCta.text}</p>
            <a className="btn btn-primary" href={site.telegramUrl} target="_blank" rel="noreferrer">
              {finalCta.button}
            </a>
            <p className="final-handle">{site.telegramHandle}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p className="footer-brand">{site.brand}</p>
        <p className="footer-note">{footer.note}</p>
      </footer>
    </div>
  )
}
