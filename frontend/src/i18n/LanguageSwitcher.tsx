import { useI18n, type Lang } from './I18nContext';
import './LanguageSwitcher.css';

const OPTIONS: { code: Lang; short: string }[] = [
  { code: 'en', short: 'EN' },
  { code: 'om', short: 'OM' },
  { code: 'am', short: '\u12A0\u121B' },
];

interface LanguageSwitcherProps {
  /** Lighter style for transparent hero nav */
  light?: boolean;
}

export default function LanguageSwitcher({ light = false }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={`lang-switch ${light ? 'lang-switch--light' : ''}`} role="group" aria-label={t('lang.label')}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          type="button"
          className={`lang-switch__btn ${lang === opt.code ? 'is-active' : ''}`}
          onClick={() => setLang(opt.code)}
          title={t(`lang.${opt.code}` as 'lang.en' | 'lang.om' | 'lang.am')}
          aria-pressed={lang === opt.code}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
