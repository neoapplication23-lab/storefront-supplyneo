import { apiGet, apiPost } from './client'

export const getBooking = (code) =>
  apiGet('get_booking', { code })

export const submitOrder = ({ linkId, items, total }) =>
  apiPost('submit_order', { linkId, items, total })
