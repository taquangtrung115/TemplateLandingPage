import { useState } from 'react';
import { UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import Modal from '../../components/common/Modal';
import useAction from '../../hooks/useAction';

export default function StateEditor({ title, record, states, update, onClose, onChanged, onConflict, children }) {
  const [state, setState] = useState(record.status);
  const [note, setNote] = useState(record.adminNote || '');
  const [stale, setStale] = useState(false);
  const action = useAction();

  function save(event) {
    event.preventDefault();
    action.run(async () => {
      try {
        await update(record.id, { status: state, adminNote: note, expectedRevision: record.revision });
        onChanged();
      } catch (error) {
        if (error.status !== 409) throw error;
        setStale(true);
        onConflict();
        throw new Error('Bản ghi vừa được người khác cập nhật. Danh sách đã được làm mới.');
      }
    });
  }

  return <Modal title={title} onClose={onClose} wide locked={action.busy}>
    <div className="form-stack">{children}</div>
    <form className="form-stack mt-5" onSubmit={save}>
      <fieldset disabled={action.busy || stale} className="form-stack">
        <UiverseInput label="Trạng thái" as="select" value={state} onChange={event => setState(event.target.value)}>
          {Object.entries(states).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </UiverseInput>
        <UiverseInput label="Phản hồi cho khách" as="textarea" rows={3} value={note} maxLength={2000} onChange={event => setNote(event.target.value)} />
      </fieldset>
      {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
      <UiverseButton type="submit" disabled={stale} isLoading={action.busy}>Lưu trạng thái</UiverseButton>
    </form>
  </Modal>;
}
