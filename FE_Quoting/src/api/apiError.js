// #region API errors
const systemMessages = {
  'The request body or parameters are invalid.': 'Dữ liệu gửi lên chưa hợp lệ. Kiểm tra các trường và thử lại.',
  'The request body contains invalid JSON.': 'Dữ liệu gửi lên sai định dạng. Tải lại trang và thử lại.',
  'The request conflicts with the current data. Refresh and retry.': 'Dữ liệu đã thay đổi. Tải lại trang trước khi lưu lại.',
  'An unexpected error occurred on the server.': 'Máy chủ chưa thể xử lý yêu cầu. Vui lòng thử lại.',
};
const translateMessage = (message, fallback) => typeof message === 'string' && message.trim() ? systemMessages[message] || message : fallback;
export async function readApiError(data, fallback) {
  if (data instanceof Blob) {
    try { data = JSON.parse(await data.text()); } catch { return fallback; }
  }
  if (data?.error?.message || data?.Error?.Message) return translateMessage(data.error?.message || data.Error.Message, fallback);
  const errors = data?.errors || data?.Errors;
  if (Array.isArray(errors) && errors.length) return errors.map((error) => translateMessage(error.message || error.Message || error.errorMessage || error, fallback)).join('\n');
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const messages = Object.values(errors).flat().filter((message) => typeof message === 'string' && message.trim());
    if (messages.length) return messages.map((message) => translateMessage(message, fallback)).join('\n');
  }
  return translateMessage(data?.detail || data?.Detail || data?.title || data?.Title, fallback);
}
// #endregion
