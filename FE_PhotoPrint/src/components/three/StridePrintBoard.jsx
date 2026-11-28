export default function StridePrintBoard({ board, flipped = false }) {
  return <div className="stride-print" data-flipped={flipped} aria-hidden="true" style={{ '--print-ink': board.color }}>
    <div className="stride-print-face stride-print-front">
      <div className="stride-print-top"><span>{board.badge}</span><small>{board.brand}</small></div>
      <img src={board.image} alt="" draggable="false" />
      <div className="stride-print-line"><strong>{board.short}</strong><strong>{board.price}</strong></div>
      <div className="stride-print-meta"><span>{board.spec}</span><span>{board.unit}</span></div>
    </div>
    <div className="stride-print-face stride-print-back">
      <div className="stride-print-top"><span>Quy cách tại quầy</span><small>{board.brand}</small></div>
      <strong>{board.title}</strong>
      <ul>{board.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
      <div className="stride-print-line"><span>{board.spec}</span><strong>{board.price}</strong></div>
    </div>
  </div>;
}
