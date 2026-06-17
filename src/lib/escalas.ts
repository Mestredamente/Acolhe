export function getBeckClassification(scaleName: string, score: number) {
  if (scaleName.includes('BAI') || scaleName.includes('Ansiedade')) {
    if (score <= 7) return 'Mínima'
    if (score <= 15) return 'Leve'
    if (score <= 25) return 'Moderada'
    return 'Grave'
  }
  if (scaleName.includes('BDI') || scaleName.includes('Depressão')) {
    if (score <= 13) return 'Mínima'
    if (score <= 19) return 'Leve'
    if (score <= 28) return 'Moderada'
    return 'Grave'
  }
  return 'Concluída'
}
