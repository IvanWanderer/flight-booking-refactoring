import { formatPrice, formatDateUkr } from "./utils.js";

export class FlightRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(flights, onAddToCart) {
    this.container.innerHTML = "";

    if (flights.length === 0) {
      this.container.innerHTML = "<p class='no-flights'>Рейсів не знайдено</p>";
      return;
    }

    flights.forEach(flight => {
      const card = document.createElement("div");
      card.className = "flight-card";
      card.innerHTML = `
        <div class="flight-header">
          <div class="airline">${flight.airline}</div>
          <div class="price">${formatPrice(flight.price)}</div>
        </div>
        <div class="flight-info">
          <strong>${flight.from} -> ${flight.to}</strong><br>  <!-- Заменил → на -> для совместимости -->
          Дата: ${formatDateUkr(flight.date)}<br>
          Тривалість: ${flight.duration} | 
          Пересадки: ${flight.stops === 0 ? "прямий" : flight.stops + " пересад."}
        </div>
        <button class="add-to-cart" data-id="${flight.id}">
          Додати в корзину
        </button>
      `;

      const button = card.querySelector(".add-to-cart");
      button.addEventListener("click", (e) => onAddToCart(flight, button));

      this.container.appendChild(card);
    });
  }
}