import { useEffect, useRef, useState } from 'react'
import {
  faq,
  finalCta,
  footer,
  forWhom,
  hero,
  howItWorks,
  ohota,
  products,
  site,
  vibe,
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
          <div className="hero-scan" />
          <div className="hero-depth" />
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
            <a className="btn btn-primary" href={hero.ctaHuntHref}>
              {hero.ctaHunt}
            </a>
            <a className="btn btn-accent" href={hero.ctaVibeHref}>
              {hero.ctaVibe}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="section products" id="products">
          <h2 className="section-title reveal">{products.title}</h2>
          <p className="section-sub reveal">{products.subtitle}</p>
          <div className="product-blocks">
            {products.items.map((item, i) => (
              <article
                key={item.id}
                id={item.id}
                className={`product-block reveal reveal-delay-${i}`}
              >
                <span className="product-tag">{item.tag}</span>
                <h3>{item.name}</h3>
                <p>{item.pitch}</p>
                <a className="btn btn-ink" href={item.href}>
                  {item.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section tariffs" id={ohota.tariffsId}>
          <h2 className="section-title reveal">{ohota.title}</h2>
          <p className="section-sub reveal">{ohota.subtitle}</p>
          <div className="tier-grid">
            {ohota.tariffs.map((tier, i) => (
              <article
                key={tier.id}
                className={`tier-card${tier.popular ? ' is-popular' : ''} reveal reveal-delay-${i}`}
              >
                {tier.popular ? <span className="tier-badge">{tier.badge}</span> : null}
                <h3>{tier.name}</h3>
                <p className="tier-price">{tier.price}</p>
                <ul>
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a className="btn btn-tier" href={site.telegramUrl} target="_blank" rel="noreferrer">
                  {tier.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section tracks" id={vibe.tariffsId}>
          <h2 className="section-title reveal">{vibe.title}</h2>
          <p className="section-sub reveal">{vibe.subtitle}</p>
          <div className="track-list">
            {vibe.tracks.map((track, i) => (
              <article key={track.id} className={`track-row reveal reveal-delay-${i % 3}`}>
                <div className="track-head">
                  <div>
                    <h3>{track.name}</h3>
                    <p className="track-summary">{track.summary}</p>
                  </div>
                  <p className="track-price">{track.price}</p>
                </div>
                <ul>
                  {track.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  className="btn btn-ink btn-sm"
                  href={site.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {track.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section how" id="how">
          <h2 className="section-title reveal">{howItWorks.title}</h2>
          <ol className="steps">
            {howItWorks.steps.map((step, i) => (
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
            <p className="final-channel">
              {finalCta.channelNote}{' '}
              <a href={site.channelUrl} target="_blank" rel="noreferrer">
                {site.channelHandle}
              </a>
            </p>
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
