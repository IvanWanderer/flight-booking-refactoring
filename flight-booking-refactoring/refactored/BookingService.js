export class BookingService {
  static save(booking) {
    const bookings = this.loadAll();
    bookings.push({ ...booking, date: new Date().toLocaleString("uk-UA") });
    localStorage.setItem("skyLegacyBookings", JSON.stringify(bookings));
  }

  static loadAll() {
    try {
      const data = localStorage.getItem("skyLegacyBookings");
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }
}