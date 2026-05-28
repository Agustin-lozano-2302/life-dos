export type BlobDomain = 'habitos' | 'projects' | 'goals' | 'notes' | 'dashboard'

type BlobConfig = { color: string; size: string; top: string; left: string; opacity: string }

const BLOBS: Record<BlobDomain, BlobConfig[]> = {
  habitos: [
    { color: '#f97316', size: '420px', top: '-10%', left: '-5%',  opacity: '0.30' },
    { color: '#8b5cf6', size: '350px', top: '40%',  left: '60%',  opacity: '0.20' },
    { color: '#06b6d4', size: '280px', top: '70%',  left: '10%',  opacity: '0.18' },
  ],
  projects: [
    { color: '#6366f1', size: '450px', top: '-15%', left: '20%',  opacity: '0.28' },
    { color: '#a855f7', size: '360px', top: '50%',  left: '-10%', opacity: '0.20' },
  ],
  goals: [
    { color: '#10b981', size: '420px', top: '-10%', left: '30%',  opacity: '0.28' },
    { color: '#8b5cf6', size: '300px', top: '55%',  left: '60%',  opacity: '0.20' },
  ],
  notes: [
    { color: '#8b5cf6', size: '420px', top: '-5%',  left: '-10%', opacity: '0.30' },
    { color: '#6366f1', size: '350px', top: '50%',  left: '55%',  opacity: '0.20' },
  ],
  dashboard: [
    { color: '#0ea5e9', size: '420px', top: '-10%', left: '10%',  opacity: '0.28' },
    { color: '#8b5cf6', size: '350px', top: '50%',  left: '55%',  opacity: '0.20' },
  ],
}

export function GlassBlobs({ domain }: { domain: BlobDomain }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS[domain].map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[70px]"
          style={{
            backgroundColor: b.color,
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  )
}
