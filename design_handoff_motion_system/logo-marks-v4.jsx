/* tripOS — mark system v4 (no letterform / no cross)
   Derived from the UI's rounded-square modules + the gold "live" signal.
   An OS = a frame that holds a running process. Filled/stroked rounded
   shapes only; nothing reads as a t / plus / cross. */

function MarkV4({ variant, fg = '#0C1620', accent = '#C8A96A', size = 96 }) {
  const V = {
    /* ---- A · Aperture : a rounded-square window (the OS) holding a live
            gold caret (a process running). App-icon native. ---- */
    'aperture': (
      <g>
        <rect x="17" y="17" width="66" height="66" rx="19"
              fill="none" stroke={fg} strokeWidth="13" />
        <rect x="35" y="36" width="12" height="28" rx="6" fill={accent} />
      </g>
    ),
    /* ---- B · Relay : three rounded modules stepping up-right — a process
            advancing through the system; the live one in gold. ---- */
    'relay': (
      <g>
        <rect x="12" y="52" width="26" height="26" rx="8" fill={fg} />
        <rect x="37" y="37" width="26" height="26" rx="8" fill={fg} />
        <rect x="62" y="22" width="26" height="26" rx="8" fill={accent} />
      </g>
    ),
    /* ---- C · Stack : offset rounded records the OS organises; top live. ---- */
    'stack': (
      <g>
        <rect x="22" y="22" width="44" height="15" rx="7.5" fill={accent} />
        <rect x="30" y="43" width="52" height="15" rx="7.5" fill={fg} />
        <rect x="18" y="64" width="48" height="15" rx="7.5" fill={fg} />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {V[variant]}
    </svg>
  );
}

window.MarkV4 = MarkV4;
