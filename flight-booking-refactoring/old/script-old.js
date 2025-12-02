// ===================================================================
// РЕАЛЬНИЙ LEGACY-КОД 2011-2013 років — 502 строки чистого жаху
// ===================================================================

var flights = [];
var filteredFlights = [];
var cart = [];
var bookings = [];
var currentSort = "price-asc";
var currentFilters = {
  maxPrice: 5000,
  directOnly: false,
  airline: ""
};

document.addEventListener("DOMContentLoaded", function () {
  flights = flightsData.concat([]);

  if (localStorage.getItem("skyLegacyBookings")) {
    try {
      bookings = JSON.parse(localStorage.getItem("skyLegacyBookings"));
      if (!Array.isArray(bookings)) bookings = [];
    } catch (e) {
      bookings = [];
    }
  }

  filteredFlights = flights.slice(0);
  renderAllFlights();
  updateCartDisplay();
  updateBookingCounter();

  document.getElementById("search-btn").onclick = function () {
    searchFlights();
  };

  document.getElementById("from").onkeypress = function (e) {
    if (e.keyCode == 13) searchFlights();
  };
  document.getElementById("to").onkeypress = function (e) {
    if (e.keyCode == 13) searchFlights();
  };

  document.getElementById("price-filter").oninput = function () {
    document.getElementById("price-value").innerText = this.value;
    currentFilters.maxPrice = parseInt(this.value);
    applyAllFiltersAndSorting();
  };

  document.getElementById("direct-only").onchange = function () {
    currentFilters.directOnly = this.checked;
    applyAllFiltersAndSorting();
  };

  document.getElementById("airline-filter").onchange = function () {
    currentFilters.airline = this.value;
    applyAllFiltersAndSorting();
  };

  document.getElementById("sort").onchange = function () {
    currentSort = this.value;
    applyAllFiltersAndSorting();
  };

  document.getElementById("book-now").onclick = function () {
    processBooking();
  };

  document.getElementById("clear-cart").onclick = function () {
    cart = [];
    updateCartDisplay();
    resetAllAddButtons();
  };

  document.querySelector(".close").onclick = function () {
    document.getElementById("modal").style.display = "none";
  };
  document.getElementById("close-modal").onclick = function () {
    document.getElementById("modal").style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == document.getElementById("modal")) {
      document.getElementById("modal").style.display = "none";
    }
  };
});

function searchFlights() {
  var fromVal = document.getElementById("from").value.trim().toLowerCase();
  var toVal = document.getElementById("to").value.trim().toLowerCase();
  var dateVal = document.getElementById("date").value;

  filteredFlights = flights.filter(function (f) {
    var matchFrom = f.from.toLowerCase().indexOf(fromVal) !== -1;
    var matchTo = f.to.toLowerCase().indexOf(toVal) !== -1;
    var matchDate = dateVal === "" || f.date === dateVal;
    return matchFrom && matchTo && matchDate;
  });

  applyAllFiltersAndSorting();
}

function applyAllFiltersAndSorting() {
  var temp = filteredFlights.slice(0);

  // ціна
  temp = temp.filter(function (f) {
    return f.price <= currentFilters.maxPrice;
  });

  // тільки прямі
  if (currentFilters.directOnly) {
    temp = temp.filter(function (f) {
      return f.stops === 0;
    });
  }

  // авіакомпанія
  if (currentFilters.airline !== "") {
    temp = temp.filter(function (f) {
      return f.airline === currentFilters.airline;
    });
  }

  // сортування
  if (currentSort === "price-asc") {
    temp.sort(function (a, b) { return a.price - b.price; });
  } else if (currentSort === "price-desc") {
    temp.sort(function (a, b) { return b.price - a.price; });
  } else if (currentSort === "duration") {
    temp.sort(function (a, b) {
      var da = convertDurationToMinutes(a.duration);
      var db = convertDurationToMinutes(b.duration);
      return da - db;
    });
  }

  renderAllFlights(temp);
}

function convertDurationToMinutes(dur) {
  var parts = dur.split("г");
  var hours = parseInt(parts[0]);
  var minutesPart = parts[1].replace("хв", "").trim();
  var minutes = minutesPart === "" ? 0 : parseInt(minutesPart);
  return hours * 60 + minutes;
}

