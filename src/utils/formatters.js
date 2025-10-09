
/**
 * Định dạng một số thành chuỗi có dấu phẩy ngăn cách hàng nghìn.
 * @param {number} num - Số cần định dạng.
 * @returns {string} Chuỗi đã được định dạng.
 */
export function formatNumber(num) {
  if (num === null || num === undefined) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
