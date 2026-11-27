import { useRef, useState } from 'react';
import { CircleHelp, Focus, PackageCheck, WandSparkles, Flag, ImageUp, Mail, MessageSquare, Phone, ReceiptText, Search, Send, Tag, UserRound } from 'lucide-react';
import { UiverseBadge, UiverseButton, UiverseIconLabel, UiverseInput } from '@oneportal/uiverse-ui';
import PageHeading from '../components/common/PageHeading';
import CopyButton from '../components/common/CopyButton';
import ContactActions from '../components/social/ContactActions';
import { photoSupportApi } from '../api/photoSupportApi';
import { uploadPhoto } from '../api/photoUploadApi';
import { Priorities, TicketStates, Topics } from '../models/photoPrint';
import { photoAccept } from '../utils/fileUpload';
import { sanitizePhone } from '../utils/safeUrl';
import useAction from '../hooks/useAction';

const faqs = [
  ['Ảnh cần bao nhiêu DPI?', 'Từ 250 DPI trở lên cho bản in rất nét. Từ 150 DPI có thể in ổn, tùy nội dung và khoảng cách nhìn.'],
  ['Tiệm nhận định dạng nào?', 'Bạn có thể tải ảnh JPEG, PNG hoặc WebP, tối đa 15 MB mỗi ảnh đặt in.'],
  ['Fill và Fit khác nhau thế nào?', 'Fill phủ kín khung và có thể cắt mép ảnh. Fit giữ toàn bộ ảnh và thêm khoảng trắng khi ảnh khác tỉ lệ.'],
  ['Có thể gửi ảnh gốc sau khi đặt không?', 'Có. Chọn gửi album sau, sau đó gửi mã đơn cùng ảnh HD qua Zalo hoặc liên kết Drive.'],
  ['Ảnh bị lỗi khi nhận phải làm gì?', 'Gửi mã đơn và ảnh chụp lỗi để tiệm kiểm tra và phản hồi phương án xử lý.'],
];

export default function SupportPage() {
  const submit = useAction(), track = useAction();
  const [ticket, setTicket] = useState(null);
  const [tracked, setTracked] = useState(null);
  const [code, setCode] = useState('');
  const formRef = useRef(null);

  function send(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const { attachment, ...data } = Object.fromEntries(new FormData(form));
    submit.run(async signal => {
      const phone = sanitizePhone(data.phone);
      if (!phone || !data.fullName.trim() || !data.message.trim()) throw new Error('Kiểm tra họ tên, số điện thoại và nội dung.');
      const attachmentUrl = attachment?.size ? (await uploadPhoto(attachment, 'support', signal)).fileUrl : null;
      const result = await photoSupportApi.create({ ...data, phone, attachmentUrl });
      if (!result?.ticketCode) throw new Error('Máy chủ chưa trả về mã hỗ trợ.');
      if (signal.aborted) return;
      setTicket(result.ticketCode);
      setCode(result.ticketCode);
      form.reset();
    });
  }

  function lookup(event) {
    event.preventDefault();
    const contact = new FormData(event.currentTarget).get('contact').trim();
    track.run(async signal => {
      setTracked(null);
      const result = await photoSupportApi.track({ code: code.trim().toUpperCase(), contact }, signal);
      if (!signal.aborted) setTracked(result);
    });
  }

  return <div className="shell page-section">
    <PageHeading title="Hỗ trợ từ tiệm ảnh" trail="Hỗ trợ" description="Nhờ tiệm kiểm tra file, chỉnh ảnh hoặc hỗ trợ đơn in đang thực hiện." />
    <div className="assurance-grid support-benefits">
      {[[WandSparkles, 'Chỉnh màu & retouch'], [Focus, 'Kiểm tra độ nét'], [PackageCheck, 'Đơn gấp & đổi trả']].map(([Icon, label]) => <div key={label}><Icon size={23} /><h2>{label}</h2></div>)}
    </div>
    <div className="detail-grid">
      <form className="panel form-stack" onSubmit={send}>
        <h2>Gửi yêu cầu</h2>
        <fieldset disabled={submit.busy} className="form-stack">
          <UiverseInput required labelIcon={UserRound} label="Họ và tên" name="fullName" maxLength={120} />
          <div className="form-columns"><UiverseInput required labelIcon={Phone} label="Số điện thoại" name="phone" type="tel" maxLength={30} />
            <UiverseInput labelIcon={Mail} label="Email" name="email" type="email" maxLength={160} /></div>
          <UiverseInput as="select" labelIcon={Tag} label="Chủ đề" name="topic">{Topics.map(topic => <option key={topic}>{topic}</option>)}</UiverseInput>
          <div className="form-columns"><UiverseInput as="select" labelIcon={Flag} label="Mức độ" name="priority">
            {Object.entries(Priorities).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</UiverseInput>
            <UiverseInput labelIcon={ReceiptText} label="Mã đơn (nếu có)" name="orderCode" maxLength={36} /></div>
          <UiverseInput required as="textarea" labelIcon={MessageSquare} label="Nội dung cần hỗ trợ" name="message" rows={4} maxLength={2000} />
          <UiverseInput labelIcon={ImageUp} label="Ảnh đính kèm (tối đa 10 MB)" name="attachment" type="file" accept={photoAccept} />
        </fieldset>
        {submit.error && <p role="alert" className="notice notice-error">{submit.error}</p>}
        <UiverseButton icon={<Send className="control-icon" aria-hidden="true" />} type="submit" isLoading={submit.busy}>Gửi yêu cầu</UiverseButton>
        {ticket && <div className="notice form-stack" role="status"><strong>Mã hỗ trợ {ticket}</strong><CopyButton value={ticket} />
          <button type="button" className="text-link" onClick={() => formRef.current?.querySelector('[name=contact]')?.focus()}><Search className="control-icon" aria-hidden="true" /> Tra cứu yêu cầu</button>
          <ContactActions message={'Mình cần xác nhận yêu cầu hỗ trợ ' + ticket + '.'} /></div>}
      </form>
      <div className="form-stack">
        <form className="panel form-stack" ref={formRef} onSubmit={lookup}>
          <h2>Tra cứu yêu cầu hỗ trợ</h2>
          <UiverseInput required labelIcon={Tag} label="Mã hỗ trợ" value={code} maxLength={36} onChange={event => setCode(event.target.value)} />
          <UiverseInput required labelIcon={Phone} label="Số điện thoại hoặc email" name="contact" maxLength={160} />
          {track.error && <p role="alert" className="notice notice-error">{track.error}</p>}
          <UiverseButton icon={<Search className="control-icon" aria-hidden="true" />} type="submit" variant="outline" isLoading={track.busy}>Tra cứu</UiverseButton>
          {tracked && <div className="notice" role="status"><UiverseBadge>{TicketStates[tracked.status] || tracked.status}</UiverseBadge>{tracked.adminNote && <p>{tracked.adminNote}</p>}</div>}
        </form>
        <section className="panel faq"><h2>Câu hỏi thường gặp</h2>
          {faqs.map(([question, answer]) => <details key={question}><summary><UiverseIconLabel icon={CircleHelp}>{question}</UiverseIconLabel></summary><p className="uv-view-enter">{answer}</p></details>)}
        </section>
      </div>
    </div>
  </div>;
}
