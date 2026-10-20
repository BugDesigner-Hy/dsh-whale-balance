/**
 * Client half of the balance-vessel bundle.
 *
 * One frame-wide floating entry in `shell.overlay`: the DeepSeek whale mark used
 * as a vessel whose water level follows the account balance.
 *
 *  - balance arrives from the account Remote (`remote.account`), live via its
 *    `watch` stream with a polling fallback;
 *  - the water level is scaled by the full amount the user sets (default
 *    ¥100 / $15), configurable per currency in the panel's settings;
 *  - the panel above the mark shows the exact amounts, today's and the weekly
 *    spend, an estimate of remaining days, a refresh action and the top-up link;
 *  - low balance is alerted by amount or by a percentage of the full amount;
 *  - the mark is draggable and remembers where it was left.
 *
 * The whale path is the official mark shipped with this application
 * (`@deepseek-ai/dsh-client-ui-primitives`, MIT, © DeepSeek). Everything else
 * here is original.
 */
window.__ModuleLoader__.load({
  id: '@local/balance-vessel',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NAMESPACE = 'balance-vessel'
    const REFRESH_MS = 60000
    const RETRY_MS = 5000
    const DAY_MS = 86400000
    const LEDGER_KEY = 'balance-vessel:v1:ledger'
    const POSITION_KEY = 'balance-vessel:v1:position'
    const CURRENCY_KEY = 'balance-vessel:v1:currency'
    const SETTINGS_KEY = 'balance-vessel:v1:settings'
    const TOOLTIP_FLIP_AT = 200
    const TOOLTIP_ALIGN_AT = 286

    /* Vessel geometry: the official mark's own viewBox. */
    const WHALE_VIEWBOX = '0 0 23.16 17.04'
    const WHALE_WIDTH = 23.16
    const WHALE_HEIGHT = 17.04
    const WHALE_PATH = 'M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z'

    /*
     * Wave crests, drawn in the vessel's user units. One period is 11.58, so the
     * keyframes shift by exactly one period and the loop is seamless.
     */
    const WAVE = 'q5.79 -1.02 11.58 0 t11.58 0 t11.58 0 t11.58 0 t11.58 0 t11.58 0'
    const WAVE_BACK = 'M-23.16 0 q5.79 0.86 11.58 0 t11.58 0 t11.58 0 t11.58 0 t11.58 0 t11.58 0 V22 H-23.16 Z'
    const WAVE_FRONT = 'M-23.16 0 ' + WAVE + ' V22 H-23.16 Z'
    const WAVE_LINE = 'M-23.16 0 ' + WAVE

    const WATER = { base: '#4D6BFE', light: '#8FA7FF', surface: '#C3D2FF' }
    const WATER_LOW = { base: '#E39A2E', light: '#F4C173', surface: '#FFE3B8' }

    /* Used until the user configures a scale, and as the low-balance floor. */
    const FALLBACK_FULL = { CNY: 100, USD: 15 }
    const FLOOR_LOW = { CNY: 5, USD: 1 }
    const DEFAULT_PERCENT = 10

    const SYMBOLS = { CNY: '\u00a5', USD: '$' }

    const DICTIONARIES = {
      en: {
        label: 'Account balance',
        title: 'Account balance',
        bonus: 'Bonus',
        today: 'today',
        week: 'last 7 days',
        full: 'full',
        daysLeft: '\u2248 {n} days left',
        hoursLeft: '\u2248 {n} h left',
        lowHint: 'below the alert threshold',
        loading: 'Reading balance\u2026',
        signedOut: 'Sign in to see your balance',
        error: 'Balance unavailable',
        retry: 'Use refresh to try again',
        unavailable: 'Account service not available',
        refresh: 'Refresh balance',
        topUp: 'Top up',
        settings: 'Settings',
        fullAmount: 'Full at',
        alert: 'Alert',
        alertAmount: 'amount',
        alertPercent: 'percent',
        threshold: 'Threshold',
        thresholdNow: '\u2248',
        reset: 'Reset',
        done: 'Done',
        updatedNow: 'updated just now',
        updatedMinutes: 'updated {n} min ago',
      },
      zh: {
        label: '账户余额',
        title: '账户余额',
        bonus: '赠送',
        today: '今日',
        week: '近 7 天',
        full: '满杯',
        daysLeft: '约可用 {n} 天',
        hoursLeft: '约可用 {n} 小时',
        lowHint: '低于提醒阈值',
        loading: '正在读取余额…',
        signedOut: '登录后可查看余额',
        error: '暂无余额数据',
        retry: '可点刷新重试',
        unavailable: '账户服务不可用',
        refresh: '刷新余额',
        topUp: '去充值',
        settings: '设置',
        fullAmount: '满杯金额',
        alert: '提醒',
        alertAmount: '金额',
        alertPercent: '百分比',
        threshold: '阈值',
        thresholdNow: '约',
        reset: '恢复默认',
        done: '完成',
        updatedNow: '刚刚更新',
        updatedMinutes: '{n} 分钟前更新',
      },
    }

    const STYLE = [
      '.bv-root{position:fixed;z-index:40;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;font-family:inherit}',
      '.bv-button{pointer-events:auto;touch-action:none;user-select:none;position:relative;display:flex;align-items:center;justify-content:center;width:46px;height:46px;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l1);border-radius:15px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:grab;box-shadow:0 6px 18px rgba(15,23,42,.10);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}',
      '.bv-button:hover{border-color:var(--dsw-alias-border-l2);box-shadow:0 12px 26px rgba(15,23,42,.16)}',
      '.bv-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.bv-root[data-dragging="true"] .bv-button{cursor:grabbing;transform:none;box-shadow:0 16px 32px rgba(15,23,42,.22)}',
      '.bv-root[data-low="true"] .bv-button{border-color:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 3px rgba(227,154,46,.16),0 8px 22px rgba(15,23,42,.14)}',
      '.bv-root[data-pulse="true"] .bv-button{animation:bv-pulse 1.15s ease-in-out 3}',
      '@keyframes bv-pulse{0%,100%{box-shadow:0 0 0 3px rgba(227,154,46,.16),0 8px 22px rgba(15,23,42,.14)}50%{box-shadow:0 0 0 9px rgba(227,154,46,0),0 10px 26px rgba(15,23,42,.18)}}',
      '.bv-whale{display:block;overflow:visible}',
      '.bv-swim{animation:bv-swim 4.2s ease-in-out infinite;transform-box:fill-box;transform-origin:34% 74%}',
      '@keyframes bv-swim{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}',
      '.bv-outline{fill:none;stroke:currentColor;stroke-width:.4;stroke-opacity:.5;stroke-linejoin:round}',
      '.bv-level{transition:transform .9s cubic-bezier(.22,1,.36,1),opacity .25s ease}',
      '.bv-wave{animation:bv-drift 3.8s linear infinite}',
      '.bv-wave-back{animation:bv-drift-reverse 5.6s linear infinite}',
      '.bv-highlight{animation:bv-drift 3.8s linear infinite}',
      '@keyframes bv-drift{from{transform:translateX(0)}to{transform:translateX(-11.58px)}}',
      '@keyframes bv-drift-reverse{from{transform:translateX(0)}to{transform:translateX(11.58px)}}',
      '@media (prefers-reduced-motion:reduce){.bv-swim{animation:none}.bv-wave,.bv-wave-back,.bv-highlight{animation:none}.bv-level{transition:none}.bv-root[data-pulse="true"] .bv-button{animation:none}.bv-icon[data-spin="true"] svg{animation:none}}',
      '.bv-tip{position:absolute;right:0;bottom:calc(100% + 10px);width:max-content;min-width:184px;max-width:256px;padding:10px 12px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:13px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 16px 38px rgba(15,23,42,.18);opacity:0;visibility:hidden;transform:translateY(6px) scale(.985);transform-origin:bottom right;transition:opacity .16s ease,transform .16s ease;pointer-events:none;text-align:left}',
      '.bv-root[data-open="true"] .bv-tip{opacity:1;visibility:visible;transform:none;pointer-events:auto}',
      '.bv-tip::after{content:"";position:absolute;left:0;right:0;bottom:-12px;height:12px}',
      '.bv-root[data-flip="true"] .bv-tip{bottom:auto;top:calc(100% + 10px);transform:translateY(-6px) scale(.985);transform-origin:top right}',
      '.bv-root[data-flip="true"][data-open="true"] .bv-tip{transform:none}',
      '.bv-root[data-flip="true"] .bv-tip::after{bottom:auto;top:-12px}',
      '.bv-root[data-align="left"] .bv-tip{right:auto;left:0;transform-origin:bottom left}',
      '.bv-root[data-align="left"][data-flip="true"] .bv-tip{transform-origin:top left}',
      '.bv-head{display:flex;align-items:center;justify-content:space-between;gap:10px}',
      '.bv-tip-label{font-size:11px;line-height:14px;letter-spacing:.02em;color:var(--dsw-alias-label-secondary)}',
      '.bv-icon{display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .15s ease,color .15s ease}',
      '.bv-icon:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.bv-icon[disabled]{opacity:.4;cursor:default}',
      '.bv-icon[data-spin="true"] svg{animation:bv-spin .9s linear infinite}',
      '@keyframes bv-spin{to{transform:rotate(360deg)}}',
      '.bv-wallets{margin-top:5px;display:flex;flex-direction:column;gap:2px}',
      '.bv-wallet{display:flex;align-items:center;gap:6px;margin:0;padding:1px 0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}',
      '.bv-wallet .bv-dot{width:5px;height:5px;flex:none;border-radius:50%;background:transparent}',
      '.bv-wallet[aria-pressed="true"] .bv-dot{background:var(--dsw-alias-brand-primary)}',
      '.bv-amount{font-size:16px;line-height:20px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.bv-wallet[aria-pressed="false"] .bv-amount{font-size:12.5px;line-height:17px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
      '.bv-bonus{margin:2px 0 0 11px;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.bv-stats{display:flex;flex-wrap:wrap;gap:2px 12px;margin-top:7px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.bv-warn{margin-top:4px;font-size:11px;line-height:15px;color:var(--dsw-alias-state-warn-primary)}',
      '.bv-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;padding-top:7px;border-top:1px solid var(--dsw-alias-border-l1);font-size:10.5px;line-height:13px;color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.bv-link{margin:0;padding:0;border:0;background:none;color:var(--dsw-alias-brand-primary);font:inherit;cursor:pointer}',
      '.bv-link:hover{text-decoration:underline}',
      '.bv-head-actions{display:flex;align-items:center;gap:2px}',
      '.bv-gear[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.bv-set{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:6px}',
      '.bv-set-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-secondary)}',
      '.bv-set-label{white-space:nowrap}',
      '.bv-field{display:inline-flex;align-items:center;gap:4px}',
      '.bv-input{width:62px;padding:2px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;text-align:right;appearance:textfield;-moz-appearance:textfield}',
      '.bv-input::-webkit-outer-spin-button,.bv-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',
      '.bv-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}',
      '.bv-suffix{font-size:10.5px;min-width:9px;color:var(--dsw-alias-label-secondary)}',
      '.bv-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;overflow:hidden}',
      '.bv-seg button{margin:0;padding:2px 7px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10.5px;line-height:15px;cursor:pointer}',
      '.bv-seg button[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.bv-note{font-size:10.5px;line-height:14px;color:var(--dsw-alias-label-secondary);text-align:right}',
      '.bv-set-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;font-size:10.5px;line-height:14px}',
      '.bv-set-foot .bv-link{font-size:10.5px;line-height:14px;letter-spacing:.02em;color:var(--dsw-alias-label-secondary);transition:color .15s ease}',
      '.bv-set-foot .bv-link:hover{color:var(--dsw-alias-brand-primary)}',
      '.bv-message{margin-top:4px;font-size:12px;line-height:16px;color:var(--dsw-alias-label-secondary)}',
      '.bv-root[data-status="error"] .bv-message,.bv-root[data-status="unavailable"] .bv-message{color:var(--dsw-alias-state-warn-primary)}',
      '.bv-root[data-status="loading"] .bv-whale{opacity:.55}',
      '.bv-root[data-status="loading"] .bv-level,.bv-root[data-status="error"] .bv-level,.bv-root[data-status="unavailable"] .bv-level,.bv-root[data-status="signed-out"] .bv-level{opacity:0}',
    ].join('\n')

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), Math.max(min, max))
    }

    function readJson(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key)
        return raw === null ? fallback : JSON.parse(raw)
      } catch (_error) {
        return fallback
      }
    }

    function writeJson(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (_error) {
        return false
      }
    }

    function loadLedger() {
      const value = readJson(LEDGER_KEY, null)
      return value !== null && typeof value === 'object' ? value : {}
    }

    function readPosition() {
      const value = readJson(POSITION_KEY, null)
      if (value === null || typeof value !== 'object') return null
      if (!Number.isFinite(value.left) || !Number.isFinite(value.top)) return null
      const width = typeof window === 'undefined' ? 1024 : window.innerWidth
      const height = typeof window === 'undefined' ? 768 : window.innerHeight
      return {
        left: clamp(value.left, 8, Math.max(8, width - 54)),
        top: clamp(value.top, 8, Math.max(8, height - 54)),
      }
    }

    function readCurrency() {
      const value = readJson(CURRENCY_KEY, null)
      return typeof value === 'string' && value !== '' ? value : null
    }

    function defaultSettings() {
      return {
        alert: 'amount',
        full: Object.assign({}, FALLBACK_FULL),
        low: Object.assign({}, FLOOR_LOW),
        percent: DEFAULT_PERCENT,
      }
    }

    function positive(value, fallback) {
      const parsed = Number(value)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
    }

    function loadSettings() {
      const settings = defaultSettings()
      const stored = readJson(SETTINGS_KEY, null)
      if (stored === null || typeof stored !== 'object') return settings
      if (stored.alert === 'percent' || stored.alert === 'amount') settings.alert = stored.alert
      settings.percent = Math.min(100, positive(stored.percent, settings.percent))
      for (const currency of Object.keys(settings.full)) {
        if (stored.full && stored.full[currency] !== undefined) {
          settings.full[currency] = positive(stored.full[currency], settings.full[currency])
        }
        if (stored.low && stored.low[currency] !== undefined) {
          settings.low[currency] = positive(stored.low[currency], settings.low[currency])
        }
      }
      return settings
    }

    /**
     * Append one balance observation. A sample is stored only when the amount
     * changes, so the series stays small: each entry marks a decrease (spend) or
     * an increase (top-up or bonus).
     */
    function recordSample(ledger, currency, amount, at) {
      const series = Array.isArray(ledger[currency]) ? ledger[currency] : []
      const last = series[series.length - 1]
      if (last !== undefined && last.b === amount) return false
      series.push({ t: at, b: amount })
      const cutoff = at - 8 * DAY_MS
      while (series.length > 0 && series[0].t < cutoff) series.shift()
      if (series.length > 4000) series.splice(0, series.length - 4000)
      ledger[currency] = series
      return true
    }

    /** Sum of the balance decreases observed inside [from, to). */
    function spendBetween(ledger, currency, from, to) {
      const series = Array.isArray(ledger[currency]) ? ledger[currency] : []
      let total = 0
      for (let index = 1; index < series.length; index += 1) {
        const previous = series[index - 1]
        const current = series[index]
        if (current.t <= from || current.t > to) continue
        const drop = Number(previous.b) - Number(current.b)
        if (drop > 0) total += drop
      }
      return total
    }

    function startOfToday(now) {
      const date = new Date(now)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    }

    /** How many days of observations exist for one currency (capped at 7). */
    function observedDays(ledger, currency, now) {
      const series = Array.isArray(ledger[currency]) ? ledger[currency] : []
      if (series.length < 2) return 0
      const span = Math.min(7 * DAY_MS, now - series[0].t)
      return Math.max(0, span / DAY_MS)
    }

    function symbolOf(currency) {
      return SYMBOLS[currency] || ''
    }

    function money(value, currency) {
      const text = Number.isFinite(value)
        ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : String(value)
      return symbolOf(currency) + ' ' + text
    }

    function amountText(wallet) {
      return money(Number(wallet.balance), wallet.currency)
    }

    /**
     * Linear fill: the water height is exactly balance / full. 40 of a 100
     * scale fills 40% of the vessel, which is what the number suggests.
     */
    function fillOf(value, full) {
      if (!Number.isFinite(value) || value <= 0) return 0
      const scale = Number.isFinite(full) && full > 0 ? full : 1
      return Math.max(0, Math.min(1, value / scale))
    }

    function daysText(days, t) {
      if (days >= 1) return t('daysLeft').replace('{n}', String(Math.min(999, Math.round(days))))
      return t('hoursLeft').replace('{n}', String(Math.max(1, Math.round(days * 24))))
    }

    function RefreshIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': true, focusable: 'false' },
        h('path', {
          d: 'M12.7 8a4.7 4.7 0 1 1-1.4-3.3',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M12.8 2.9v2.9H9.9',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      )
    }

    /* The host's own settings (gear) glyph, 16x16, stroked with currentColor. */
    const GEAR_HUB =
      'M8 9.75012C8.9665 9.75012 9.75 8.96662 9.75 8.00012C9.75 7.03362 8.9665 6.25012 8 6.25012C7.0335 6.25012 6.25 7.03362 6.25 8.00012C6.25 8.96662 7.0335 9.75012 8 9.75012Z'
    const GEAR_BODY =
      'M13.0107 7.79377C12.9505 7.89401 12.9205 7.94413 12.9205 7.99951C12.9205 8.0549 12.9505 8.10502 13.0106 8.20528L13.9849 9.83006C14.045 9.93029 14.0751 9.9804 14.0751 10.0358C14.0751 10.0911 14.045 10.1413 13.9849 10.2415L13.0037 11.8777C12.9468 11.9726 12.9184 12.0201 12.8725 12.0461C12.8267 12.072 12.7713 12.072 12.6607 12.072H10.6704C10.5598 12.072 10.5045 12.072 10.4586 12.098C10.4128 12.1239 10.3843 12.1714 10.3274 12.2662L9.33825 13.9142C9.28133 14.009 9.25287 14.0564 9.20703 14.0823C9.16118 14.1083 9.10588 14.1083 8.99529 14.1083H7.00486C6.89426 14.1083 6.83896 14.1083 6.79312 14.0823C6.74727 14.0564 6.71881 14.009 6.6619 13.9142L5.67273 12.2662C5.61581 12.1714 5.58735 12.1239 5.54151 12.098C5.49566 12.072 5.44036 12.072 5.32977 12.072H3.33945C3.2288 12.072 3.17347 12.072 3.12761 12.0461C3.08176 12.0201 3.0533 11.9726 2.9964 11.8777L2.0152 10.2415C1.9551 10.1413 1.92505 10.0911 1.92505 10.0358C1.92505 9.9804 1.9551 9.93029 2.0152 9.83006L2.98951 8.20528C3.04963 8.10502 3.07969 8.0549 3.07969 7.99951C3.07968 7.94413 3.04961 7.89401 2.98946 7.79377L2.01529 6.17011C1.95514 6.06987 1.92507 6.01975 1.92507 5.96437C1.92506 5.90899 1.95512 5.85886 2.01524 5.7586L2.9964 4.1224C3.0533 4.0275 3.08176 3.98005 3.12761 3.95408C3.17347 3.92811 3.2288 3.92811 3.33945 3.92811H5.32977C5.44036 3.92811 5.49566 3.92811 5.54151 3.90216C5.58735 3.87621 5.61581 3.82879 5.67273 3.73397L6.6619 2.08599C6.71881 1.99116 6.74727 1.94375 6.79312 1.9178C6.83896 1.89185 6.89426 1.89185 7.00486 1.89185H8.99529C9.10588 1.89185 9.16118 1.89185 9.20703 1.9178C9.25287 1.94375 9.28133 1.99116 9.33825 2.08599L10.3274 3.73397C10.3843 3.82879 10.4128 3.87621 10.4586 3.90216C10.5045 3.92811 10.5598 3.92811 10.6704 3.92811H12.6607C12.7713 3.92811 12.8267 3.92811 12.8725 3.95408C12.9184 3.98005 12.9468 4.0275 13.0037 4.1224L13.9849 5.7586C14.045 5.85886 14.0751 5.90899 14.0751 5.96437C14.0751 6.01975 14.045 6.06987 13.9849 6.17011L13.0107 7.79377Z'

    function GearIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          fill: 'none',
          strokeWidth: 1.1,
          'aria-hidden': true,
          focusable: 'false',
        },
        h('path', { d: GEAR_HUB, stroke: 'currentColor' }),
        h('path', { d: GEAR_BODY, stroke: 'currentColor', strokeMiterlimit: 10 })
      )
    }

    /** Number input that commits on blur or Enter, so partial typing is allowed. */
    function NumberField(props) {
      const [text, setText] = React.useState(String(props.value))
      const [focused, setFocused] = React.useState(false)
      React.useEffect(() => {
        if (!focused) setText(String(props.value))
      }, [props.value, focused])
      const commit = () => {
        const parsed = Number(text)
        if (Number.isFinite(parsed) && parsed > 0) {
          props.onCommit(clamp(parsed, props.min === undefined ? 0.01 : props.min, props.max === undefined ? 1000000000 : props.max))
        } else {
          setText(String(props.value))
        }
      }
      return h(
        'span',
        { className: 'bv-field' },
        h('input', {
          type: 'number',
          className: 'bv-input',
          value: text,
          min: props.min,
          max: props.max,
          step: props.step === undefined ? 'any' : props.step,
          'aria-label': props.ariaLabel,
          onChange: (event) => setText(event.target.value),
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false)
            commit()
          },
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            } else if (event.key === 'Escape') {
              event.stopPropagation()
              setText(String(props.value))
              event.currentTarget.blur()
            }
          },
        }),
        props.suffix === undefined ? null : h('span', { className: 'bv-suffix' }, props.suffix)
      )
    }

    function Segmented(props) {
      return h(
        'span',
        { className: 'bv-seg', role: 'group', 'aria-label': props.ariaLabel },
        props.options.map((option) =>
          h(
            'button',
            {
              key: option.value,
              type: 'button',
              'aria-pressed': props.value === option.value ? 'true' : 'false',
              onClick: () => props.onChange(option.value),
            },
            option.label
          )
        )
      )
    }

    function Whale(props) {
      const palette = props.low ? WATER_LOW : WATER
      const offset = (1 - props.level) * WHALE_HEIGHT
      return h(
        'svg',
        {
          className: 'bv-whale',
          viewBox: WHALE_VIEWBOX,
          width: 30,
          height: (30 * WHALE_HEIGHT) / WHALE_WIDTH,
          'aria-hidden': true,
          focusable: 'false',
        },
        h('defs', null, h('clipPath', { id: 'bv-vessel-clip' }, h('path', { d: WHALE_PATH }))),
        h(
          'g',
          { className: 'bv-swim' },
          h('path', { d: WHALE_PATH, fill: 'currentColor', fillOpacity: props.level > 0 ? 0.1 : 0.16 }),
          h(
            'g',
            { clipPath: 'url(#bv-vessel-clip)' },
            h(
              'g',
              { className: 'bv-level', style: { transform: 'translateY(' + offset + 'px)' } },
              h('path', { className: 'bv-wave bv-wave-back', d: WAVE_BACK, fill: palette.light }),
              h('rect', { x: -24, y: 0, width: 72, height: 24, fill: palette.base }),
              h('path', { className: 'bv-wave', d: WAVE_FRONT, fill: palette.base }),
              h('path', {
                className: 'bv-highlight',
                d: WAVE_LINE,
                fill: 'none',
                stroke: palette.surface,
                strokeWidth: 0.3,
                strokeOpacity: 0.8,
                strokeLinecap: 'round',
              })
            )
          ),
          h('path', { className: 'bv-outline', d: WHALE_PATH })
        )
      )
    }

    function BalanceVessel(props) {
      const { ctx, t } = props
      const [open, setOpen] = React.useState(false)
      const [now, setNow] = React.useState(0)
      const [snapshot, setSnapshot] = React.useState({
        status: 'loading',
        wallets: [],
        bonus: [],
        links: null,
        at: 0,
      })
      const [position, setPosition] = React.useState(readPosition)
      const [dragging, setDragging] = React.useState(false)
      const [placement, setPlacement] = React.useState({ flip: false, align: 'right' })
      const [pulse, setPulse] = React.useState(false)
      const [refreshing, setRefreshing] = React.useState(false)
      const [currency, setCurrency] = React.useState(readCurrency)
      const [ledger, setLedger] = React.useState(loadLedger)
      const [settings, setSettings] = React.useState(loadSettings)
      const [editing, setEditing] = React.useState(false)

      const rootRef = React.useRef(null)
      const buttonRef = React.useRef(null)
      const dragRef = React.useRef(null)
      const suppressClick = React.useRef(false)
      const closeTimer = React.useRef(0)
      const generation = React.useRef(0)
      const mounted = React.useRef(true)
      const current = React.useRef(snapshot)
      const currencyRef = React.useRef(currency)
      const lowRef = React.useRef(false)
      current.current = snapshot
      currencyRef.current = currency

      React.useEffect(() => {
        mounted.current = true
        return () => {
          mounted.current = false
          window.clearTimeout(closeTimer.current)
        }
      }, [])

      const resolveRemote = () => {
        try {
          return ctx.get('remote')
        } catch (_error) {
          return undefined
        }
      }

      const resolveAccount = () => {
        try {
          const direct = ctx.get('remote.account')
          if (direct !== undefined) return direct
        } catch (_error) {
          /* the namespace may not exist yet */
        }
        const remote = resolveRemote()
        return remote === undefined || remote === null ? undefined : remote.account
      }

      const metadata = () => ({
        version: readVersion(),
        locale: ctx.locale.getSnapshot().active,
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      })

      const readVersion = () => {
        try {
          const modules = ctx.get('modules')
          const graph = modules && typeof modules.graph === 'function' ? modules.graph() : undefined
          const release = graph && graph.release
          if (release && typeof release.version === 'string' && release.version) return release.version
        } catch (_error) {
          /* fall through to the build constant */
        }
        return '0.2.1-rc.2'
      }

      const record = React.useCallback((wallets) => {
        if (!Array.isArray(wallets) || wallets.length === 0) return
        const preferred = currencyRef.current
        const wallet =
          wallets.find((item) => item.currency === preferred) ||
          wallets.find((item) => item.currency === 'CNY') ||
          wallets[0]
        const amount = Number(wallet.balance)
        if (!Number.isFinite(amount)) return
        const at = Date.now()
        setLedger((previous) => {
          const next = Object.assign({}, previous)
          const series = Array.isArray(previous[wallet.currency]) ? previous[wallet.currency].slice() : []
          next[wallet.currency] = series
          if (!recordSample(next, wallet.currency, amount, at)) return previous
          writeJson(LEDGER_KEY, next)
          return next
        })
      }, [])

      const pull = React.useCallback(async () => {
        const mine = ++generation.current
        const account = resolveAccount()
        if (!account || typeof account.getBalance !== 'function') {
          if (current.current.status !== 'ready') {
            setSnapshot((previous) => Object.assign({}, previous, { status: 'unavailable' }))
          }
          return
        }
        setRefreshing(true)
        try {
          const result = await account.getBalance(metadata())
          if (mine !== generation.current || !mounted.current) return
          if (!result || result.ok !== true) {
            setSnapshot((previous) => Object.assign({}, previous, { status: 'error' }))
            return
          }
          const value = result.value
          if (value === null || value === undefined) {
            setSnapshot((previous) =>
              Object.assign({}, previous, { status: 'signed-out', wallets: [], bonus: [], at: 0 })
            )
            return
          }
          if (value.status !== 'ready') {
            setSnapshot((previous) => Object.assign({}, previous, { status: 'error' }))
            return
          }
          const wallets = Array.isArray(value.value) ? value.value : []
          const bonus = Array.isArray(value.bonusWallets) ? value.bonusWallets : []
          setSnapshot((previous) =>
            Object.assign({}, previous, { status: 'ready', wallets, bonus, at: Date.now() })
          )
          record(wallets)
        } catch (_error) {
          if (mine === generation.current && mounted.current) {
            setSnapshot((previous) => Object.assign({}, previous, { status: 'error' }))
          }
        } finally {
          if (mounted.current) setRefreshing(false)
        }
      }, [ctx, record])

      React.useEffect(() => {
        let stopped = false
        let refreshTimer = 0
        let retryTimer = 0
        let stream
        const remote = resolveRemote()
        const account = resolveAccount()

        retryTimer = window.setInterval(() => {
          if (document.hidden) return
          const status = current.current.status
          if (status === 'error' || status === 'unavailable' || status === 'loading') pull()
        }, RETRY_MS)

        const startPolling = () => {
          if (refreshTimer !== 0) return
          refreshTimer = window.setInterval(() => {
            if (!document.hidden && current.current.status === 'ready') pull()
          }, REFRESH_MS)
        }

        const loadLinks = async () => {
          if (typeof account.getState !== 'function') return
          try {
            const state = await account.getState()
            if (stopped || !mounted.current) return
            if (state && state.links) {
              setSnapshot((previous) => Object.assign({}, previous, { links: state.links }))
            }
          } catch (_error) {
            /* the top-up link simply stays unknown */
          }
        }

        const run = async () => {
          if (!account) {
            startPolling()
            return
          }
          if (!remote || typeof remote.$stream !== 'function' || typeof account.watch !== 'function') {
            await loadLinks()
            await pull()
            if (!stopped) startPolling()
            return
          }
          try {
            stream = remote.$stream({
              name: 'account',
              open: (signal) => account.watch(signal),
              ended: () => new Error('account stream ended'),
            })
            for await (const frame of stream) {
              if (stopped) break
              const view = frame && frame.value
              if (frame && typeof frame.accept === 'function') frame.accept()
              if (!view) continue
              if (view.links) {
                setSnapshot((previous) => Object.assign({}, previous, { links: view.links }))
              }
              if (view.status === 'credential-stored') {
                await pull()
              } else {
                setSnapshot((previous) =>
                  Object.assign({}, previous, { status: 'signed-out', wallets: [], bonus: [], at: 0 })
                )
              }
            }
          } catch (_error) {
            /* stream unavailable: polling below keeps the value fresh */
          }
          if (!stopped) startPolling()
        }

        run()

        const onVisible = () => {
          if (!document.hidden) pull()
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          stopped = true
          window.clearInterval(refreshTimer)
          window.clearInterval(retryTimer)
          document.removeEventListener('visibilitychange', onVisible)
          try {
            if (stream && typeof stream.dispose === 'function') stream.dispose()
          } catch (_error) {
            /* already closed */
          }
        }
      }, [pull])

      React.useEffect(() => {
        if (!open) return undefined
        setNow(Date.now())
        const tick = window.setInterval(() => setNow(Date.now()), 20000)
        return () => window.clearInterval(tick)
      }, [open])

      React.useEffect(() => {
        const onResize = () => {
          setPosition((previous) =>
            previous === null
              ? previous
              : {
                  left: clamp(previous.left, 8, Math.max(8, window.innerWidth - 54)),
                  top: clamp(previous.top, 8, Math.max(8, window.innerHeight - 54)),
                }
          )
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [])

      const wallets = snapshot.wallets
      const selected =
        wallets.find((wallet) => wallet.currency === currency) ||
        wallets.find((wallet) => wallet.currency === 'CNY') ||
        wallets[0] ||
        null
      const selectedCurrency = selected === null ? currency || 'CNY' : selected.currency
      const balance = selected === null ? 0 : Number(selected.balance)
      const stamp = now || Date.now()
      const todaySpend = spendBetween(ledger, selectedCurrency, startOfToday(stamp), stamp)
      const weekSpend = spendBetween(ledger, selectedCurrency, stamp - 7 * DAY_MS, stamp)
      /*
       * The vessel scale is fixed by the user. Observed spend only feeds the
       * "days left" estimate: with less than a week of history, extrapolate from
       * the observed span so one day of usage is not read as a whole week.
       */
      const spanDays = observedDays(ledger, selectedCurrency, stamp)
      const weeklyEstimate = spanDays >= 1 ? weekSpend * (7 / Math.min(7, spanDays)) : 0
      const dailyRate = weeklyEstimate / 7
      const fixedFull =
        settings.full[selectedCurrency] !== undefined
          ? settings.full[selectedCurrency]
          : FALLBACK_FULL[selectedCurrency] || FALLBACK_FULL.CNY
      /* The full amount is whatever the user set for this currency. */
      const fullAt = fixedFull
      const fixedLow =
        settings.low[selectedCurrency] !== undefined
          ? settings.low[selectedCurrency]
          : FLOOR_LOW[selectedCurrency] || FLOOR_LOW.CNY
      const lowAt = settings.alert === 'percent' ? fullAt * (settings.percent / 100) : fixedLow
      const level = snapshot.status === 'ready' && selected !== null ? fillOf(balance, fullAt) : 0
      const low = snapshot.status === 'ready' && selected !== null && balance < lowAt
      const daysLeft = dailyRate > 0.01 && balance > 0 ? balance / dailyRate : null

      React.useEffect(() => {
        if (low && !lowRef.current) {
          lowRef.current = true
          setPulse(true)
          const timer = window.setTimeout(() => setPulse(false), 3600)
          return () => window.clearTimeout(timer)
        }
        if (!low) lowRef.current = false
        return undefined
      }, [low])

      const updatePlacement = () => {
        const element = rootRef.current
        if (element === null) return
        const rect = element.getBoundingClientRect()
        setPlacement({
          flip: rect.top < TOOLTIP_FLIP_AT,
          align: rect.left < TOOLTIP_ALIGN_AT ? 'left' : 'right',
        })
      }

      const openTip = () => {
        if (dragRef.current !== null && dragRef.current !== undefined) return
        window.clearTimeout(closeTimer.current)
        updatePlacement()
        setOpen(true)
      }

      const scheduleClose = () => {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(() => {
          const element = rootRef.current
          /* Keep the panel while a field or button inside it still has focus. */
          if (element !== null && element.contains(document.activeElement)) return
          setOpen(false)
          setEditing(false)
        }, 140)
      }

      const openTopUp = () => {
        const url = snapshot.links && snapshot.links.topUpUrl
        if (typeof url === 'string' && url !== '') {
          try {
            window.open(url, '_blank', 'noopener,noreferrer')
            return
          } catch (_error) {
            /* fall back to a refresh */
          }
        }
        pull()
      }

      const onPointerDown = (event) => {
        if (event.button !== 0) return
        const element = rootRef.current
        if (element === null) return
        const rect = element.getBoundingClientRect()
        dragRef.current = {
          dx: event.clientX - rect.left,
          dy: event.clientY - rect.top,
          x: event.clientX,
          y: event.clientY,
          moved: false,
        }
        suppressClick.current = false
        window.clearTimeout(closeTimer.current)
        setDragging(true)
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch (_error) {
          /* pointer capture is best effort */
        }
      }

      const onPointerMove = (event) => {
        const drag = dragRef.current
        if (drag === null || drag === undefined) return
        if (!drag.moved) {
          if (Math.abs(event.clientX - drag.x) < 4 && Math.abs(event.clientY - drag.y) < 4) return
          drag.moved = true
          setOpen(false)
        }
        setPosition({
          left: clamp(event.clientX - drag.dx, 8, Math.max(8, window.innerWidth - 54)),
          top: clamp(event.clientY - drag.dy, 8, Math.max(8, window.innerHeight - 54)),
        })
      }

      const endDrag = () => {
        const drag = dragRef.current
        dragRef.current = null
        setDragging(false)
        if (drag !== null && drag !== undefined && drag.moved) {
          suppressClick.current = true
          window.setTimeout(() => {
            suppressClick.current = false
          }, 350)
          const element = rootRef.current
          if (element !== null) {
            const rect = element.getBoundingClientRect()
            writeJson(POSITION_KEY, { left: rect.left, top: rect.top })
          }
          updatePlacement()
        }
      }

      const onClick = () => {
        if (suppressClick.current) {
          suppressClick.current = false
          return
        }
        /* The mark only opens its panel; top-up lives on the panel's own link. */
        openTip()
      }

      const selectCurrency = (next) => {
        if (next === selectedCurrency) return
        setCurrency(next)
        writeJson(CURRENCY_KEY, next)
      }

      const patchSettings = (patch) => {
        setSettings((previous) => {
          const next = Object.assign({}, previous, patch)
          writeJson(SETTINGS_KEY, next)
          return next
        })
      }

      const updateFull = (value) => {
        setSettings((previous) => {
          const next = Object.assign({}, previous, {
            full: Object.assign({}, previous.full, { [selectedCurrency]: value }),
          })
          writeJson(SETTINGS_KEY, next)
          return next
        })
      }

      const updateLow = (value) => {
        setSettings((previous) => {
          const next = Object.assign({}, previous, {
            low: Object.assign({}, previous.low, { [selectedCurrency]: value }),
          })
          writeJson(SETTINGS_KEY, next)
          return next
        })
      }

      const updatePercent = (value) => {
        setSettings((previous) => {
          const next = Object.assign({}, previous, { percent: Math.min(100, Math.max(1, value)) })
          writeJson(SETTINGS_KEY, next)
          return next
        })
      }

      const resetSettings = () => {
        const next = defaultSettings()
        setSettings(next)
        writeJson(SETTINGS_KEY, next)
      }

      const updated = () => {
        if (snapshot.status !== 'ready' || snapshot.at === 0) return ''
        const minutes = Math.floor((Math.max(stamp, snapshot.at) - snapshot.at) / 60000)
        return minutes < 1 ? t('updatedNow') : t('updatedMinutes').replace('{n}', String(minutes))
      }

      const amountLabel = selected === null ? t('label') : t('label') + ' ' + amountText(selected)
      const label = low ? amountLabel + ' \u00b7 ' + t('lowHint') : amountLabel

      const walletRows = wallets.map((wallet, index) => {
        const chosen = wallet.currency === selectedCurrency
        return h(
          'button',
          {
            key: wallet.currency + '-' + index,
            type: 'button',
            className: 'bv-wallet',
            'aria-pressed': chosen ? 'true' : 'false',
            onClick: () => selectCurrency(wallet.currency),
          },
          h('span', { className: 'bv-dot' }),
          h('span', { className: 'bv-amount' }, amountText(wallet))
        )
      })

      const bonusRows = snapshot.bonus
        .filter((wallet) => Number(wallet.balance) > 0)
        .map((wallet, index) =>
          h(
            'div',
            { key: 'bonus-' + wallet.currency + '-' + index, className: 'bv-bonus' },
            t('bonus') + ' ' + amountText(wallet)
          )
        )

      const stats = []
      if (snapshot.status === 'ready') {
        stats.push(t('full') + ' ' + money(fullAt, selectedCurrency))
        if (todaySpend > 0) stats.push(t('today') + ' ' + money(todaySpend, selectedCurrency))
        if (weekSpend > 0) stats.push(t('week') + ' ' + money(weekSpend, selectedCurrency))
        if (daysLeft !== null) stats.push(daysText(daysLeft, t))
      }

      const settingsBlock = h(
        'div',
        { className: 'bv-set' },
        h(
          'div',
          { className: 'bv-set-row' },
          h('span', { className: 'bv-set-label' }, t('fullAmount')),
          h(NumberField, {
            value: fixedFull,
            min: 1,
            max: 1000000000,
            step: 10,
            suffix: symbolOf(selectedCurrency),
            ariaLabel: t('fullAmount'),
            onCommit: updateFull,
          })
        ),
        h(
          'div',
          { className: 'bv-set-row' },
          h('span', { className: 'bv-set-label' }, t('alert')),
          h(Segmented, {
            value: settings.alert,
            ariaLabel: t('alert'),
            options: [
              { value: 'amount', label: t('alertAmount') },
              { value: 'percent', label: t('alertPercent') },
            ],
            onChange: (value) => patchSettings({ alert: value }),
          })
        ),
        h(
          'div',
          { className: 'bv-set-row' },
          h('span', { className: 'bv-set-label' }, t('threshold')),
          settings.alert === 'percent'
            ? h(NumberField, {
                value: settings.percent,
                min: 1,
                max: 100,
                step: 1,
                suffix: '%',
                ariaLabel: t('threshold'),
                onCommit: updatePercent,
              })
            : h(NumberField, {
                value: fixedLow,
                min: 0.01,
                max: 1000000000,
                step: 1,
                suffix: symbolOf(selectedCurrency),
                ariaLabel: t('threshold'),
                onCommit: updateLow,
              })
        ),
        settings.alert === 'percent'
          ? h('div', { className: 'bv-note' }, t('thresholdNow') + ' ' + money(lowAt, selectedCurrency))
          : null,
        h(
          'div',
          { className: 'bv-set-foot' },
          h('button', { type: 'button', className: 'bv-link', onClick: resetSettings }, t('reset')),
          h('button', { type: 'button', className: 'bv-link', onClick: () => setEditing(false) }, t('done'))
        )
      )

      const message =
        snapshot.status === 'signed-out'
          ? t('signedOut')
          : snapshot.status === 'unavailable'
            ? t('unavailable')
            : snapshot.status === 'error'
              ? t('error')
              : t('loading')

      const rootStyle = position
        ? { left: position.left + 'px', top: position.top + 'px', right: 'auto', bottom: 'auto' }
        : { right: '20px', bottom: '20px' }

      return h(
        'div',
        {
          ref: rootRef,
          className: 'bv-root',
          style: rootStyle,
          'data-open': open ? 'true' : 'false',
          'data-status': snapshot.status,
          'data-low': low ? 'true' : 'false',
          'data-pulse': pulse ? 'true' : 'false',
          'data-dragging': dragging ? 'true' : 'false',
          'data-flip': placement.flip ? 'true' : 'false',
          'data-align': placement.align,
          onFocus: openTip,
          onDragStart: (event) => event.preventDefault(),
          onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose()
          },
          onKeyDown: (event) => {
            if (event.key !== 'Escape' || !open) return
            if (editing) {
              setEditing(false)
              return
            }
            setOpen(false)
            if (buttonRef.current !== null) buttonRef.current.focus()
          },
        },
        h('style', { key: 'style' }, STYLE),
        h(
          'div',
          {
            key: 'tip',
            className: 'bv-tip',
            id: 'bv-vessel-tip',
            role: 'group',
            'aria-label': t('title'),
            'aria-hidden': open ? undefined : 'true',
            onMouseEnter: openTip,
            onMouseLeave: scheduleClose,
          },
          h(
            'div',
            { className: 'bv-head' },
            h('span', { className: 'bv-tip-label' }, editing ? t('settings') : t('title')),
            h(
              'span',
              { className: 'bv-head-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'bv-icon bv-gear',
                  'aria-label': t('settings'),
                  'aria-pressed': editing ? 'true' : 'false',
                  title: t('settings'),
                  onClick: () => setEditing((value) => !value),
                },
                h(GearIcon)
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'bv-icon',
                  'aria-label': t('refresh'),
                  title: t('refresh'),
                  disabled: refreshing,
                  'data-spin': refreshing ? 'true' : 'false',
                  onClick: () => pull(),
                },
                h(RefreshIcon)
              )
            )
          ),
          snapshot.status === 'ready'
            ? h('div', { className: 'bv-wallets' }, walletRows, bonusRows)
            : null,
          editing
            ? settingsBlock
            : snapshot.status === 'ready'
              ? h(
                  'div',
                  null,
                  h('div', { className: 'bv-stats' }, stats.map((line, index) => h('span', { key: index }, line))),
                  low ? h('div', { className: 'bv-warn' }, t('lowHint')) : null,
                  h(
                    'div',
                    { className: 'bv-foot' },
                    snapshot.links && snapshot.links.topUpUrl
                      ? h('button', { type: 'button', className: 'bv-link', onClick: openTopUp }, t('topUp'))
                      : h('span', null, ''),
                    h('span', null, updated())
                  )
                )
              : h('div', { className: 'bv-message' }, message),
          !editing && snapshot.status === 'error'
            ? h('div', { className: 'bv-message' }, t('retry'))
            : null
        ),
        h(
          'button',
          {
            key: 'button',
            ref: buttonRef,
            type: 'button',
            className: 'bv-button',
            'aria-label': label,
            'aria-describedby': open ? 'bv-vessel-tip' : undefined,
            onMouseEnter: openTip,
            onMouseLeave: scheduleClose,
            onPointerDown,
            onPointerMove,
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
            onClick,
          },
          h(Whale, { level, low })
        )
      )
    }

    /** @param ctx - client root context. */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NAMESPACE, DICTIONARIES), 'balance-vessel: dictionaries')
      const t = ctx.locale.bind(NAMESPACE)
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'balance-vessel',
            order: 40,
            label: () => t('label'),
            locale: NAMESPACE,
          },
          (slotProps) => h(BalanceVessel, Object.assign({}, slotProps, { ctx, t }))
        )
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
