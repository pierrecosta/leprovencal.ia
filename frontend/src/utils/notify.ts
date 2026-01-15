import toast from 'react-hot-toast';

export function toastSuccess(msg: string): void {
  if (!msg) return;
  toast.success(msg, { duration: 4000 });
}

export function toastError(msg: string): void {
  if (!msg) return;
  toast.error(msg, { duration: 6000 });
}

export function toastInfo(msg: string): void {
  if (!msg) return;
  toast(msg, { duration: 4000 });
}
