import { useCallback, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { UiverseButton, UiverseCheckbox, UiverseInput } from '@oneportal/uiverse-ui';
import { photoProductApi } from '../../api/photoProductApi';
import { photoDemoApi } from '../../api/photoDemoApi';
import { uploadPhoto } from '../../api/photoUploadApi';
import { FrameColors, ModelNames, UsageTypes } from '../../models/photoPrint';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import PhotoImage from '../../components/common/PhotoImage';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { photoAccept } from '../../utils/fileUpload';
import useRequest from '../../hooks/useRequest';
import useAction from '../../hooks/useAction';
import useDebounce from '../../hooks/useDebounce';

const pageSize = 20;
const variants = { PerPrintSizeTier: 'Theo cỡ và bậc số lượng', PerUnit: 'Theo tấm', PerSqm: 'Theo mét vuông' };
const rowSchemas = {
  printSizes: { label: 'Nhãn cỡ', widthCm: 'Rộng (cm)', heightCm: 'Cao (cm)', priceDeltaOrBase: 'Giá theo cỡ' },
  paperOrSurfaceOptions: { name: 'Tên bề mặt', finishType: 'Kiểu hoàn thiện', pricePerUnitOrSqm: 'Phụ phí', description: 'Mô tả', pricingUnit: 'Đơn vị' },
  finishingOptions: { name: 'Tên gia công', price: 'Giá', mode: 'Đơn vị' },
  discountTiers: { minQty: 'Từ số bản', discountPercent: 'Giảm (%)' },
};
const numbers = new Set(['widthCm', 'heightCm', 'priceDeltaOrBase', 'pricePerUnitOrSqm', 'price', 'minQty', 'discountPercent']);

function Rows({ group, label, rows, onChange }) {
  const schema = rowSchemas[group];
  function update(index, field, value) {
    onChange(rows.map((row, number) => number === index ? { ...row, [field]: value } : row));
  }
  return <fieldset className="form-stack"><legend>{label}</legend>
    {rows.map((row, index) => <div className="editor-row" key={index}>
      <div className="form-columns">{Object.entries(schema).map(([field, name]) => ['mode', 'pricingUnit'].includes(field)
        ? <UiverseInput as="select" label={name} key={field} value={row[field] || 'PerUnit'} onChange={event => update(index, field, event.target.value)}>
          <option value="PerUnit">Theo tấm</option><option value="PerSqm">Theo m²</option></UiverseInput>
        : <UiverseInput key={field} label={name} type={numbers.has(field) ? 'number' : 'text'} required={['label', 'name', 'widthCm', 'heightCm', 'minQty', 'discountPercent'].includes(field)}
          min={numbers.has(field) ? 0 : undefined} max={field === 'discountPercent' ? 100 : undefined} step={numbers.has(field) ? 'any' : undefined}
          value={row[field] ?? ''} onChange={event => update(index, field, numbers.has(field) && event.target.value !== '' ? Number(event.target.value) : event.target.value)} />)}</div>
      <UiverseButton size="small" variant="outline" onClick={() => onChange(rows.filter((_, number) => number !== index))}>Xóa dòng</UiverseButton>
    </div>)}
    <UiverseButton size="small" variant="outline" icon={<Plus size={15} />} onClick={() => onChange([...rows, Object.fromEntries(Object.keys(schema).map(field => [field, ['mode', 'pricingUnit'].includes(field) ? 'PerUnit' : '']))])}>Thêm dòng</UiverseButton>
  </fieldset>;
}

function CatalogEditor({ record, kind, categories, products, onClose, onSave, onDelete }) {
  const [value, setValue] = useState(record);
  const [confirm, setConfirm] = useState(false);
  const action = useAction();
  const set = (name, field) => setValue(previous => ({ ...previous, [name]: field }));
  const isProduct = kind === 'products', isDemo = kind === 'demos';
  const imageField = isDemo ? 'previewImageUrl' : isProduct ? 'thumbnailUrl' : 'imageUrl';
  const titleField = isDemo ? 'title' : 'name';

  function upload(event, field) {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) action.run(async signal => set(field, (await uploadPhoto(file, 'catalog', signal)).fileUrl));
  }

  function save(event) {
    event.preventDefault();
    action.run(async () => {
      const data = { ...value };
      if (isProduct) {
        if (!data.categoryId) throw new Error('Chọn nhóm sản phẩm.');
        if (data.pricingMode !== 'PerSqm' && !data.printSizes.length) throw new Error('Thêm ít nhất một cỡ ảnh.');
        data.printSizes = data.printSizes.map(row => ({ ...row, priceDeltaOrBase: row.priceDeltaOrBase === '' ? null : row.priceDeltaOrBase }));
        data.paperOrSurfaceOptions = data.paperOrSurfaceOptions.map(row => ({ ...row, pricePerUnitOrSqm: Number(row.pricePerUnitOrSqm) || 0 }));
        data.finishingOptions = data.finishingOptions.map(row => ({ ...row, price: Number(row.price) || 0 }));
      }
      await onSave(data);
    });
  }

  return <Modal title={(record.id ? 'Sửa ' : 'Thêm ') + (isProduct ? 'sản phẩm' : isDemo ? 'mẫu 3D' : 'nhóm')} onClose={onClose} wide locked={action.busy}>
    <form className="form-stack" onSubmit={save}>
      <fieldset className="form-stack" disabled={action.busy}>
        <div className="form-columns">
          <UiverseInput label="Tên" value={value[titleField]} required maxLength={150} onChange={event => set(titleField, event.target.value)} />
          {!isDemo && <UiverseInput label="Slug" value={value.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" onChange={event => set('slug', event.target.value)} />}
        </div>
        {isProduct && <>
          <div className="form-columns"><UiverseInput label="Mã sản phẩm" value={value.code || ''} required onChange={event => set('code', event.target.value)} />
            <UiverseInput label="Nhóm" as="select" value={value.categoryId || ''} required onChange={event => set('categoryId', event.target.value)}>
              <option value="">Chọn nhóm</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</UiverseInput></div>
          <UiverseInput label="Mô tả ngắn" value={value.shortDescription || ''} onChange={event => set('shortDescription', event.target.value)} />
        </>}
        <UiverseInput label="Mô tả" as="textarea" rows={3} value={value.description || ''} onChange={event => set('description', event.target.value)} />
        <UiverseInput label="Địa chỉ ảnh mẫu" value={value[imageField] || ''} onChange={event => set(imageField, event.target.value)} />
        <UiverseInput label="Tải ảnh mẫu" type="file" accept={photoAccept} onChange={event => upload(event, imageField)} />
        {value[imageField] && <PhotoImage src={value[imageField]} className="admin-preview" />}
        {(isProduct || isDemo) && <UiverseInput label="Mô hình 3D" as="select" value={value[isDemo ? 'model3DType' : 'defaultModel3DType']}
          onChange={event => set(isDemo ? 'model3DType' : 'defaultModel3DType', event.target.value)}>
          {Object.entries(ModelNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</UiverseInput>}
        {isProduct && <>
          <div className="form-columns">
            <UiverseInput label="Kiểu tính giá" as="select" value={value.pricingMode} onChange={event => set('pricingMode', event.target.value)}>
              {Object.entries(variants).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</UiverseInput>
            <UiverseInput label="Giá niêm yết" type="number" min="0" required value={value.basePrice} onChange={event => set('basePrice', Number(event.target.value))} />
            <UiverseInput label="Diện tích tối thiểu (m²)" type="number" min="0" step="0.01" value={value.minBillableAreaSqm} onChange={event => set('minBillableAreaSqm', Number(event.target.value))} />
            <UiverseInput label="Phụ phí in nhanh (%)" type="number" min="0" max="100" value={value.rushSurchargePercent} onChange={event => set('rushSurchargePercent', Number(event.target.value))} />
            <UiverseInput label="Nhãn thời gian in" value={value.productionTimeLabel || ''} onChange={event => set('productionTimeLabel', event.target.value)} />
            <UiverseInput label="Thời gian in (giờ)" type="number" min="1" value={value.productionHours || ''} onChange={event => set('productionHours', Number(event.target.value) || null)} />
          </div>
          <UiverseInput label="Ảnh gallery (mỗi dòng một địa chỉ)" as="textarea" rows={2} value={value.galleryText ?? value.gallery.join('\n')} onChange={event => set('galleryText', event.target.value)} />
          <fieldset className="form-columns"><legend>Mục đích</legend>{Object.entries(UsageTypes).map(([key, name]) =>
            <UiverseCheckbox key={key} checked={value.usageTypes.includes(key)} label={name}
              onChange={checked => set('usageTypes', checked ? [...value.usageTypes, key] : value.usageTypes.filter(item => item !== key))} />)}</fieldset>
          {[['printSizes', 'Cỡ ảnh'], ['paperOrSurfaceOptions', 'Bề mặt'], ['finishingOptions', 'Khung & gia công'], ['discountTiers', 'Bậc giảm giá']].map(([group, label]) =>
            <Rows key={group} group={group} label={label} rows={value[group]} onChange={rows => set(group, rows)} />)}
          <UiverseCheckbox label="Cho phép tải ảnh hàng loạt" checked={value.supportsBatchUpload} onChange={checked => set('supportsBatchUpload', checked)} />
        </>}
        {isDemo && <>
          <UiverseInput label="Sản phẩm liên kết" as="select" value={value.linkedProductId || ''} onChange={event => set('linkedProductId', event.target.value || null)}>
            <option value="">Không liên kết</option>{products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</UiverseInput>
          <UiverseInput label="Địa chỉ ảnh đặt vào mẫu" value={value.textureImageUrl || ''} onChange={event => set('textureImageUrl', event.target.value)} />
          <UiverseInput label="Tải ảnh đặt vào mẫu" type="file" accept={photoAccept} onChange={event => upload(event, 'textureImageUrl')} />
          <div className="form-columns">
            <UiverseInput label="Rộng (cm)" type="number" min="0.1" max="500" step="any" required value={value.widthCm} onChange={event => set('widthCm', Number(event.target.value))} />
            <UiverseInput label="Cao (cm)" type="number" min="0.1" max="500" step="any" required value={value.heightCm} onChange={event => set('heightCm', Number(event.target.value))} />
          </div>
          <UiverseInput label="Màu khung" as="select" value={value.frameColor} onChange={event => set('frameColor', event.target.value)}>
            {Object.entries(FrameColors).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</UiverseInput>
          <UiverseCheckbox label="Bo viền trắng" checked={value.hasMatboard} onChange={checked => set('hasMatboard', checked)} />
        </>}
        {(isProduct || isDemo) && <UiverseCheckbox label="Nổi bật" checked={value.isFeatured} onChange={checked => set('isFeatured', checked)} />}
        <UiverseCheckbox label="Đang hiển thị" checked={value.isActive} onChange={checked => set('isActive', checked)} />
      </fieldset>
      {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
      <div className="action-row">
        <UiverseButton type="submit" isLoading={action.busy}>Lưu</UiverseButton>
        {record.id && <UiverseButton variant="outline" icon={<Trash2 size={16} />} disabled={action.busy} onClick={() => setConfirm(true)}>Xóa</UiverseButton>}
        {confirm && <div className="notice">Xóa mục này khỏi danh mục? <UiverseButton size="small" variant="outline" isLoading={action.busy} onClick={() => action.run(() => onDelete(record.id))}>Xác nhận xóa</UiverseButton></div>}
      </div>
    </form>
  </Modal>;
}

const presets = {
  products: { name: '', slug: '', code: '', pricingMode: 'PerPrintSizeTier', basePrice: 0, minBillableAreaSqm: 0, rushSurchargePercent: 0,
    supportsBatchUpload: true, isFeatured: false, isActive: true, defaultModel3DType: 'framed_photo',
    gallery: [], usageTypes: [], printSizes: [], paperOrSurfaceOptions: [], finishingOptions: [], discountTiers: [] },
  categories: { name: '', slug: '', isActive: true },
  demos: { title: '', widthCm: 20, heightCm: 30, hasMatboard: true, frameColor: 'oak', isActive: true, isFeatured: false, model3DType: 'framed_photo' },
};
const loadCategories = signal => photoProductApi.categories(signal, true);
const loadProducts = signal => photoProductApi.search({ includeInactive: true, page: 1, pageSize: 100 }, signal);
const skipProducts = () => Promise.resolve(null);

export default function AdminCatalogPage({ kind }) {
  const [group, setGroup] = useState(kind);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const categories = useRequest(loadCategories);
  const products = useRequest(kind === 'demos' ? loadProducts : skipProducts);
  const load = useCallback(signal => group === 'categories'
    ? Promise.resolve(null)
    : (group === 'products' ? photoProductApi.search : photoDemoApi.list)({ includeInactive: true, page, pageSize, search: debounced }, signal), [group, page, debounced]);
  const result = useRequest(load);
  const current = group === 'categories' ? categories : result;
  const items = group === 'categories' ? categories.data || [] : result.data?.items || [];
  const service = { products: [photoProductApi.save, photoProductApi.remove], demos: [photoDemoApi.save, photoDemoApi.remove],
    categories: [photoProductApi.categorySave, photoProductApi.categoryDelete] };
  const names = { products: 'Sản phẩm', categories: 'Nhóm', demos: 'Mẫu 3D' };

  async function save(record) {
    const { galleryText, ...data } = record;
    if (group === 'products' && galleryText !== undefined) data.gallery = galleryText.split('\n').map(line => line.trim()).filter(Boolean);
    if (group === 'demos') {
      data.styleCategory = data.model3DType;
      data.linkedProductSlug = products.data?.items.find(item => item.id === data.linkedProductId)?.slug ?? null;
    }
    await service[group][0](data);
    setEditing(null);
    current.reload();
  }

  return <>
    <PageHeading title={kind === 'products' ? 'Danh mục sản phẩm' : 'Thư viện mẫu 3D'} />
    <div className="admin-toolbar">
      {kind === 'products' && <div className="tabs">{['products', 'categories'].map(key => <button type="button" className="tab" key={key} aria-pressed={key === group}
        onClick={() => { setGroup(key); setPage(1); }}>{names[key]}</button>)}</div>}
      {group !== 'categories' && <UiverseInput label="Tìm kiếm" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />}
      <UiverseButton icon={<Plus size={16} />} onClick={() => setEditing({ ...presets[group] })}>Thêm {names[group].toLowerCase()}</UiverseButton>
    </div>
    <RequestState result={current}>
      {items.length ? <ul className="panel admin-list">{items.map(item => <li key={item.id}><PhotoImage src={item.thumbnailUrl || item.previewImageUrl || item.imageUrl} className="admin-row-image" />
        <div><strong>{item.title || item.name}</strong><div className="muted">{item.slug || ModelNames[item.model3DType]} · {item.isActive ? 'Đang hiển thị' : 'Đã ẩn'}</div></div>
        <UiverseButton size="small" variant="outline" icon={<Pencil size={15} />} onClick={() => setEditing(item)}>Sửa</UiverseButton></li>)}</ul>
        : <p className="notice">Chưa có mục phù hợp.</p>}
      {group !== 'categories' && <Pagination page={page} totalCount={result.data?.totalCount} pageSize={pageSize} onPage={setPage} />}
    </RequestState>
    {editing && <CatalogEditor record={editing} kind={group} categories={categories.data || []} products={products.data?.items || []}
      onClose={() => setEditing(null)} onSave={save} onDelete={async id => { await service[group][1](id); setEditing(null); current.reload(); }} />}
  </>;
}
