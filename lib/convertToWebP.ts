async function imageToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        blob => {
          if (blob) {
            const name = file.name.replace(/\.[^.]+$/, '.webp')
            resolve(new File([blob], name, { type: 'image/webp' }))
          } else {
            reject(new Error('Échec de la conversion WebP'))
          }
        },
        'image/webp',
        0.92
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Impossible de charger l'image"))
    }
    img.src = url
  })
}

async function pdfToWebPs(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const baseName = file.name.replace(/\.pdf$/i, '')
  const results: File[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(pageNum, pdf.numPages)
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise

    const webpFile = await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            const suffix = pdf.numPages > 1 ? `_p${pageNum}` : ''
            resolve(new File([blob], `${baseName}${suffix}.webp`, { type: 'image/webp' }))
          } else {
            reject(new Error(`Échec conversion page ${pageNum}`))
          }
        },
        'image/webp',
        0.92
      )
    })

    results.push(webpFile)
  }

  return results
}

export async function convertToWebP(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  if (file.type === 'application/pdf') {
    return pdfToWebPs(file, onProgress)
  }
  if (file.type === 'image/webp') {
    return [file]
  }
  if (file.type.startsWith('image/')) {
    return [await imageToWebP(file)]
  }
  return [file]
}
