import type { Metadata } from 'next'
import LegalLayout from '../../../components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Contrat d’abonnement — RESA',
  description:
    'Contrat type d’abonnement RESA : engagement 12 mois, conditions de résiliation, indemnité de résiliation anticipée, rachat du site.',
  alternates: { canonical: '/contrat-abonnement' },
}

export default function ContratAbonnementPage() {
  return (
    <LegalLayout title="Contrat d’abonnement RESA" updatedAt="2026-06-23">
      <p>
        Le présent contrat (ci-après « le Contrat ») est conclu entre&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Pablo Ortega</strong>, entrepreneur individuel, 62 rue Trivalle, 11000 Carcassonne,
          SIRET&nbsp;: [À COMPLÉTER], ci-après « le Prestataire »,
        </li>
        <li>
          et le Client identifié lors de la souscription en ligne (raison sociale, SIRET, adresse,
          représentant légal), ci-après « le Client ».
        </li>
      </ul>
      <p>
        Le Contrat s&apos;applique à toute souscription au Service RESA. Il complète les{' '}
        <a href="/cgv">Conditions Générales de Vente</a>. En cas de contradiction, les stipulations
        du présent Contrat prévalent.
      </p>

      <h2>Article 1 — Objet</h2>
      <p>
        Le Prestataire fournit au Client une solution numérique tout-en-un pour son
        restaurant&nbsp;: site web sur-mesure, hébergement, maintenance, référencement de base et
        système de réservation en ligne avec interface d&apos;administration.
      </p>

      <h2>Article 2 — Durée et prise d&apos;effet</h2>
      <ul>
        <li>
          Le Contrat prend effet à la date de souscription en ligne, validée par le paiement du
          premier loyer mensuel.
        </li>
        <li>
          La période d&apos;engagement minimum est de <strong>12 mois consécutifs</strong> à compter
          de la <strong>date de mise en ligne du site</strong> livré.
        </li>
        <li>
          À l&apos;issue de cette période, le Contrat est reconduit <strong>tacitement</strong> de
          mois en mois, sauf résiliation conformément à l&apos;article 7.
        </li>
      </ul>

      <h2>Article 3 — Prestations incluses</h2>
      <ul>
        <li>Conception graphique et développement du site web sur-mesure (vitrine + réservations).</li>
        <li>Nom de domaine&nbsp;: configuration et frais standards inclus (extensions courantes).</li>
        <li>Hébergement sécurisé, certificat SSL, sauvegardes quotidiennes.</li>
        <li>
          Maintenance technique&nbsp;: mises à jour de sécurité, correctifs, monitoring de
          disponibilité.
        </li>
        <li>
          Référencement naturel (SEO) de base&nbsp;: balises, sitemap, données structurées
          schema.org, page Google Business.
        </li>
        <li>
          Système de réservation en ligne avec notifications e-mail automatiques (client +
          restaurant).
        </li>
        <li>Interface administrateur sécurisée (gestion réservations, contenu, créneaux).</li>
        <li>Support technique par e-mail (réponse sous 48 h ouvrées).</li>
      </ul>

      <h2>Article 4 — Prestations non incluses</h2>
      <p>Sont notamment exclus, sauf devis complémentaire&nbsp;:</p>
      <ul>
        <li>la création de contenu rédactionnel ou photographique professionnel&nbsp;;</li>
        <li>les campagnes publicitaires payantes (Google Ads, Meta Ads)&nbsp;;</li>
        <li>l&apos;intégration avec un système de caisse (POS) ou un logiciel tiers spécifique&nbsp;;</li>
        <li>les refontes graphiques majeures après livraison (un cycle de retours est inclus).</li>
      </ul>

      <h2>Article 5 — Tarif et conditions financières</h2>
      <ul>
        <li>
          Loyer mensuel tout inclus&nbsp;: <strong>67&nbsp;€</strong>, TVA non applicable (article
          293 B du CGI).
        </li>
        <li>
          Aucun paiement n&apos;est exigé à la signature ni pendant la phase de conception. Le
          premier prélèvement intervient à la mise en ligne du site.
        </li>
        <li>
          Le paiement est automatique, par carte bancaire, via Stripe. Le Client autorise le débit
          mensuel pour la durée du Contrat.
        </li>
      </ul>

      <h2>Article 6 — Livraison et recette</h2>
      <ul>
        <li>
          Le Prestataire propose une première version du site dans un délai indicatif de 10 à 30
          jours ouvrés après réception complète des contenus.
        </li>
        <li>
          Le Client dispose de 10 jours ouvrés pour formuler ses retours par écrit. Un cycle complet
          de retours est inclus. Les modifications complémentaires sont facturées au temps passé sur
          devis.
        </li>
        <li>
          La mise en ligne est conditionnée à la validation écrite du Client. Sans réponse sous 15
          jours après livraison, la recette est réputée acquise.
        </li>
      </ul>

      <h2>Article 7 — Résiliation</h2>
      <h3>7.1 Résiliation à terme</h3>
      <p>
        Au-delà de la période d&apos;engagement, chaque partie peut résilier par e-mail avec accusé
        de réception, en respectant un préavis de <strong>2 mois</strong>. Aucun remboursement des
        mois entamés n&apos;est dû.
      </p>
      <h3>7.2 Résiliation anticipée par le Client</h3>
      <p>
        Le Client peut résilier avant le terme de l&apos;engagement moyennant le paiement d&apos;une
        indemnité égale au nombre de mois restants × <strong>67&nbsp;€</strong>. L&apos;indemnité est
        prélevée sur le moyen de paiement enregistré ou facturée à 30 jours fin de mois. Aucune
        prestation n&apos;est due après paiement.
      </p>
      <h3>7.3 Résiliation pour manquement</h3>
      <p>
        En cas de manquement grave et non régularisé après mise en demeure restée sans effet
        pendant 15 jours, la partie lésée peut résilier de plein droit. Sont notamment considérés
        comme manquements graves&nbsp;: défaut de paiement supérieur à 30 jours, utilisation
        frauduleuse du Service, violation des obligations de confidentialité.
      </p>
      <h3>7.4 Effets de la résiliation</h3>
      <ul>
        <li>Arrêt de l&apos;hébergement et de la maintenance à la date d&apos;effet.</li>
        <li>
          Restitution des contenus fournis par le Client (textes, photos) sous 15 jours sur demande.
        </li>
        <li>
          À défaut de rachat (article 8), le code source et le design demeurent la propriété du
          Prestataire.
        </li>
      </ul>

      <h2>Article 8 — Rachat du site</h2>
      <p>
        Le Client peut à tout moment racheter l&apos;intégralité du site pour la somme forfaitaire
        de <strong>500&nbsp;€</strong>. Le rachat comprend&nbsp;:
      </p>
      <ul>
        <li>la cession définitive des codes sources et du design&nbsp;;</li>
        <li>la portabilité du nom de domaine vers un autre hébergeur&nbsp;;</li>
        <li>la documentation technique nécessaire à l&apos;exploitation autonome.</li>
      </ul>
      <p>
        Le rachat met fin à l&apos;abonnement à la date convenue entre les parties, sans indemnité
        de résiliation anticipée.
      </p>

      <h2>Article 9 — Propriété intellectuelle</h2>
      <p>
        Hors rachat, le Client bénéficie d&apos;un droit d&apos;usage non exclusif et non cessible
        du site pendant la durée du Contrat. Le code source, les composants techniques et le design
        restent la propriété du Prestataire.
      </p>
      <p>
        Le Client conserve l&apos;entière propriété de ses contenus (textes, photos, marque, logo)
        et concède au Prestataire une licence d&apos;exploitation strictement limitée à
        l&apos;exécution du Contrat.
      </p>

      <h2>Article 10 — Disponibilité et maintenance</h2>
      <p>
        Le Prestataire s&apos;engage sur une disponibilité de <strong>99,5 %</strong> mensuelle hors
        maintenance planifiée (notifiée 48 h à l&apos;avance) et cas de force majeure. En cas de
        manquement répété et constaté, le Client peut demander un avoir au prorata du temps
        d&apos;indisponibilité.
      </p>

      <h2>Article 11 — Confidentialité</h2>
      <p>
        Chaque partie s&apos;engage à conserver confidentielles les informations échangées dans le
        cadre du Contrat, pendant toute sa durée et trois ans après son terme.
      </p>

      <h2>Article 12 — Données personnelles</h2>
      <p>
        Les obligations de chaque partie au titre du RGPD sont définies à l&apos;article 10 des CGV.
        Le Client est responsable de traitement pour les données de ses propres clients
        (réservations). Le Prestataire est sous-traitant pour ces données et responsable de
        traitement pour les données du compte Client.
      </p>

      <h2>Article 13 — Force majeure</h2>
      <p>
        Aucune partie ne peut être tenue responsable d&apos;un manquement résultant d&apos;un cas de
        force majeure au sens de l&apos;article 1218 du Code civil (catastrophe, cyberattaque
        massive, défaillance prolongée d&apos;un fournisseur tiers d&apos;hébergement, etc.).
      </p>

      <h2>Article 14 — Cession du contrat</h2>
      <p>
        Le Client ne peut céder le présent Contrat à un tiers sans accord écrit préalable du
        Prestataire. Le Prestataire peut céder le Contrat à un repreneur de son activité après
        notification au Client.
      </p>

      <h2>Article 15 — Droit applicable et litiges</h2>
      <p>
        Le présent Contrat est soumis au droit français. En cas de litige et à défaut d&apos;accord
        amiable sous 30 jours, les tribunaux du ressort de Carcassonne seront seuls compétents, sauf
        disposition légale impérative contraire.
      </p>

      <h2>Acceptation</h2>
      <p>
        La souscription en ligne, validée par le paiement du premier loyer mensuel, vaut acceptation
        sans réserve du présent Contrat, des CGV et des Mentions légales. Une copie est envoyée par
        e-mail au Client à l&apos;activation de l&apos;abonnement.
      </p>
    </LegalLayout>
  )
}
