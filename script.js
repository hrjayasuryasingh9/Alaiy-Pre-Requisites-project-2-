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

async function addToCart(productId, quantity, event) {
  event.stopPropagation();
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You must be logged in to add to cart.");
    return;
  }

  try {
    const response = await fetch(
      `https://electrozone-cqf9.onrender.com/cart/addtocart/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      }
    );

    if (response.status === 201) {
      const data = await response.json();
      console.log("Added to cart:", data.product);
      alert("Product added to cart successfully!");
    } else if (response.status === 401) {
      const err = await response.json();
      alert("Unauthorized: " + err.detail);
    } else if (response.status === 404) {
      const err = await response.json();
      alert("Product not found: " + err.detail);
    } else {
      alert("An unexpected error occurred.");
    }
  } catch (error) {
    console.error("Add to cart failed:", error);
    alert("Failed to add product to cart. Try again later.");
  }
}

async function refreshAccessToken() {
  try {
    const response = await fetch(
      "https://electrozone-cqf9.onrender.com/auth/refresh",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (response.status === 201) {
      const data = await response.json();
      const newAccessToken = data.access_token;

      localStorage.setItem("access_token", newAccessToken);

      console.log("Access token refreshed successfully.");
      return newAccessToken;
    } else {
      const error = await response.json();
      console.warn("Refresh failed:", error.detail);
      return null;
    }
  } catch (error) {
    console.error("Network error during token refresh:", error);
    return null;
  }
}
