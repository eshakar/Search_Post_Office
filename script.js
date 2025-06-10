let userIP = "";
let userInfo = {};
let postOffices = [];
let filteredPostOffices = [];

// Get user's IP address when page loads
window.onload = function () {
  getUserIP();
};

async function getUserIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    userIP = data.ip;
    document.getElementById("ipAddress").textContent = userIP;
  } catch (error) {
    console.error("Error fetching IP:", error);
    document.getElementById("ipAddress").textContent = "127.0.0.1";
    userIP = "127.0.0.1";
  }
}

function getStarted() {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  fetchUserInfo();
}

async function fetchUserInfo() {
  try {
    const response = await fetch(`https://ipapi.co/${userIP}/json/`);
    const data = await response.json();
    userInfo = data;
    displayUserInfo(data);
    updateMap(data.latitude, data.longitude);
    updateDateTime(data.timezone);
    fetchPostOffices(data.postal);
  } catch (error) {
    console.error("Error fetching user info:", error);
    displayError("Unable to fetch location information");
  }
}

function displayUserInfo(data) {
  document.getElementById("displayIP").textContent = data.ip || userIP;
  document.getElementById("latitude").textContent = data.latitude || "-";
  document.getElementById("longitude").textContent = data.longitude || "-";
  document.getElementById("city").textContent = data.city || "-";
  document.getElementById("region").textContent = data.region || "-";
  document.getElementById("organisation").textContent = data.org || "-";
  document.getElementById("hostname").textContent = data.hostname || "-";
  document.getElementById("timezone").textContent = data.timezone || "-";
  document.getElementById("pincode").textContent = data.postal || "-";
}

function updateMap(lat, lon) {
  if (lat && lon) {
    const mapSrc = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
    document.getElementById("mapFrame").src = mapSrc;
  }
}

function updateDateTime(timezone) {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const localTime = now.toLocaleString("en-GB", options);
    document.getElementById("datetime").textContent = localTime;

    // Update time every second
    setInterval(() => {
      const currentTime = new Date().toLocaleString("en-GB", options);
      document.getElementById("datetime").textContent = currentTime;
    }, 1000);
  } catch (error) {
    document.getElementById("datetime").textContent =
      new Date().toLocaleString();
  }
}

async function fetchPostOffices(pincode) {
  if (!pincode) {
    displayError("No pincode available to fetch post offices");
    return;
  }

  document.getElementById("loadingSpinner").style.display = "block";

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();

    document.getElementById("loadingSpinner").style.display = "none";

    if (data && data[0] && data[0].Status === "Success") {
      postOffices = data[0].PostOffice || [];
      filteredPostOffices = [...postOffices];
      document.getElementById("postcodeCount").textContent = postOffices.length;
      displayPostOffices(filteredPostOffices);
    } else {
      displayError("No post offices found for this pincode");
    }
  } catch (error) {
    document.getElementById("loadingSpinner").style.display = "none";
    console.error("Error fetching post offices:", error);
    displayError("Unable to fetch post office information");
  }
}

function displayPostOffices(offices) {
  const container = document.getElementById("postOfficesContainer");

  if (!offices || offices.length === 0) {
    container.innerHTML =
      '<div class="no-results">No post offices found matching your search.</div>';
    return;
  }

  container.innerHTML = offices
    .map(
      (office) => `
                <div class="post-office-card">
                    <div class="field">${office.Name || "N/A"}</div>
                    <div class="field">Branch Type: ${
                      office.BranchType || "N/A"
                    }</div>
                    <div class="field">Delivery Status: ${
                      office.DeliveryStatus || "N/A"
                    }</div>
                    <div class="field">District: ${
                      office.District || "N/A"
                    }</div>
                    <div class="field">Division: ${
                      office.Division || "N/A"
                    }</div>
                    <div class="field">State: ${office.State || "N/A"}</div>
                    <div class="field">Country: ${office.Country || "N/A"}</div>
                </div>
            `
    )
    .join("");
}

function filterPostOffices() {
  const searchTerm = document.getElementById("searchBox").value.toLowerCase();

  if (!searchTerm) {
    filteredPostOffices = [...postOffices];
  } else {
    filteredPostOffices = postOffices.filter(
      (office) =>
        (office.Name && office.Name.toLowerCase().includes(searchTerm)) ||
        (office.BranchType &&
          office.BranchType.toLowerCase().includes(searchTerm))
    );
  }

  displayPostOffices(filteredPostOffices);
}

function displayError(message) {
  const container = document.getElementById("postOfficesContainer");
  container.innerHTML = `<div class="error">${message}</div>`;
}
