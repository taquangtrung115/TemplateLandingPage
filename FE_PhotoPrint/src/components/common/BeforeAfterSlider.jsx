import { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

export default function BeforeAfterSlider() {
  const [position, setPosition] = useState(45);
  return <figure className="comparison" style={{ '--compare-position': position + '%' }}>
    <img src="/assets/photo-texture.webp" alt="Phong cảnh đồi thông sau khi cân màu" loading="lazy" />
    <img className="comparison-before" src="/assets/photo-texture.webp" alt="" loading="lazy" />
    <span className="comparison-label before">Ảnh thiếu sáng</span><span className="comparison-label after">Cân màu Lab</span>
    <span className="comparison-divider" aria-hidden="true"><MoveHorizontal size={21} /></span>
    <input type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} aria-label="So sánh ảnh trước và sau cân màu" />
  </figure>;
}