function renderAllFlights(list) {
  var container = document.getElementById("flights-list");
  container.innerHTML = "";

  var dataToShow = list || filteredFlights;

  if (dataToShow.length === 0) {
    container.innerHTML = "<p style='grid-column:1/-1;text-align:center;color:#95a5a6;font-size:1.5rem;margin:40px 0;'>Немає рейсів за вашими критеріями</p>";
    return;
  }

  for (var i = 0; i < dataToShow.length; i++) {
    var f = dataToShow[i];

    var card = document.createElement("div");
    card.className = "flight-card";
    card.setAttribute("data-flight-id", f.id);

    var headerDiv = document.createElement("div");
    headerDiv.className = "flight-header";

    var airlineSpan = document.createElement("div");
    airlineSpan.className = "airline";
    airlineSpan.innerText = f.airline;

    var priceSpan = document.createElement("div");
    priceSpan.className = "price";
    priceSpan.innerText = f.price + " грн";

    headerDiv.appendChild(airlineSpan);
    headerDiv.appendChild(priceSpan);

    var infoDiv = document.createElement("div");
    infoDiv.className = "flight-info";
    infoDiv.innerHTML = "<strong>" + f.from + " → " + f.to + "</strong><br>" +
      "Дата: " + formatDateUkrainian(f.date) + "<br>" +
      "Тривалість: " + f.duration + "<br>" +
      "Пересадки: " + (f.stops === 0 ? "без пересадок" : f.stops + " пересад" + (f.stops > 1 ? "ок" : "ка"));

    var button = document.createElement("button");
    button.className = "add-to-cart";
    button.setAttribute("data-id", f.id);
    button.innerText = "Додати в корзину";

    button.onclick = function () {
      var flightId = parseInt(this.getAttribute("data-id"));
      var flight = flights.find(function (x) { return x.id === flightId; });

      if (!flight) return;

      var alreadyInCart = cart.some(function (c) { return c.id === flightId; });
      if (alreadyInCart) {
        alert("Цей рейс вже в корзині!");
        return;
      }

      cart.push(JSON.parse(JSON.stringify(flight))); // deep copy
      updateCartDisplay();

      this.innerText = "Додано!";
      this.disabled = true;
      this.style.backgroundColor = "#27ae60";
      this.style.cursor = "default";
    };

    card.appendChild(headerDiv);
    card.appendChild(infoDiv);
    card.appendChild(button);
    container.appendChild(card);
  }
}

