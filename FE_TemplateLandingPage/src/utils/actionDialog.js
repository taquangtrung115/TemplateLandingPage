// #region Dialogs for standalone and embedded pages
export function showActionDialog(message, { confirm = false } = {}) {
  if (document.querySelector('dialog[data-action-dialog]')) return Promise.resolve(false);

  const dialog = document.createElement('dialog');
  dialog.dataset.actionDialog = '';
  dialog.className = 'm-auto w-11/12 max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl backdrop:bg-slate-900/50';
  dialog.setAttribute('aria-labelledby', 'action-dialog-message');
  const text = document.createElement('p');
  text.id = 'action-dialog-message';
  text.textContent = message;

  const form = document.createElement('form');
  form.method = 'dialog';
  form.className = 'mt-5 flex justify-end gap-3';

  if (confirm) {
    const cancel = document.createElement('button');
    cancel.value = 'cancel';
    cancel.textContent = 'Hủy';
    cancel.className = 'rounded-lg border border-gray-300 px-4 py-2';
    form.append(cancel);
  }

  const accept = document.createElement('button');
  accept.value = 'accept';
  accept.textContent = confirm ? 'Xóa' : 'Đóng';
  accept.className = 'rounded-lg bg-rose-700 px-4 py-2 text-white';
  form.append(accept);
  dialog.append(text, form);
  document.body.append(dialog);

  return new Promise(resolve => {
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(dialog.returnValue === 'accept');
    }, { once: true });
    dialog.showModal();
  });
}
// #endregion
