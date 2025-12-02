import { FlightDatabase } from "./FlightDatabase.js";
import { FlightFilters } from "./FlightFilters.js";
import { FlightRenderer } from "./FlightRenderer.js";
import { ShoppingCart } from "./ShoppingCart.js";
import { BookingService } from "./BookingService.js";
import { formatPrice } from "./utils.js";

const db = new FlightDatabase(flightsData);
const filters = new FlightFilters();
const renderer = new FlightRenderer("flights-list");
const cart = new ShoppingCart();

const updateResults = () => {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("date").value;

  let results = db.search({ from, to, date });
  results = filters.apply(results);

  renderer.render(results, (flight, button) => {
    if (cart.add(flight)) {
      button.textContent = "Додано!";
      button.disabled = true;
      button.style.backgroundColor = "#27ae60";
    }
  });
};

document.getElementById("search-btn").addEventListener("click", updateResults);

document.getElementById("price-filter").addEventListener("input", (e) => {
  document.getElementById("price-value").textContent = e.target.value;
  filters.setPrice(e.target.value);
  updateResults();
});

document.getElementById("direct-only").addEventListener("change", (e) => {
  filters.setDirectOnly(e.target.checked);
  updateResults();
});

document.getElementById("airline-filter").addEventListener("change", (e) => {
  filters.setAirline(e.target.value);
  updateResults();
});

document.getElementById("sort").addEventListener("change", (e) => {
  filters.setSort(e.target.value);
  updateResults();
});

document.getElementById("book-now").addEventListener("click", () => {
  if (cart.items.length === 0) return alert("Корзина порожня!");

  const details = cart.items.map((f, i) => 
    `${i+1}. ${f.from} → ${f.to} (${f.airline}) — ${formatPrice(f.price)}`
  ).join("<br>");

  BookingService.save({
    id: Date.now(),
    flights: cart.items,
    total: cart.getTotal()
  });

  document.getElementById("booking-info").innerHTML = 
    "<h3>Бронювання успішне!</h3>" + details + 
    `<br><br>Разом: <strong>${formatPrice(cart.getTotal())}</strong>`;

  document.getElementById("modal").style.display = "block";
  cart.clear();
  updateResults();
});

document.getElementById("clear-cart").addEventListener("click", () => {
  cart.clear();
  updateResults();
});

document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

updateResults();
console.log("main.js loaded, initial render called");