function formatDateUkrainian(dateStr) {
  var months = ["січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var d = new Date(dateStr);
  return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

function updateCartDisplay() {
  var itemsDiv = document.getElementById("cart-items");
  var totalEl = document.getElementById("total-price");
  var countEl = document.getElementById("cart-count");

  if (cart.length === 0) {
    itemsDiv.innerHTML = "<p style='color:#95a5a6;margin:15px 0;'>Корзина порожня</p>";
    totalEl.innerText = "0";
    countEl.innerText = "0";
    return;
  }

  itemsDiv.innerHTML = "";
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    total += item.price;

    var p = document.createElement("p");
    p.style.margin = "8px 0";
    p.innerHTML = item.from + " → " + item.to +
      " | <em>" + item.airline + "</em> — <strong>" + item.price + " грн</strong>";

    var removeBtn = document.createElement("span");
    removeBtn.innerHTML = " ×";
    removeBtn.style.color = "#e74c3c";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.marginLeft = "10px";
    removeBtn.title = "Видалити";
    removeBtn.onclick = (function (id) {
      return function () {
        cart = cart.filter(function (c) { return c.id !== id; });
        updateCartDisplay();
        resetAddButtonIfNeeded(id);
      };
    })(item.id);

    p.appendChild(removeBtn);
    itemsDiv.appendChild(p);
  }

  totalEl.innerText = total;
  countEl.innerText = cart.length;
}

function resetAddButtonIfNeeded(flightId) {
  var btn = document.querySelector('.add-to-cart[data-id="' + flightId + '"]');
  if (btn) {
    btn.innerText = "Додати в корзину";
    btn.disabled = false;
    btn.style.backgroundColor = "";
    btn.style.cursor = "pointer";
  }
}

function resetAllAddButtons() {
  document.querySelectorAll(".add-to-cart").forEach(function (b) {
    b.innerText = "Додати в корзину";
    b.disabled = false;
    b.style.backgroundColor = "";
    b.style.cursor = "pointer";
  });
}

function processBooking() {
  if (cart.length === 0) {
    alert("Корзина порожня! Додайте хоча б один рейс.");
    return;
  }

  var totalPrice = cart.reduce(function (sum, f) { return sum + f.price; }, 0);

  var bookingDetails = "Ваше бронювання №" + Date.now() + "\n\n";
  for (var i = 0; i < cart.length; i++) {
    var f = cart[i];
    bookingDetails += (i + 1) + ". " + f.from + " → " + f.to +
      " (" + f.airline + ") — " + f.price + " грн\n";
  }
  bookingDetails += "\nЗагальна сума: " + totalPrice + " грн\n";
  bookingDetails += "Дата бронювання: " + new Date().toLocaleString("uk-UA");

  var bookingObject = {
    id: Date.now(),
    date: new Date().toLocaleString("uk-UA"),
    flights: cart.slice(0),
    total: totalPrice
  };

  bookings.push(bookingObject);
  localStorage.setItem("skyLegacyBookings", JSON.stringify(bookings));

  var infoDiv = document.getElementById("booking-info");
  infoDiv.innerHTML = bookingDetails.replace(/\n/g, "<br>");

  document.getElementById("modal").style.display = "block";

  cart = [];
  updateCartDisplay();
  resetAllAddButtons();
}

function updateBookingCounter() {
  // просто для майбутнього розширення (історія бронювань)
  // поки що не використовується в UI
}

function renderFlightCard(f) {
  var container = document.getElementById("flights-list");
  var card = document.createElement("div");
  card.className = "flight-card";
  card.innerHTML = "<div class='flight-header'><div class='airline'>" + f.airline + "</div><div class='price'>" + f.price + " грн</div></div>" +
    "<div class='flight-info'><strong>" + f.from + " → " + f.to + "</strong><br>Дата: " + f.date + "<br>Тривалість: " + f.duration + "</div>" +
    "<button class='add-to-cart' data-id='" + f.id + "'>Додати в корзину</button>";
  container.appendChild(card);
}

function renderFlightCard2(f) {
  var container = document.getElementById("flights-list");
  var card = document.createElement("div");
  card.className = "flight-card";
  card.innerHTML = "<div class='flight-header'><div class='airline'>" + f.airline + "</div><div class='price'>" + f.price + " грн</div></div>" +
    "<div class='flight-info'><strong>" + f.from + " → " + f.to + "</strong><br>Дата: " + f.date + "<br>Тривалість: " + f.duration + "</div>" +
    "<button class='add-to-cart' data-id='" + f.id + "'>Додати в корзину</button>";
  container.appendChild(card);
}

function renderFlightCard3(f) {
  var container = document.getElementById("flights-list");
  var card = document.createElement("div");
  card.className = "flight-card";
  card.innerHTML = "<div class='flight-header'><div class='airline'>" + f.airline + "</div><div class='price'>" + f.price + " грн</div></div>" +
    "<div class='flight-info'><strong>" + f.from + " → " + f.to + "</strong><br>Дата: " + f.date + "<br>Тривалість: " + f.duration + "</div>" +
    "<button class='add-to-cart' data-id='" + f.id + "'>Додати в корзину</button>";
  container.appendChild(card);
}

// Магические строки и числа везде
var MAGIC_DISCOUNT = 10;
var MAGIC_VIP_DISCOUNT = 15;
var SUPER_SECRET_ADMIN_CODE = "admin123";

// Функция валидации формы (дублирует логику поиска)
function validateSearchForm() {
  var from = document.getElementById("from").value;
  var to = document.getElementById("to").value;
  if(from === "" || to === "") {
    alert("Заповніть поля Звідки і Куди!");
    return false;
  }
  if(from.toLowerCase() === to.toLowerCase()) {
    alert("Місто вильоту і прильоту не можуть збігатися!");
    return false;
  }
  return true;
}

// Ещё одна копия той же валидации
function checkSearchInputs() {
  var from = document.getElementById("from").value;
  var to = document.getElementById("to").value;
  if(from === "" || to === "") {
    alert("Заповніть поля Звідки і Куди!");
    return false;
  }
  if(from.toLowerCase() === to.toLowerCase()) {
    alert("Місто вильоту і прильоту не можуть збігатися!");
    return false;
  }
  return true;
}

// Супер-длинная функция обработки VIP-клиента
function applyVipDiscountIfPossible() {
  var clientCode = prompt("Введіть код VIP-клієнта (або залиште порожнім):");
  if(clientCode === SUPER_SECRET_ADMIN_CODE) {
    var confirmAdmin = confirm("Ви адмін? Натисніть OK для знижки 50%");
    if(confirmAdmin) {
      for(var i = 0; i < cart.length; i++) {
        cart[i].price = Math.round(cart[i].price * 0.5);
      }
      alert("Знижка 50% застосована!");
      updateCartDisplay();
    }
  } else if(clientCode === "vip2025") {
    for(var i = 0; i < cart.length; i++) {
      cart[i].price = Math.round(cart[i].price * (1 - MAGIC_VIP_DISCOUNT/100));
    }
    alert("VIP-знижка " + MAGIC_VIP_DISCOUNT + "% застосована!");
    updateCartDisplay();
  } else if(clientCode !== "") {
    alert("Невірний код!");
  }
}

// Привязываем VIP-функцию к скрытому событию (как было в старых проектах)
document.body.addEventListener("dblclick", function(e) {
  if(e.altKey && e.shiftKey) {
    applyVipDiscountIfPossible();
  }
});

function logAnalyticsEvent(action, label) {
  console.log("ANALYTICS: " + action + " | " + label + " | " + new Date().toISOString());
  // В старых проектах тут был бы вызов document.write или pixel
}

document.querySelectorAll("button, input, select").forEach(function(el) {
  el.addEventListener("click", function() {
    logAnalyticsEvent("click", this.id || this.className || this.tagName);
  });
  el.addEventListener("change", function() {
    logAnalyticsEvent("change", this.id || this.tagName);
  });
});

// Имитация старого "тяжёлого" скрипта загрузки рекламы
function loadOldBannerAds() {
  var banner = document.createElement("div");
  banner.style.cssText = "background:red;color:white;text-align:center;padding:20px;margin:20px 0;font-size:18px;";
  banner.innerHTML = "АКЦІЯ! Квитки від 999 грн! Телефонуйте 0800-XXX-XXX";
  document.querySelector(".container").insertBefore(banner, document.querySelector(".search"));
  setTimeout(function() { banner.style.opacity = "0.8"; }, 1000);
}

// Запускаем рекламу через 5 секунд после загрузки
setTimeout(loadOldBannerAds, 5000);

// Ещё одна бесполезная анимация (как любили в 2012)
function animateTitle() {
  var title = document.querySelector("h1");
  var colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
  var i = 0;
  setInterval(function() {
    title.style.color = colors[i % colors.length];
    i++;
  }, 800);
}
animateTitle();

// Дублирование обработчиков (потому что "вдруг не сработает")
document.getElementById("search-btn").addEventListener("click", function() {
  if(validateSearchForm() && checkSearchInputs()) {
    searchFlights();
  }
});

// И ещё раз через onclick (на всякий случай)
document.getElementById("search-btn").onclick = function() {
  if(validateSearchForm() && checkSearchInputs()) {
    searchFlights();
  }
};

// Имитация старого "тяжёлого" кэша
var fakeCache = {};
function fakeSlowFunction(data) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(data + " processed");
    }, 100);
  });
}

// Генерация "уникального" ID (как делали в 2012)
function generateUniqueId() {
  return "id_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
}

// Бесконечный цикл проверки (как в старых чатах)
setInterval(function() {
  if(cart.length > 5) {
    console.warn("Увага! Більше 5 квитків у корзині!");
  }
}, 10000);