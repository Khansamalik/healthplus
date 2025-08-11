// utils/phone.js
// Try to open WhatsApp for a number; if it doesn't open, fall back to dialing via SIM.
// Note: Browser behavior varies; this uses a heuristic timeout fallback.

function normalizePkNumber(raw) {
  if (!raw) return '';
  let n = ('' + raw).replace(/[\s-]/g, '');
  // Remove leading +
  if (n.startsWith('+')) n = n.slice(1);
  // If starts with 0092 -> 92
  if (n.startsWith('0092')) n = '92' + n.slice(4);
  // If starts with 0 and seems local, convert to 92
  if (n.startsWith('0')) n = '92' + n.slice(1);
  // If already 92..., keep it
  return n;
}

export function openWhatsAppOrCall(rawNumber, message = 'Hello, I need urgent assistance.') {
  const intl = normalizePkNumber(rawNumber);
  if (!intl) return;

  const waUrl = `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
  const telUrl = `tel:+${intl}`;

  // Attempt WhatsApp first
  const newWin = window.open(waUrl, '_blank');

  // Fallback after a short delay if the page is still visible (heuristic)
  const fallback = () => {
    try {
      if (!document.hidden) {
        window.location.href = telUrl;
      }
    } catch (_) {
      window.location.href = telUrl;
    }
  };

  // If popup blocked or no window, fallback quicker
  if (!newWin) {
    setTimeout(fallback, 600);
  } else {
    setTimeout(fallback, 1400);
  }
}
