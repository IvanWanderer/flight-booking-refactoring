// refactored/FlightDatabase.js — улучшенная версия с поддержкой "all"
export class FlightDatabase {
  constructor(data) {
    this.allFlights = structuredClone(data);
  }

  search({ from = "", to = "", date = "" }) {
    return this.allFlights.filter(f => {
      // === Звідки ===
      const matchFrom = from.trim() === "" || 
        f.from.toLowerCase().includes(from.trim().toLowerCase());

      // === Куди — МАГИЯ ЗДЕСЬ ===
      const toLower = to.trim().toLowerCase();
      const isAllKeyword = ["all", "всі", "все", "*", "будь-куди", "any"].includes(toLower);
      
      const matchTo = toLower === "" || 
        isAllKeyword || 
        f.to.toLowerCase().includes(toLower);

      // === Дата ===
      const matchDate = date === "" || f.date === date;

      return matchFrom && matchTo && matchDate;
    });
  }

  getById(id) {
    return this.allFlights.find(f => f.id === id);
  }
}