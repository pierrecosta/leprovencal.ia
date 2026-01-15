import { toast } from 'react-hot-toast';

export function toastSuccess(msg) {
  if (!msg) return;
  toast.success(String(msg), { duration: 4000 });
}

export function toastError(msg) {
  if (!msg) return;
  toast.error(String(msg), { duration: 6000 });
}

export function toastInfo(msg) {
  if (!msg) return;
  toast(String(msg), { duration: 4000 });
}

const notify = { toastSuccess, toastError, toastInfo };
export default notify;
