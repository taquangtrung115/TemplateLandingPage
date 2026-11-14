import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = path.join(root, 'BE/src/Persistence/Data');
const categories = JSON.parse(await readFile(path.join(data, 'TemplateCatalog.json'), 'utf8'));
const styles = JSON.parse(await readFile(path.join(data, 'TemplateCatalogStyles.json'), 'utf8'));
const output = path.join(root, 'FE_TemplateLandingPage/public/catalog-previews');
await mkdir(output, { recursive: true });
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

function motif(index, color, accent) {
  const petals = Array.from({ length: 8 }, (_, i) =>
    '<ellipse cx="600" cy="175" rx="55" ry="125" transform="rotate(' + (i * 45) + ' 600 300)" fill="' + color + '" opacity=".24"/>').join('');
  const branches = Array.from({ length: 7 }, (_, i) =>
    '<ellipse cx="' + (160 + i * 25) + '" cy="' + (180 + i * 55) + '" rx="24" ry="60" transform="rotate(-40 ' + (160 + i * 25) + ' ' + (180 + i * 55) + ')" fill="' + color + '" opacity=".25"/>').join('');
  switch (index % 10) {
    case 0: return petals + '<circle cx="600" cy="300" r="45" fill="' + accent + '"/>';
    case 1: return branches + '<g transform="translate(1200 800) rotate(180)">' + branches + '</g>';
    case 2: return '<path d="M290 710V330a310 310 0 01620 0v380" fill="none" stroke="' + color + '" stroke-width="32" opacity=".22"/><path d="M340 710V330a260 260 0 01520 0v380" fill="none" stroke="' + accent + '" stroke-width="4"/>';
    case 3: return Array.from({ length: 36 }, (_, i) => '<circle cx="' + (40 + (i * 173) % 1120) + '" cy="' + (40 + (i * 97) % 720) + '" r="' + (2 + i % 5) + '" fill="' + color + '" opacity=".35"/>').join('');
    case 4: return '<circle cx="940" cy="220" r="150" fill="' + accent + '"/><path d="M0 590Q300 430 600 610T1200 560V800H0Z" fill="' + color + '" opacity=".22"/>';
    case 5: return '<circle cx="510" cy="300" r="180" fill="none" stroke="' + color + '" stroke-width="4"/><circle cx="690" cy="300" r="180" fill="none" stroke="' + color + '" stroke-width="4"/>';
    case 6: return branches + '<path d="M170 170Q240 450 390 650" stroke="' + color + '" fill="none" stroke-width="3"/>';
    case 7: return '<g transform="translate(0 100)">' + petals + '</g>';
    case 8: return '<path d="M0 90Q360 10 600 180T1200 70M0 710Q360 790 600 620T1200 730" stroke="' + color + '" stroke-width="20" fill="none" opacity=".3"/>';
    default: return '<path d="M150 650V210Q150 110 250 110H950Q1050 110 1050 210V650Z M400 110V650 M800 110V650 M150 350H1050" stroke="' + color + '" stroke-width="3" opacity=".4" fill="none"/>';
  }
}
let count = 0;
for (const category of categories) {
  for (const [index, concept] of category.concepts.entries()) {
    const style = styles[index % styles.length];
    const slug = 'catalog-' + category.slug + '-' + String(index + 1).padStart(2, '0');
    const textX = 600;
    const anchor = 'middle';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-labelledby="title desc">' +
      '<title id="title">' + escape(concept) + '</title><desc id="desc">Minh họa gốc cho ' + escape(category.name) + '</desc>' +
      '<rect width="1200" height="1600" fill="' + style.background + '"/>' +
      '<g transform="translate(0 70)">' + motif(index, style.primary, style.accent) + '</g>' +
      '<rect x="70" y="70" width="1060" height="1460" rx="' + (index % 3 === 0 ? 0 : 35) + '" fill="none" stroke="' + style.primary + '" opacity=".25"/>' +
      '<g fill="' + style.text + '" text-anchor="' + anchor + '" font-family="Georgia, serif">' +
      '<text x="' + textX + '" y="900" font-family="Arial, sans-serif" font-size="24" letter-spacing="3">' + escape(category.name.toLocaleUpperCase('vi')) + '</text>' +
      '<text x="' + textX + '" y="1030" font-size="' + (concept.length > 24 ? 49 : 62) + '">' + escape(concept) + '</text>' +
      '<path d="M470 1110H730" stroke="' + style.primary + '" stroke-width="3"/>' +
      '<text x="' + textX + '" y="1200" font-family="Arial, sans-serif" font-size="22">CÂU CHUYỆN CỦA BẠN</text>' +
      '<text x="' + textX + '" y="1245" font-family="Arial, sans-serif" font-size="22">PHONG CÁCH CỦA BẠN</text></g></svg>';
    await writeFile(path.join(output, slug + '.svg'), svg, 'utf8');
    const cover = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">' +
      '<rect width="1200" height="800" fill="' + style.background + '"/>' +
      motif(index, style.primary, style.accent) + '</svg>';
    await writeFile(path.join(output, slug + '-cover.svg'), cover, 'utf8');
    count++;
  }
}
console.info('Generated ' + count + ' original catalog previews.');
