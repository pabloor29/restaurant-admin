import type { Metadata } from 'next'
import LegalLayout from '../../../components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Mentions légales — RESA',
  description:
    'Mentions légales du service RESA : éditeur, hébergeur, données de contact et propriété intellectuelle.',
  alternates: { canonical: '/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="2026-06-23">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>resa-service.com</strong> (ci-après « le Site ») est édité par&nbsp;:
      </p>
      <ul>
        <li><strong>Pablo Ortega</strong> — Entrepreneur individuel (auto-entrepreneur)</li>
        <li>Adresse&nbsp;: 62 rue Trivalle, 11000 Carcassonne, France</li>
        <li>SIRET&nbsp;: 92485393000023</li>
        <li>Code APE&nbsp;: 6201Z — Programmation informatique</li>
        <li>TVA non applicable, article 293 B du Code général des impôts</li>
        <li>Email&nbsp;: pab.ortg@gmail.com</li>
        <li>Téléphone&nbsp;: +33 (0)6 29 10 31 28</li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>Pablo Ortega, en qualité d&apos;éditeur du Site.</p>

      <h2>3. Hébergeur</h2>
      <p>
        Le Site est hébergé par&nbsp;:
      </p>
      <ul>
        <li><strong>Vercel Inc.</strong></li>
        <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        <li>Site web&nbsp;: vercel.com</li>
      </ul>
      <p>
        Les données utilisateurs et bases de données sont hébergées par <strong>Supabase Inc.</strong>,
        970 Toa Payoh North #07-04, Singapour 318992.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du Site (textes, images, logos, code source, design, marques) est la
        propriété exclusive de Pablo Ortega ou de ses partenaires. Toute reproduction, représentation,
        modification, publication ou exploitation, totale ou partielle, sans autorisation écrite
        préalable, est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et
        suivants du Code de la propriété intellectuelle.
      </p>
      <p>
        Les sites web livrés aux Clients dans le cadre de l&apos;abonnement RESA restent la propriété de
        Pablo Ortega tant qu&apos;ils sont exploités via le service. Les conditions de rachat figurent
        dans le <a href="/contrat-abonnement">contrat d&apos;abonnement</a>.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est régi par notre politique de confidentialité,
        accessible sur demande à <a href="mailto:pab.ortg@gmail.com">pab.ortg@gmail.com</a>.
        Conformément au RGPD et à la loi Informatique et Libertés, les utilisateurs disposent d&apos;un
        droit d&apos;accès, de rectification, d&apos;opposition, de suppression et de portabilité de
        leurs données.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Le Site utilise des cookies strictement nécessaires à son fonctionnement (session
        d&apos;authentification, paiement). Aucun cookie publicitaire ou de mesure d&apos;audience
        n&apos;est déposé sans consentement préalable.
      </p>

      <h2>7. Loi applicable et juridiction</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. Tout litige relatif au Site
        relève de la compétence des tribunaux de Carcassonne, sauf dispositions légales contraires.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question, écrivez à&nbsp;:{' '}
        <a href="mailto:pab.ortg@gmail.com">pab.ortg@gmail.com</a>.
      </p>
    </LegalLayout>
  )
}
