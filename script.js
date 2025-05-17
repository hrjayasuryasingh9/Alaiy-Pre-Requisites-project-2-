document.addEventListener("DOMContentLoaded", () => {
  const dropdownMenu = document.getElementById("dropdownMenu");
  const nav_cart = document.querySelector(".fa-cart-shopping");
  const token = localStorage.getItem("access_token");

  dropdownMenu.innerHTML = "";

  if (token) {
    dropdownMenu.innerHTML += `
      <li>
        <a href="Orderpage.html"><i class="fa-solid fa-list-check"></i> My Orders</a>
      </li>
      <li>
        <a onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
      </li>
    `;
  } else {
    dropdownMenu.innerHTML += `
      <li>
        <a href="login.html"><i class="fa-solid fa-right-from-bracket"></i> Login</a>
      </li>
    `;
    nav_cart.style.display = "none";
  }
});

const userIcon = document.getElementById("userIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

userIcon.addEventListener("click", function (e) {
  e.preventDefault();
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
});
document.addEventListener("click", function (event) {
  if (
    !userIcon.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.style.display = "none";
  }
});
function handleLogout() {
  localStorage.removeItem("access_token");
  window.location.href = "login.html";
}

async function refreshAccessToken() {
  try {
    const res = await fetch(
      "https://gw4kippdj6.execute-api.ap-southeast-2.amazonaws.com/dev/auth/refresh",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (res.status === 201) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      return data.access_token;
    } else {
      throw new Error("Refresh token expired or invalid");
    }
  } catch (err) {
    console.error("Refresh token error:", err);
    alert("Session expired. Please log in again.");
    localStorage.removeItem("access_token");
    window.location.href = "login.html";
    return null;
  }
}

async function authorizedFetch(url, options = {}, retry = true) {
  const token = localStorage.getItem("access_token");
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  options.credentials = "include";

  const res = await fetch(url, options);

  if ((res.status === 401 || res.status === 404) && retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    options.headers.Authorization = `Bearer ${newToken}`;
    return fetch(url, options);
  }
  return res;
}

async function addToCart(productId, quantity, event) {
  event.stopPropagation();
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Please login before adding to cart");
    return;
  }
  const url = `https://gw4kippdj6.execute-api.ap-southeast-2.amazonaws.com/dev/cart/addtocart/${productId}`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  };

  try {
    const response = await authorizedFetch(url, options);

    if (response.status === 201) {
      const data = await response.json();
      console.log("Added to cart:", data.product);
      alert("✅ Product added to cart successfully!");
    } else if (response.status === 401) {
      const err = await response.json();
      alert("❌ Unauthorized: " + err.detail);
    } else if (response.status === 404) {
      const err = await response.json();
      alert("❌ Product not found: " + err.detail);
    } else {
      alert("❌ An unexpected error occurred.");
    }
  } catch (error) {
    console.error("Add to cart failed:", error);
    alert("❌ Failed to add product to cart. Try again later.");
  }
}
