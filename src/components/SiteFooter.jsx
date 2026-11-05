import React from "react";
import logo from "../assets/Logo.jpeg";
import { siteText } from "../lib/siteText";

export default function SiteFooter({ language }) {
  const t = siteText[language] || siteText.th;

  return (
    <footer className="sl-footer">
      <div className="sl-footer-top">
        <div className="sl-footer-brand">
          <div className="sl-brand">
            <img
              className="sl-logo sl-logo--sm"
              src={logo}
              alt="Digiworld Logo"
            />
            <div>
              <span className="sl-brand-name">Digiworld</span>
              <span className="sl-brand-tag">CODING &amp; CREATIVE LEARNING</span>
            </div>
          </div>
          <p>
            {t.footerTagline.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="sl-footer-col">
          <strong>{t.footerExplore}</strong>
          <span>{t.footerLinks1}</span>
          <span>{t.footerLinks2}</span>
        </div>

        <div className="sl-footer-col">
          <strong>{t.footerTalk}</strong>
          <span>DigiWorld Phuket (Robotic)</span>
          <span className="is-link">
            LINE @digiworldphuket ·{" "}
            <a className="is-link" href="tel:0818559762">
              081 855 9762
            </a>
          </span>
          <span>{t.openEveryday}</span>
        </div>
      </div>

      <div className="sl-rule" />

      <div className="sl-footer-bottom">
        <span>© 2026 Digiworld Phuket</span>
        <span>{t.sampleNote}</span>
      </div>
    </footer>
  );
}
