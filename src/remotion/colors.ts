export const C = {
  pine:        '#13503B',
  pineDark:    '#0C3528',
  pineLight:   '#E7F0EB',
  amber:       '#C77E3A',
  amberBright: '#E8A05C',
  amberLight:  '#F3E5D3',
  paper:       '#F5F1E9',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FCFAF5',
  ink:         '#16201B',
  slate:       '#5E665E',
  muted:       '#9A9587',
  border:      '#E5DED0',
  borderSoft:  '#F0EADD',
  white:       '#FFFFFF',
  okText:      '#1E7A52',
  okBg:        '#E4F1EA',
  warnText:    '#B97D2B',
  warnBg:      '#F6EBD6',
  errText:     '#A8473A',
  errBg:       '#F4E2DD',
  infoText:    '#3A6B8F',
  infoBg:      '#E3ECF2',
}

export const F = {
  primary:   "'Schibsted Grotesk', 'Arial Black', sans-serif",
  secondary: "'Hanken Grotesk', Arial, sans-serif",
  accent:    "'Newsreader', Georgia, serif",
}

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)
