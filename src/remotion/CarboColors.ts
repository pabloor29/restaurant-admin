// Carbo real brand DA — extracted from carbo-website-v2 (HeroBanner blue night gradient,
// Footer pink panel + deep green text, Anton wordmark, Schoolbell handwritten accents,
// Cormorant Garamond body italic).
//
// Fonts are loaded via @remotion/google-fonts so they actually render inside the bundle.
// Schoolbell isn't on Google Fonts → substitute with Caveat (very close: casual script).
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton'
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat'
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond'

const { fontFamily: ANTON } = loadAnton()
const { fontFamily: CAVEAT } = loadCaveat()
const { fontFamily: CORMO  } = loadCormorant()

export const CARBO = {
  // Footer / panel palette
  pink:       '#F7DAD9',  // brand pink — panels, accents
  pinkDeep:   '#E9B9B6',
  pinkSoft:   '#FCEDEC',
  inkGreen:   '#023C18',  // deep brand green — text on pink
  green:      '#192C1D',  // greenBottle
  greenSoft:  '#243B2A',
  cream:      '#FEF8ED',  // whiteSmokedBG
  creamSoft:  '#FBF1DD',
  // Hero night gradient
  night1:     '#001F50',
  night2:     '#002E6D',
  ink:        '#1A1A1A',
}

export const CARBO_F = {
  display: CORMO,   // Cormorant Garamond — body italic, quote
  script:  CAVEAT,  // Caveat (Schoolbell substitute) — handwritten taglines, section labels
  anton:   ANTON,   // Anton — massive uppercase CARBO wordmark
  mono:    "'IBM Plex Mono', 'Courier New', monospace",
}
