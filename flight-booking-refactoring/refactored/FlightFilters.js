import { durationToMinutes } from "./utils.js";

export class FlightFilters {
  constructor() {
    this.filters = { maxPrice: 5000, directOnly: false, airline: "" };
    this.sort = "price-asc";
  }

  setPrice(value) { this.filters.maxPrice = +value; }
  setDirectOnly(value) { this.filters.directOnly = value; }
  setAirline(value) { this.filters.airline = value; }
  setSort(value) { this.sort = value; }

  apply(flights) {
    let result = flights.filter(f => f.price <= this.filters.maxPrice);
    
    if (this.filters.directOnly) result = result.filter(f => f.stops === 0);
    if (this.filters.airline) result = result.filter(f => f.airline === this.filters.airline);

    result.sort((a, b) => {
      switch (this.sort) {
        case "price-asc":  return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "duration":   return durationToMinutes(a.duration) - durationToMinutes(b.duration);
        default: return 0;
      }
    });

    return result;
  }
}