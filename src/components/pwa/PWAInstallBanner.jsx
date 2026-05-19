import { useEffect, useMemo, useState } from 'react'
import { Download, Share, Smartphone, X } from 'lucide-react'
import { isStandalonePWA } from '../../lib/pwa.js'
import { useLang } from '../../contexts/LanguageContext.jsx'

const DISMISS_KEY = 'txpick_install_prompt_dismissed_v1'

function getDeviceInfo() {
  if (typeof window === 'undefined') return { isMobile: false, isIOS: false, isAndroid: false, isSafari: false }

  const ua = window.navigator.userAgent || ''
  const platform = window.navigator.platform || ''
  const maxTouchPoints = window.navigator.maxTouchPoints || 0
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1)
  const isAndroid = /Android/i.test(ua)
  const isMobile = isIOS || isAndroid || /Mobi/i.test(ua)
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua)

  return { isMobile, isIOS, isAndroid, isSafari }
}

function wasDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function rememberDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // localStorage may be blocked in private mode. Ignore silently.
  }
}

const copy = {
  vi: {
    androidTitle: 'Cài TXPick trước khi dùng',
    androidBody: 'Cài lên màn hình chính để mở nhanh và nhận nhắc việc ổn định hơn.',
    androidButton: 'Cài TXPick',
    iosTitle: 'Cài TXPick trên iPhone',
    iosBody: 'Bấm nút Share trong Safari, chọn Add to Home Screen, rồi mở TXPick từ icon ngoài màn hình.',
    iosSteps: 'Safari → Share → Add to Home Screen',
    webTitle: 'Dùng TXPick như một app',
    webBody: 'Mở bằng Chrome hoặc Safari trên điện thoại để cài TXPick lên màn hình chính.',
    later: 'Để sau',
    continueWeb: 'Tiếp tục dùng web',
  },
  en: {
    androidTitle: 'Install TXPick first',
    androidBody: 'Add TXPick to your Home Screen for faster access and more reliable reminders.',
    androidButton: 'Install TXPick',
    iosTitle: 'Install TXPick on iPhone',
    iosBody: 'Tap Share in Safari, choose Add to Home Screen, then open TXPick from the icon.',
    iosSteps: 'Safari → Share → Add to Home Screen',
    webTitle: 'Use TXPick like an app',
    webBody: 'Open TXPick in Chrome or Safari on your phone to add it to your Home Screen.',
    later: 'Later',
    continueWeb: 'Continue on web',
  },
}

export default function PWAInstallBanner({ compact = false, className = '' }) {
  const { lang } = useLang()
  const c = copy[lang]
  const [installPrompt, setInstallPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [ready, setReady] = useState(false)

  const device = useMemo(() => getDeviceInfo(), [])

  useEffect(() => {
    setDismissed(wasDismissed())
    setInstalled(isStandalonePWA())
    setReady(true)

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setDismissed(false)
    }

    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      rememberDismissed()
      setDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const showIOSGuide = device.isIOS && device.isSafari
  const showAndroidInstall = device.isAndroid && Boolean(installPrompt)
  const showGenericMobileGuide = device.isMobile && !showIOSGuide && !showAndroidInstall

  if (!ready || installed || dismissed) return null
  if (!showIOSGuide && !showAndroidInstall && !showGenericMobileGuide) return null

  const title = showAndroidInstall ? c.androidTitle : showIOSGuide ? c.iosTitle : c.webTitle
  const body = showAndroidInstall ? c.androidBody : showIOSGuide ? c.iosBody : c.webBody

  const handleDismiss = () => {
    rememberDismissed()
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    try {
      await installPrompt.userChoice
    } catch {
      // Browser may close the prompt without returning userChoice.
    }
    setInstallPrompt(null)
  }

  return (
    <section className={`rounded-2xl border border-brand-100 bg-white shadow-soft p-4 ${className}`} aria-label={title}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          {showIOSGuide ? <Share className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className={`${compact ? 'text-base' : 'text-lg'} font-extrabold text-ink-900`}>{title}</h2>
              <p className="mt-1 text-sm text-ink-600">{body}</p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
              aria-label={c.later}
              title={c.later}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {showIOSGuide && (
            <div className="mt-3 rounded-xl bg-ink-50 border border-ink-100 px-3 py-2 text-sm font-semibold text-ink-700">
              {c.iosSteps}
            </div>
          )}

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {showAndroidInstall && (
              <button type="button" onClick={handleInstall} className="btn-primary !py-2">
                <Download className="w-4 h-4" /> {c.androidButton}
              </button>
            )}
            <button type="button" onClick={handleDismiss} className="btn-secondary !py-2">
              {showAndroidInstall ? c.continueWeb : c.later}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
