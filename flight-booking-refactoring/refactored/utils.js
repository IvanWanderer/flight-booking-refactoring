// Утилиты — переиспользуемые чистые функции
export const formatPrice = (price) => price.toLocaleString("uk-UA") + " грн";

export const formatDateUkr = (dateStr) => {
  const months = ["січня","лютого","березня","квітня","травня","червня",
                  "липня","серпня","вересня","жовтня","листопада","грудня"];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const durationToMinutes = (dur) => {
  const [h, m] = dur.split("г").map(s => s.replace("хв","").trim());
  return parseInt(h) * 60 + parseInt(m || 0);
};