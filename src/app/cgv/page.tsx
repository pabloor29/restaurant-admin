import type { Metadata } from 'next'
import LegalLayout from '../../../components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — RESA',
  description:
    'Conditions Générales de Vente de l’abonnement RESA : site web sur-mesure, hébergement, maintenance, réservations et SEO pour restaurants.',
  alternates: { canonical: '/cgv' },
}

export default function CGVPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updatedAt="2026-06-23">
      <p>
        Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent toute souscription au
        service <strong>RESA</strong>, exploité par Pablo Ortega, entrepreneur individuel
        (auto-entrepreneur), domicilié 62 rue Trivalle, 11000 Carcassonne, France (ci-après « le
        Prestataire »). Toute commande implique l&apos;adhésion sans réserve aux présentes CGV.
      </p>

      <h2>1. Objet</h2>
      <p>
        Le Prestataire propose un service par abonnement (ci-après « le Service ») destiné aux
        restaurateurs et établissements de restauration, comprenant&nbsp;:
      </p>
      <ul>
        <li>la création d&apos;un site web sur-mesure&nbsp;;</li>
        <li>l&apos;hébergement web sécurisé&nbsp;;</li>
        <li>la maintenance technique (correctifs, mises à jour, sauvegardes)&nbsp;;</li>
        <li>le référencement naturel (SEO) de base&nbsp;;</li>
        <li>un système de prise de réservations en ligne avec confirmation par e-mail&nbsp;;</li>
        <li>une interface d&apos;administration accessible au Client.</li>
      </ul>

      <h2>2. Souscription et accès au service</h2>
      <p>
        La souscription s&apos;effectue exclusivement sur invitation, via un compte créé pour le
        Client par le Prestataire. Aucune inscription publique n&apos;est ouverte. Le Client accède
        au paiement sécurisé via la plateforme <strong>Stripe Payments Europe Limited</strong>.
      </p>
      <p>
        Le Client garantit l&apos;exactitude des informations communiquées (identité, raison sociale,
        SIRET, adresse, coordonnées). Toute modification doit être notifiée sans délai à&nbsp;
        <a href="mailto:pab.ortg@gmail.com">pab.ortg@gmail.com</a>.
      </p>

      <h2>3. Prix et modalités de paiement</h2>
      <ul>
        <li>
          Abonnement mensuel tout inclus&nbsp;: <strong>67&nbsp;€ par mois</strong>, TVA non
          applicable — article 293 B du CGI.
        </li>
        <li>
          Le premier prélèvement intervient <strong>à la mise en ligne du site</strong>. Aucun
          paiement n&apos;est exigé avant la livraison effective.
        </li>
        <li>
          Le paiement est automatique, par carte bancaire, via Stripe. Le Client autorise Stripe à
          débiter mensuellement sa carte pour la durée de l&apos;abonnement.
        </li>
        <li>
          En cas de paiement refusé, le Prestataire pourra suspendre le Service après deux relances
          restées sans réponse pendant 7 jours.
        </li>
      </ul>

      <h2>4. Durée et reconduction</h2>
      <ul>
        <li>
          <strong>Engagement minimum&nbsp;: 12 mois</strong> à compter de la date de mise en ligne du
          site.
        </li>
        <li>
          À l&apos;issue de la période d&apos;engagement, l&apos;abonnement est reconduit
          <strong> tacitement de mois en mois</strong>, sauf résiliation par l&apos;une des parties
          dans les conditions de l&apos;article 5.
        </li>
        <li>
          Conformément aux articles L.215-1 et suivants du Code de la consommation (loi Chatel), le
          Prestataire informera le Client par e-mail entre trois mois et un mois avant l&apos;échéance
          de la reconduction tacite, lorsque le Client est un consommateur. Pour les Clients
          professionnels, cette information est délivrée à titre commercial.
        </li>
      </ul>

      <h2>5. Résiliation</h2>
      <h3>5.1 Résiliation après l&apos;engagement</h3>
      <p>
        Au-delà des 12 mois d&apos;engagement, chaque partie peut résilier l&apos;abonnement par
        e-mail à <a href="mailto:pab.ortg@gmail.com">pab.ortg@gmail.com</a> en respectant un{' '}
        <strong>préavis de 2 mois</strong>. Aucun remboursement des mois entamés n&apos;est dû.
      </p>
      <h3>5.2 Résiliation anticipée par le Client</h3>
      <p>
        En cas de résiliation à l&apos;initiative du Client avant la fin des 12 mois
        d&apos;engagement, une <strong>indemnité de résiliation anticipée</strong> est due, égale au
        nombre de mois restants jusqu&apos;à la fin de l&apos;engagement multiplié par 67&nbsp;€
        (exemple&nbsp;: résiliation au 5<sup>e</sup> mois → 7 × 67&nbsp;€ = 469&nbsp;€). Cette
        indemnité sera prélevée sur le moyen de paiement enregistré, ou facturée séparément.
      </p>
      <h3>5.3 Résiliation pour manquement</h3>
      <p>
        En cas de manquement grave de l&apos;une des parties à ses obligations (défaut de paiement
        prolongé, manquement à la confidentialité, utilisation frauduleuse), la partie lésée pourra
        résilier de plein droit, sans indemnité, 15 jours après une mise en demeure restée sans
        effet.
      </p>

      <h2>6. Livraison et délais</h2>
      <ul>
        <li>
          La création du site est lancée dès la souscription confirmée et la réception des contenus
          nécessaires (textes, photos, menu, identité visuelle).
        </li>
        <li>
          Le délai de livraison estimé est de <strong>10 à 30 jours ouvrés</strong> selon la
          complexité, à compter de la réception complète des éléments du Client.
        </li>
        <li>
          La mise en ligne définitive est conditionnée à la validation écrite du Client (par e-mail).
        </li>
      </ul>

      <h2>7. Obligations du Client</h2>
      <ul>
        <li>fournir des contenus conformes à la loi (pas de contrefaçon, de diffamation, etc.)&nbsp;;</li>
        <li>maintenir à jour ses coordonnées de facturation et de paiement&nbsp;;</li>
        <li>
          ne pas utiliser le Service pour des activités illégales ou contraires aux bonnes
          mœurs&nbsp;;
        </li>
        <li>
          respecter les conditions d&apos;utilisation des prestataires tiers (Stripe, Vercel,
          Supabase, fournisseur d&apos;envoi d&apos;e-mails).
        </li>
      </ul>

      <h2>8. Obligations du Prestataire</h2>
      <ul>
        <li>
          assurer la disponibilité du Service avec un objectif de <strong>99,5 % par mois</strong>{' '}
          (hors maintenance planifiée et cas de force majeure)&nbsp;;
        </li>
        <li>réaliser les sauvegardes quotidiennes des données du site&nbsp;;</li>
        <li>répondre aux demandes de support sous 48 h ouvrées&nbsp;;</li>
        <li>
          notifier le Client en cas d&apos;incident de sécurité affectant ses données dans les
          conditions du RGPD.
        </li>
      </ul>

      <h2>9. Propriété intellectuelle</h2>
      <p>
        Tant que l&apos;abonnement est actif, le Client bénéficie d&apos;un droit d&apos;usage non
        exclusif et non cessible du site web livré. Le code source, le design et l&apos;architecture
        technique restent la propriété du Prestataire.
      </p>
      <p>
        Le Client peut à tout moment racheter l&apos;intégralité du site (codes sources, design,
        contenus, droits d&apos;exploitation perpétuels) pour la somme forfaitaire de{' '}
        <strong>500&nbsp;€</strong>. Le rachat met fin à l&apos;abonnement à la date convenue, sans
        autre indemnité.
      </p>
      <p>
        Les contenus fournis par le Client (textes, photos, logo) restent sa propriété. Le Client
        garantit qu&apos;il détient les droits nécessaires sur ces contenus.
      </p>

      <h2>10. Données personnelles et RGPD</h2>
      <p>
        Le Prestataire agit en qualité de <strong>responsable de traitement</strong> pour les données
        relatives à la gestion du compte et de la facturation, et en qualité de{' '}
        <strong>sous-traitant</strong> pour les données de réservation traitées via la plateforme
        pour le compte du Client (responsable de traitement).
      </p>
      <p>
        Les données sont hébergées dans l&apos;Union européenne (Vercel — région Paris&nbsp;; Supabase
        — région Francfort). Le Prestataire ne transfère pas de données hors UE sans encadrement
        contractuel approprié (Clauses Contractuelles Types).
      </p>
      <p>
        Le Client garantit recueillir le consentement de ses propres clients (réservations,
        newsletters) conformément au RGPD.
      </p>

      <h2>11. Responsabilité</h2>
      <p>
        Le Prestataire est tenu à une obligation de moyens. Sa responsabilité ne saurait être engagée
        en cas&nbsp;:
      </p>
      <ul>
        <li>de force majeure (panne d&apos;un prestataire tiers, cyberattaque, etc.)&nbsp;;</li>
        <li>
          de défaillance imputable au Client (contenu invalide, identifiants compromis, modification
          non autorisée)&nbsp;;
        </li>
        <li>de perte indirecte (manque à gagner, perte de clientèle).</li>
      </ul>
      <p>
        En tout état de cause, la responsabilité du Prestataire est limitée au montant des sommes
        effectivement versées par le Client au titre des 12 derniers mois.
      </p>

      <h2>12. Service client</h2>
      <p>
        Pour toute question ou demande de support&nbsp;: e-mail{' '}
        <a href="mailto:pab.ortg@gmail.com">pab.ortg@gmail.com</a>, téléphone +33 (0)6 29 10 31 28
        (du lundi au vendredi, 9 h – 18 h, hors jours fériés).
      </p>

      <h2>13. Médiation et litiges</h2>
      <p>
        En cas de litige, le Client est invité à contacter prioritairement le Prestataire pour une
        résolution amiable. À défaut d&apos;accord sous 30 jours, le Client consommateur peut saisir
        gratuitement le médiateur de la consommation compétent. Tout litige non résolu relève des
        tribunaux du ressort de Carcassonne, loi française applicable.
      </p>

      <h2>14. Modification des CGV</h2>
      <p>
        Le Prestataire peut modifier les CGV. Les Clients en cours d&apos;abonnement seront notifiés
        par e-mail au moins 30 jours avant l&apos;entrée en vigueur des nouvelles CGV. À défaut
        d&apos;acceptation, le Client peut résilier sans indemnité dans ce délai.
      </p>

      <h2>15. Disposition finale</h2>
      <p>
        Si une clause des présentes CGV est jugée nulle ou inapplicable, les autres clauses restent
        pleinement en vigueur.
      </p>
    </LegalLayout>
  )
}
