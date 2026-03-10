import Swal from 'sweetalert2'

const baseConfig = {
  customClass: {
    popup:         'swal-popup',
    confirmButton: 'swal-btn-confirm',
    cancelButton:  'swal-btn-cancel',
  },
  buttonsStyling: false,
}

export const confirmDelete = (title = 'Hapus item ini?', text = 'Tindakan ini tidak dapat dibatalkan.') =>
  Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton:   true,
    confirmButtonText:  'Ya, Hapus!',
    cancelButtonText:   'Batal',
    reverseButtons:     true,
    focusCancel:        true,
  })

export const confirmAction = (title, text, confirmText = 'Ya', icon = 'question') =>
  Swal.fire({
    ...baseConfig,
    title,
    text,
    icon,
    showCancelButton:   true,
    confirmButtonText:  confirmText,
    cancelButtonText:   'Batal',
    reverseButtons:     true,
  })

export const showSuccess = (title, text) =>
  Swal.fire({
    ...baseConfig,
    title,
    text,
    icon:               'success',
    timer:              2000,
    showConfirmButton:  false,
    timerProgressBar:   true,
  })

export const showError = (title, text) =>
  Swal.fire({
    ...baseConfig,
    title,
    text,
    icon:              'error',
    confirmButtonText: 'Tutup',
  })

export const toast = (title, icon = 'success') =>
  Swal.fire({
    ...baseConfig,
    toast:             true,
    position:          'bottom-end',
    showConfirmButton: false,
    timer:             2500,
    timerProgressBar:  true,
    title,
    icon,
  })
