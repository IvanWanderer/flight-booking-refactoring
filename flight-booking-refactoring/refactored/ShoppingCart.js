import { formatPrice } from "./utils.js";

export class ShoppingCart {
  constructor() {
    this.items = [];
    this.cartItemsEl = document.getElementById("cart-items");
    this.totalEl = document.getElementById("total-price");
    this.countEl = document.getElementById("cart-count");
  }

  add(flight) {
    if (this.items.some(i => i.id === flight.id)) return false;
    this.items.push(flight);
    this.render();
    return true;
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.render();
  }

  clear() {
    this.items = [];
    this.render();
  }

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }

  render() {
    if (this.items.length === 0) {
      this.cartItemsEl.innerHTML = "<p style='color:#999'>Корзина порожня</p>";
      this.totalEl.textContent = "0";
      this.countEl.textContent = "0";
      return;
    }

    this.cartItemsEl.innerHTML = this.items.map(item => `
      <p>
        ${item.from} → ${item.to} | ${item.airline} — <strong>${formatPrice(item.price)}</strong>
        <span class="remove-item" data-id="${item.id}" style="color:#e74c3c;cursor:pointer;margin-left:10px">×</span>
      </p>
    `).join("");

    this.totalEl.textContent = this.getTotal();
    this.countEl.textContent = this.items.length;

    // обработчики удаления
    this.cartItemsEl.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => this.remove(+btn.dataset.id));
    });
  }
}