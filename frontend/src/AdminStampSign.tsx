import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import AdminLayout from './AdminLayout';
import { stampApi } from './api';
import { BACKEND_BASE_URL } from './imageUrl';
import './AdminDashboard.css';
import './AdminStampSign.css';

interface AdminStampSignProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'center', label: 'Center' },
];

const SIG_POSITIONS = [
  { value: 'top-of-stamp', label: 'Top of Stamp (Relative)' },
  ...POSITIONS,
];

function fileUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
}

function PagesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const normalized = value.trim().toLowerCase();
  const preset =
    normalized === 'all' || normalized === ''
      ? 'all'
      : normalized === 'first' || normalized === '1'
        ? 'first'
        : normalized === 'last' || normalized === 'end'
          ? 'last'
          : 'custom';

  return (
    <div className="stamp-field" style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <div className="stamp-page-presets" role="group" aria-label={label}>
        {[
          { id: 'all', label: 'All', value: 'all' },
          { id: 'first', label: '1', value: '1' },
          { id: 'last', label: 'Last', value: 'last' },
          { id: 'custom', label: 'Custom', value: preset === 'custom' ? value : '1,2' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            className={`stamp-page-chip${preset === p.id ? ' is-active' : ''}`}
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="all  or  1,2,5-7"
        spellCheck={false}
      />
      <div className="hint">Type <code>all</code>, <code>last</code>, or pages like <code>1,2,5-7</code></div>
    </div>
  );
}

function DropZone({
  label,
  hint,
  accept,
  file,
  onFile,
  onClear,
  icon,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  icon: 'upload' | 'stamp';
}) {
  const [drag, setDrag] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <div>
        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{label}</strong>
        <div className="stamp-file-ok">
          <div className="ok-left">
            <span className="check">✓</span>
            <span title={file.name}>{file.name}</span>
          </div>
          <button type="button" onClick={onClear}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{label}</strong>
      <label
        className={`stamp-dropzone ${drag ? 'is-drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        {icon === 'stamp' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 14h14l-1.5 5h-11L5 14z" />
            <path d="M8 14V9a4 4 0 018 0v5" />
            <path d="M9 9h6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        )}
        <strong>Drag & drop or click</strong>
        <span>{hint}</span>
      </label>
    </div>
  );
}

export default function AdminStampSign({ isDarkTheme, toggleTheme }: AdminStampSignProps) {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [pages, setPages] = useState('all');
  const [signaturePages, setSignaturePages] = useState('all');
  const [position, setPosition] = useState('bottom-right');
  const [signaturePosition, setSignaturePosition] = useState('top-of-stamp');
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState(150);
  const [signatureSize, setSignatureSize] = useState(50);
  const [sigName, setSigName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signatures, setSignatures] = useState<any[]>([]);

  const [resultUrl, setResultUrl] = useState('');
  const [resultName, setResultName] = useState('');
  const [resultId, setResultId] = useState<number | null>(null);
  const [resultBase64, setResultBase64] = useState<string | null>(null);

  const loadSignatures = async () => {
    try {
      const s = await stampApi.getSignatures();
      if (s.success) setSignatures(s.data);
    } catch {
      /* ignore list errors on first paint */
    }
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const triggerDownload = async (opts: {
    id: number;
    name: string;
    pdfBase64?: string | null;
    fallbackUrl?: string;
  }) => {
    try {
      await stampApi.saveResult({
        id: opts.id,
        downloadName: opts.name,
        pdfBase64: opts.pdfBase64,
      });
      return;
    } catch (err: any) {
      if (!opts.fallbackUrl) throw err;
    }
    if (opts.fallbackUrl) {
      const res = await fetch(opts.fallbackUrl);
      if (!res.ok) throw new Error('Could not download stamped PDF');
      const buf = new Uint8Array(await res.arrayBuffer());
      const head =
        buf.length >= 4 ? String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) : '';
      if (head !== '%PDF') {
        throw new Error('Server returned an invalid PDF. Restart the Node app and try again.');
      }
      const copy = new Uint8Array(buf.byteLength);
      copy.set(buf);
      const blob = new Blob([copy], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = opts.name.replace(/[^\w.\-]+/g, '_') || 'stamped.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    }
  };

  const applyStamp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResultUrl('');
    setResultName('');
    setResultId(null);
    setResultBase64(null);
    if (!documentFile) {
      setError('Please upload a document PDF.');
      return;
    }
    if (!stampFile && !signatureFile) {
      setError('Please upload a stamp and/or signature.');
      return;
    }

    try {
      setBusy(true);
      const res = await stampApi.apply({
        document: documentFile,
        stamp: stampFile || undefined,
        signature: signatureFile || undefined,
        pages,
        signaturePages,
        position,
        signaturePosition,
        opacity,
        rotation,
        size,
        signatureSize,
      });

      const url = fileUrl(res.data.url);
      const name = res.data.downloadName || 'stamped.pdf';
      setResultUrl(url);
      setResultName(name);
      setResultId(res.data.id);
      setResultBase64(res.data.pdfBase64 || null);
      await triggerDownload({
        id: res.data.id,
        name,
        pdfBase64: res.data.pdfBase64,
        fallbackUrl: url,
      });
      setSuccess('Stamped PDF ready and downloaded. Open it with any PDF reader.');
    } catch (err: any) {
      setError(err?.message || 'Failed to stamp document');
    } finally {
      setBusy(false);
    }
  };

  const saveSignature = async () => {
    if (!signatureFile) {
      setError('Upload a signature image first.');
      return;
    }
    try {
      setBusy(true);
      setError('');
      await stampApi.saveSignature(signatureFile, sigName);
      setSuccess('Signature saved for later.');
      setSigName('');
      loadSignatures();
    } catch (err: any) {
      setError(err?.message || 'Failed to save signature');
    } finally {
      setBusy(false);
    }
  };

  const useSavedSignature = async (sig: any) => {
    try {
      const res = await fetch(fileUrl(sig.imageUrl));
      const blob = await res.blob();
      const ext = sig.imageUrl.split('.').pop() || 'png';
      const file = new File([blob], `${sig.name}.${ext}`, { type: blob.type || 'image/png' });
      setSignatureFile(file);
      setSuccess(`Loaded saved signature: ${sig.name}`);
    } catch {
      setError('Could not load saved signature');
    }
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="stamp">
      <div className="dashboard-content" style={{ overflow: 'auto', padding: '2rem' }}>
        <div className="stamp-page">
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Stamp & Sign</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Upload a PDF, apply a company stamp and optional signature, then download a secured file.
            </p>
          </div>

          <form onSubmit={applyStamp}>
              <div className="stamp-card">
                <h2 className="stamp-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  Upload Files
                </h2>
                <div className="stamp-upload-grid">
                  <DropZone
                    label="Document (PDF/DOC/DOCX)"
                    hint="PDF, DOC, DOCX — stamping requires PDF"
                    accept=".pdf,.doc,.docx,application/pdf"
                    file={documentFile}
                    onFile={setDocumentFile}
                    onClear={() => setDocumentFile(null)}
                    icon="upload"
                  />
                  <DropZone
                    label="Stamp (Image or PDF)"
                    hint="PNG, JPG, PDF"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    file={stampFile}
                    onFile={setStampFile}
                    onClear={() => setStampFile(null)}
                    icon="stamp"
                  />
                </div>
              </div>

              <div className="stamp-card">
                <h2 className="stamp-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 14h14l-1.5 5h-11L5 14z" />
                    <path d="M8 14V9a4 4 0 018 0v5" />
                  </svg>
                  Stamp Settings
                </h2>
                <div className="stamp-settings-grid">
                  <div>
                    <PagesField label="Pages to Stamp" value={pages} onChange={setPages} />
                    <div className="stamp-field">
                      <label>Position</label>
                      <select value={position} onChange={(e) => setPosition(e.target.value)}>
                        {POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="stamp-slider">
                      <div className="slider-head">
                        <span>Ink strength</span>
                        <span>{opacity}%</span>
                      </div>
                      <input type="range" min={35} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                    </div>
                    <div className="stamp-slider">
                      <div className="slider-head">
                        <span>Rotation</span>
                        <span>{rotation}°</span>
                      </div>
                      <input type="range" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
                    </div>
                    <div className="stamp-slider">
                      <div className="slider-head">
                        <span>Size</span>
                        <span>{size}px</span>
                      </div>
                      <input type="range" min={40} max={320} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="stamp-card">
                <h2 className="stamp-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19c2-4 5-7 8-8 2 3 4 5 4 8" />
                    <path d="M14 11c2-1 4-1 6 0" />
                  </svg>
                  Signature (Optional)
                </h2>
                <DropZone
                  label="Signature image"
                  hint="PNG or JPG"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  file={signatureFile}
                  onFile={setSignatureFile}
                  onClear={() => setSignatureFile(null)}
                  icon="upload"
                />
                <div className="stamp-save-row">
                  <input
                    type="text"
                    placeholder="Signature name (optional)"
                    value={sigName}
                    onChange={(e) => setSigName(e.target.value)}
                  />
                  <button type="button" className="btn btn-outline" onClick={saveSignature} disabled={busy || !signatureFile}>
                    Save
                  </button>
                </div>
                <div className="stamp-settings-grid" style={{ marginTop: '1.25rem' }}>
                  <div>
                    <PagesField label="Pages to Sign" value={signaturePages} onChange={setSignaturePages} />
                    <div className="stamp-field">
                      <label>Signature Position</label>
                      <select value={signaturePosition} onChange={(e) => setSignaturePosition(e.target.value)}>
                        {SIG_POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="stamp-slider">
                    <div className="slider-head">
                      <span>Signature Size</span>
                      <span>{signatureSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={signatureSize}
                      onChange={(e) => setSignatureSize(Number(e.target.value))}
                    />
                  </div>
                </div>

                {signatures.length > 0 && (
                  <div className="stamp-sig-list">
                    {signatures.map((sig) => (
                      <div key={sig.id} className="stamp-sig-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={fileUrl(sig.imageUrl)} alt={sig.name} />
                          <span>{sig.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" className="btn btn-outline" style={{ padding: '0.35rem 0.7rem' }} onClick={() => useSavedSignature(sig)}>
                            Use
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.7rem', color: '#dc2626' }}
                            onClick={async () => {
                              await stampApi.deleteSignature(sig.id);
                              loadSignatures();
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="stamp-security">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                </svg>
                <p>
                  Stamps use an ink blend (Multiply) so text under the stamp stays readable without washing out stamp
                  quality. The result is flattened into the PDF and metadata is stripped.
                </p>
              </div>

              {error && <p className="stamp-error">{error}</p>}
              {success && <p className="stamp-success">{success}</p>}
              {resultId != null && (
                <div className="stamp-download-row" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ color: '#000' }}
                    onClick={() =>
                      triggerDownload({
                        id: resultId,
                        name: resultName,
                        pdfBase64: resultBase64,
                        fallbackUrl: resultUrl,
                      }).catch((err: any) => setError(err?.message || 'Download failed'))
                    }
                  >
                    Download stamped PDF
                  </button>
                  {resultUrl && (
                    <a className="btn btn-outline" href={resultUrl} target="_blank" rel="noopener noreferrer">
                      Open in new tab
                    </a>
                  )}
                </div>
              )}

              <button type="submit" className="stamp-apply-btn" disabled={busy}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 14h14l-1.5 5h-11L5 14z" />
                  <path d="M8 14V9a4 4 0 018 0v5" />
                </svg>
                {busy ? 'Processing…' : 'Apply Secure Stamp & Download'}
              </button>
            </form>
        </div>
      </div>
    </AdminLayout>
  );
}
